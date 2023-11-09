import { IFluidTenantInfo, INtpTimeInfo } from "@microsoft/live-share";

export function isTenantInfo(value: any): value is IFluidTenantInfo {
  return [
    typeof value?.tenantId === undefined || typeof value?.tenantId === "string",
    value?.type === "remote" || value?.type === "local",
    typeof value?.serviceEndpoint === "string",
  ].every((isTrue) => isTrue);
}

export function isNptTime(value: any): value is INtpTimeInfo {
  return [
    typeof value?.ntpTime === "string",
    typeof value?.ntpTimeInUTC === "number",
  ].every((isTrue) => isTrue);
}

export interface IGetFluidTokenBody {
  containerId?: string;
}

export function isGetFluidTokenBody(value: any): value is IGetFluidTokenBody {
  return (
    typeof value?.containerId === "string" || value?.containerId === undefined
  );
}

export interface IFluidTokenResponse {
    token: string;
}

export function isFluidTokenResponse(value: any): value is IFluidTokenResponse {
    return typeof value?.token === "string";
}
