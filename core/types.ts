import { Injector } from "@angular/core";

/**
 * @internal
 */
export type Callback = (...args: any) => unknown;

/**
 * @internal
 */
export type ActionHandlersObjectType = {
  success: Callback;
  failure: Callback;
  error: Callback;
  performingAction?: Callback;
  loginPath?: string;
};

/**
 * Action handlers object type declaration
 */
export type ActionHandlersType =
  | ActionHandlersObjectType
  | ((injector: Injector) => ActionHandlersObjectType);
