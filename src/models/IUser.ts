import { PresenceState, UserMeetingRole } from "@microsoft/live-share";
import { ICursor } from "./Cursor";

export interface IFluidUser {
  userId: string;
  name: string;
  state: PresenceState;
  isLocal: boolean;
  currentPageKey?: string;
  cursor?: ICursor;
  roles?: UserMeetingRole[];
}

/**
 * Auth0 user info that is public information
 */
export interface IPublicUserInfo {
  /**
   * Unique user identifier
   */
  sub: string;
  /**
   * Full name.
   * 
   * @remarks
   * If user has not set their name yet, this will be their email.
   */
  name: string;
  /**
   * Last name.
   */
  family_name?: string;
  /**
   * First name.
   */
  given_name?: string;
  /**
   * Profile picture URL.
   * 
   * @remarks
   * Default value is a gravatar.
   */
  picture?: string;
}

export interface IPrivateUserInfo extends IPublicUserInfo {
  email?: string;
  phone_number?: string;
  tid?: string;
}

export interface IPrivateUserInfoExt extends IPrivateUserInfo {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
