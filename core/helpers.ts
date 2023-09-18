import { first, timer } from "rxjs";
import { RequiredProp, SignInResultInterface } from "../types";
import { ActionHandlersType } from "./types";
import { Injector } from "@angular/core";
import { Router } from "@angular/router";

/**
 * @description Get the host part of a given URL
 *
 * @param url Url from which to generate the base path from
 */
export const host = (url: string) => {
  if (url) {
    const url_ = new URL(url);
    url = `${url_.protocol}//${url_.host}`;
    return `${`${url.endsWith("/") ? url.slice(0, -1) : url}`}`;
  }
  return url ?? "";
};

/**
 * Checks if the sign token has all of provided scopes
 *
 * ```ts
 * const result = tokenCan({scopes: ['sys:users:list', 'sys:users:create']}, 'sys:all', 'sys:users:list'); // false
 * const result = tokenCan({scopes: ['sys:users:list', 'sys:users:create']}, 'sys:users:create', 'sys:users:list'); // true
 * ```
 *
 * @param signInResult
 * @param scopes
 * @returns
 */
export function tokenCan(
  signInResult: RequiredProp<SignInResultInterface, "scopes">,
  ...scopes: string[]
) {
  // Case the list of scopes is not provided we simply return true
  if (scopes.length === 0) {
    return true;
  }

  // Check for scopes and return result
  let result = true;
  const _scopes = signInResult.scopes ?? [];

  for (const scope of scopes) {
    if (_scopes.indexOf(scope) === -1) {
      result = false;
      break;
    }
  }
  return result;
}

/**
 * Checks if the sign token has any of provided scopes
 *
 * ```ts
 * const result = tokenCan({scopes: ['sys:users:list', 'sys:users:create']}, 'sys:all', 'sys:users:list'); // true
 * const result = tokenCan({scopes: ['sys:users:list', 'sys:users:create']}, 'sys:users:create', 'sys:users:list'); // true
 * const result = tokenCan({scopes: ['sys:users:list', 'sys:users:create']}, 'sys:all'); // true
 * ```
 *
 * @param signInResult
 * @param scopes
 * @returns
 */
export function tokenCanAny(
  signInResult: RequiredProp<SignInResultInterface, "scopes">,
  ...scopes: string[]
) {
  // Case the list of scopes is not provided we simply return true
  if (scopes.length === 0) {
    return true;
  }

  // Check for scopes and return result
  let result = false;
  const _scopes = signInResult.scopes ?? [];

  for (const scope of scopes) {
    if (_scopes.indexOf(scope) !== -1) {
      result = true;
      break;
    }
  }
  return result;
}

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
