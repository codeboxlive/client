import {
  IFluidTenantInfo,
  IFluidTokenRequestBody,
  IFluidTokenInfo,
  IFluidContainerInfo,
  ISetFluidContainerIdRequestBody,
  INtpTimeInfo,
  IUserRolesInfo,
  IUserRolesMessageBody,
  IRegisterClientIdInfo,
  IFluidRequests,
  UserRole,
  ContainerState,
} from "@codeboxlive/hub-interfaces";
import { IProject, isFluidTokenResponse, isProjectResponse } from "@/models";

function isTenantInfo(value: any): value is IFluidTenantInfo {
  return [
    typeof value?.tenantId === undefined || typeof value?.tenantId === "string",
    value?.type === "remote" || value?.type === "local",
    typeof value?.serviceEndpoint === "string",
  ].every((isTrue) => isTrue);
}

function isNptTime(value: any): value is INtpTimeInfo {
  return [
    typeof value?.ntpTime === "string",
    typeof value?.ntpTimeInUTC === "number",
  ].every((isTrue) => isTrue);
}

export class FluidService {
  constructor(
    private readonly userId: string,
    private readonly currentProject: IProject
  ) {}

  toFluidRequests(): IFluidRequests {
    return {
      getTenantInfo: this.getTenantInfo.bind(this),
      getFluidToken: this.getFluidToken.bind(this),
      getFluidContainerId: this.getFluidContainerId.bind(this),
      setFluidContainerId: this.setFluidContainerId.bind(this),
      getNtpTime: this.getNtpTime.bind(this),
      registerClientId: this.registerClientId.bind(this),
      getUserRoles: this.getUserRoles.bind(this),
    };
  }

  async getTenantInfo(): Promise<IFluidTenantInfo> {
    return await FluidService.getTenantInfo();
  }
  static async getTenantInfo(): Promise<IFluidTenantInfo> {
    const response = await fetch("/api/fluid/tenant-info/get", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
    if (isTenantInfo(response)) {
      return {
        ...response,
        // Return empty strings for deprecated endpoints
        ordererEndpoint: "",
        storageEndpoint: "",
      };
    }
    throw Error("FluidService.getTenantInfo: invalid response");
  }
  async getFluidToken(body: IFluidTokenRequestBody): Promise<IFluidTokenInfo> {
    return await FluidService.getFluidToken(body);
  }
  static async getFluidToken(
    body: IFluidTokenRequestBody
  ): Promise<IFluidTokenInfo> {
    const response = await fetch("/api/fluid/token/get", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).then((res) => res.json());
    if (!isFluidTokenResponse(response)) {
      throw new Error("FluidService.getFluidToken: invalid response");
    }
    return response;
  }
  async getFluidContainerId(): Promise<IFluidContainerInfo> {
    if (this.currentProject.sandboxContainerId) {
      return Promise.resolve({
        containerId: this.currentProject.sandboxContainerId,
        shouldCreate: false,
        containerState: ContainerState.alreadyExists,
        retryAfter: 100,
      });
    }
    const response = await fetch("/api/projects/get", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        projectId: this.currentProject._id,
      }),
    }).then((res) => res.json());
    if (!isProjectResponse(response)) {
      throw new Error("FluidService.getFluidContainerId: invalid response");
    }
    const { project } = response;
    const shouldCreate = !project.sandboxContainerId;
    return {
      containerId: project.sandboxContainerId,
      shouldCreate: !project.sandboxContainerId,
      containerState: shouldCreate
        ? ContainerState.notFound
        : ContainerState.alreadyExists,
      retryAfter: 100,
    };
  }
  async setFluidContainerId(
    body: ISetFluidContainerIdRequestBody
  ): Promise<IFluidContainerInfo> {
    if (this.currentProject.sandboxContainerId) {
      return Promise.resolve({
        containerId: this.currentProject.sandboxContainerId,
        shouldCreate: false,
        containerState: ContainerState.alreadyExists,
        retryAfter: 100,
      });
    }
    const projectResponse = await fetch("/api/projects/set", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        _id: this.currentProject._id,
        sandboxContainerId: body.containerId,
      }),
    }).then((res) => res.json());
    if (!isProjectResponse(projectResponse)) {
      throw new Error("useCodeboxLiveProjects.setProject: invalid response");
    }
    const { project } = projectResponse;
    return {
      containerId: project.sandboxContainerId,
      shouldCreate: !project.sandboxContainerId,
      containerState: ContainerState.added,
      retryAfter: 100,
    };
  }
  async getNtpTime(): Promise<INtpTimeInfo> {
    const response = await fetch("/api/fluid/npt-time/get", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
    if (isNptTime(response)) {
      return response;
    }
    throw Error("FluidService.getNtpTime: invalid response");
  }
  async registerClientId(
    body: IUserRolesMessageBody
  ): Promise<IRegisterClientIdInfo> {
    return Promise.resolve({
      userRoles: [
        UserRole.organizer,
        UserRole.presenter,
        UserRole.attendee,
        UserRole.guest,
      ],
    });
  }
  async getUserRoles(body: IUserRolesMessageBody): Promise<IUserRolesInfo> {
    return Promise.resolve({
      userRoles: [
        UserRole.organizer,
        UserRole.presenter,
        UserRole.attendee,
        UserRole.guest,
      ],
    });
  }
}
