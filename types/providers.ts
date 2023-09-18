import { Injector } from "@angular/core";
import { AuthServiceConfig } from "./auth";
import { Router } from "@angular/router";
import { AuthClientConfig } from "../core/strategies/local/types";

/**
 * Auth service configuration provider type declaration
 */
export type ProvideAuthServiceConfig = (
  injector: Injector
) => AuthServiceConfig;

/**
 * Auth clients providers type definition
 */
// export type ProvideAuthClientConfig = (injector: Injector) => AuthClientConfig;

/**
 * Auth action handlers providers
 */
export type ProvideActionHandlers = (router: Router) => void;
