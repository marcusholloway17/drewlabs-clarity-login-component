import { Injector } from "@angular/core";
import { Router } from "@angular/router";
import { first, timer } from "rxjs";

/**
 * @internal
 */
type Callback = (...args: any) => unknown;

/**
 * @internal
 */
type ActionHandlersObjectType = {
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

/**
 * Provides a factory function for authentication action handlers
 */
export function provideAuthActionHandlersFactory(handlers: ActionHandlersType) {
  return (injector: Injector, router: Router) => {
    const _handlers =
      typeof handlers === "function" && handlers !== null
        ? handlers(injector)
        : handlers;
    const {
      success,
      failure: fail,
      error,
      performingAction,
      loginPath,
    } = _handlers;
    return {
      onAuthenticationFailure: fail,
      onAuthenticaltionSuccessful: success,
      onPerformingAction: performingAction ?? (() => {}),
      onError:
        error ??
        ((err?: unknown) => {
          console.error("Authentication request Error: ", err);
        }),
      onLogout: () => {
        timer(300)
          .pipe(first())
          .subscribe(() => router.navigate([loginPath ?? "login"]));
      },
    };
  };
}
