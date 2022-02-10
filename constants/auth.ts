import { InjectionToken } from "@angular/core";
import { AuthActionHandlers, AuthServiceConfig, AuthServiceInterface } from "../contracts";

export const ERR_LOGIN_STRATEGY_NOT_FOUND = "AUTH STRATEGY NOT FOUND";
export const ERR_NOT_LOGGED_IN = "NOT LOGGED IN";
export const ERR_NOT_INITIALIZED =
  "AUTH STRATEGIES ARE NOT YET READY. CHEK YOUR CONSOLE FOR ERRORS?";
export const ERR_NOT_SUPPORTED_FOR_REFRESH_TOKEN =
  "CHOOSEN PROVIDER DOES NOT SUPPORT REFRESHING TOKEN";

export const AUTH_SERVICE_CONFIG = new InjectionToken<AuthServiceConfig>(
  "AuthServiceConfig instance injection token"
);

export const AUTH_SERVICE = new InjectionToken<AuthServiceInterface>(
  "AuthServiceInterface instance injection token"
); //

export const AUTH_ACTION_HANDLERS = new InjectionToken<AuthActionHandlers>(
  "AuthResultHandlers instance injection token"
);

export enum AuthActions {
  ONGOING = 0,
  COMPLETE = 1,
  FAILED = 2,
}
