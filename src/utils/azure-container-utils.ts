import { IFluidTenantInfo } from "@codeboxlive/hub-interfaces";
import {
  AzureClient,
  AzureRemoteConnectionConfig,
} from "@fluidframework/azure-client";
import axios from "axios";
import {
  ITokenProvider,
  ITokenResponse,
} from "@fluidframework/routerlicious-driver";
import {
  LiveEvent,
  LivePresence,
  LiveShareRuntime,
  LiveState,
  getLiveShareContainerSchemaProxy,
} from "@microsoft/live-share";
import {
  ContainerSchema,
  IFluidContainer,
  SharedMap,
  SharedString,
} from "fluid-framework";
import { IFollowModeStateValue, IProject } from "../models";
import { CodeboxLiveHost } from "./internals";
import { HostTimestampProvider } from "@microsoft/live-share/bin/HostTimestampProvider";
import { FluidService } from "@/hooks/sandpack/FluidService";

/**
 * Token Provider implementation for connecting to an Azure Function endpoint for
 * Azure Fluid Relay token resolution.
 */
class AzureTokenProvider implements ITokenProvider {
  /**
   * Creates a new instance using configuration parameters.
   */
  constructor(
  ) {}

  public async fetchOrdererToken(
    tenantId: string,
    documentId?: string
  ): Promise<ITokenResponse> {
    return {
      jwt: await this.getToken(tenantId, documentId),
    };
  }

  public async fetchStorageToken(
    tenantId: string,
    documentId: string
  ): Promise<ITokenResponse> {
    return {
      jwt: await this.getToken(tenantId, documentId),
    };
  }

  private async getToken(
    tenantId: string,
    documentId: string | undefined
  ): Promise<string> {
    const response = await FluidService.getFluidToken({
      containerId: documentId,
    });
    return response.token;
  }
}

async function getTenantInfo(userId: string): Promise<IFluidTenantInfo> {
  return await FluidService.getTenantInfo();
}

async function getConnection(
  userId: string
): Promise<AzureRemoteConnectionConfig> {
  const tenantInfo = await getTenantInfo(userId);
  if (!tenantInfo?.tenantId) {
    throw Error(
      "azure-container-utils.getConnection: no tenantId found in response"
    );
  }
  const connection: AzureRemoteConnectionConfig = {
    type: "remote",
    tenantId: tenantInfo.tenantId,
    tokenProvider: new AzureTokenProvider(),
    endpoint: tenantInfo.serviceEndpoint,
  };
  return connection;
}

function getContainerSchema(runtime?: LiveShareRuntime): ContainerSchema {
  const schema: ContainerSchema = {
    initialObjects: {
      codePagesMap: SharedMap,
      sandpackObjectsMap: SharedMap,
      followModeState: LiveState<IFollowModeStateValue | undefined>,
      presence: LivePresence,
    },
    dynamicObjectTypes: [SharedMap, SharedString],
  };
  // If runtime is not provided, we assume we are attaching the container without connecting to it
  if (!runtime) {
    return schema;
  }
  return getLiveShareContainerSchemaProxy(schema, runtime);
}

export async function createAzureContainer(
  userId: string,
  getInitialFiles: () => Promise<Map<string, string>>
): Promise<{
  container: IFluidContainer;
  containerId: string;
  services: any;
  created: boolean;
}> {
  const connection = await getConnection(userId);
  // Define container callback (optional).
  // * This is only called once when the container is first created.
  const onFirstInitialize = async (
    container: IFluidContainer
  ): Promise<void> => {
    console.log("azure-container-utils createNewContainer: onFirstInitialize");
    try {
      const initialFiles = await getInitialFiles();
      const keys = [...initialFiles.keys()];
      const codePagesMap = container.initialObjects.codePagesMap as SharedMap;
      for (let i = 0; i < initialFiles.size; i++) {
        const key = keys[i];
        const sharedString = await container.create(SharedString);
        codePagesMap.set(key, sharedString.handle);
        sharedString.insertText(0, initialFiles.get(key)!);
      }
      return Promise.resolve();
    } catch (err: any) {
      console.error(err);
      return Promise.reject(err);
    }
  };

  const client = new AzureClient({
    connection,
  });
  
  const schema = getContainerSchema();
  const results = await client.createContainer(schema);
  const { container } = results;

  console.log("azure-container-utils createNewContainer: attaching");
  const connectedPromise = new Promise<void>((resolve) => {
    const onConnected = () => {
      container.off("connected", onConnected);
      resolve();
    };
    container.on("connected", onConnected);
  });
  await onFirstInitialize(container);
  const containerId = await container.attach();
  console.log(
    "azure-container-utils createNewContainer: attached with id",
    containerId
  );
  await connectedPromise;
  console.log("azure-container-utils createNewContainer: connected");

  console.log("azure-container-utils createNewContainer: returning");
  return Promise.resolve({
    ...results,
    containerId,
    created: true,
  });
}

export async function getAzureContainer(
  userId: string,
  currentProject: IProject
): Promise<
  | {
      container: IFluidContainer;
      services: any;
      created: boolean;
    }
  | undefined
> {
  if (!currentProject.containerId) {
    return Promise.reject(
      new Error(
        "getAzureContainer: cannot call this method with project with undefined containerId"
      )
    );
  }

  // Setup AzureClient
  const connection = await getConnection(userId);
  console.log("azure-container-utils: getAzureContainer: got connection");
  const client = new AzureClient({
    connection,
  });
  // Get the container
  const fluidService = new FluidService(
    userId,
    currentProject!
  );
  const host = new CodeboxLiveHost(fluidService);
  const runtime = new LiveShareRuntime(host);
  const schema = getContainerSchema(runtime);
  await runtime.start();

  console.log("azure-container-utils: getAzureContainer: getting container");
  const results = await client.getContainer(currentProject.containerId, schema);
  runtime.setAudience(results.services.audience);
  host.setAudience(results.services.audience);
  console.log("azure-container-utils: getAzureContainer: connected");
  return Promise.resolve({
    ...results,
    created: false,
  });
}
