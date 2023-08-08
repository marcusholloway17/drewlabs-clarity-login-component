import { InjectionToken } from "@angular/core";
import { AuthClientConfig } from "./types";

/**
 * Auth client provider token
 */
export const AUTH_CLIENT_CONFIG = new InjectionToken<AuthClientConfig>(
  "AUTH CLIENT CONFIG"
);
