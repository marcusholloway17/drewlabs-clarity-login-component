import { InjectionToken } from "@angular/core";
import { AuthClientConfig } from "../contracts";

export const AUTH_CLIENT_CONFIG =
  new InjectionToken<AuthClientConfig>("AUTH CLIENT CONFIG");
