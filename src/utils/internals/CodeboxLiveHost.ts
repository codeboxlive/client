import { FluidService } from "@/hooks/sandpack/FluidService";
import { IAzureAudience } from "@fluidframework/azure-client";
import {
  AzureLiveShareHost,
  IClientInfo,
  IFluidContainerInfo,
  IFluidTenantInfo,
  ILiveShareHost,
  INtpTimeInfo,
  UserMeetingRole,
} from "@microsoft/live-share";

export class CodeboxLiveHost implements ILiveShareHost {
  private _fluidService: FluidService;
  private _azureHost: AzureLiveShareHost;
  constructor(fluidService: FluidService) {
    this._fluidService = fluidService;
    this._azureHost = AzureLiveShareHost.create();
  }
  async getFluidTenantInfo(): Promise<IFluidTenantInfo> {
    return await this._fluidService.getTenantInfo();
  }
  async getFluidToken(containerId?: string | undefined): Promise<string> {
    return (
      await this._fluidService.getFluidToken({
        containerId,
      })
    ).token;
  }
  getFluidContainerId(): Promise<IFluidContainerInfo> {
    return this._azureHost.getFluidContainerId();
  }
  setFluidContainerId(containerId: string): Promise<IFluidContainerInfo> {
    return this._azureHost.setFluidContainerId(containerId);
  }
  getNtpTime(): Promise<INtpTimeInfo> {
    return this._fluidService.getNtpTime();
  }
  registerClientId(clientId: string): Promise<UserMeetingRole[]> {
    return this._azureHost.registerClientId(clientId);
  }
  getClientRoles(clientId: string): Promise<UserMeetingRole[] | undefined> {
    return this._azureHost.getClientRoles(clientId);
  }
  getClientInfo(clientId: string): Promise<IClientInfo | undefined> {
    return this._azureHost.getClientInfo(clientId);
  }
  /**
   * This function should be called immediately after getting audience from `AzureClient`.
   * @param audience Azure Audience
   */
  public setAudience(audience: IAzureAudience) {
    this._azureHost.setAudience(audience);
  }
}
