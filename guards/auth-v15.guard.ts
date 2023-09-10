import { inject } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
} from "@angular/router";
import { map, mergeMap, timer } from "rxjs";
import { AUTH_SERVICE } from "../constants";

/**
 * @internal
 */
function matchAny(scopes: string[], appScopes: string[]) {
  const _scopes = Array.isArray(appScopes) ? appScopes : [appScopes];
  let exists = false;
  for (const scope of _scopes) {
    // We break the loop for the first scope that exist
    // in authorization token scopes
    if (scopes.indexOf(scope) !== -1) {
      exists = true;
      break;
    }
  }
  return exists;
}

/**
 * @internal
 */
function match(scopes: string[], appScopes: string[]) {
  const _scopes = Array.isArray(appScopes) ? appScopes : [appScopes];
  let exists = true;
  for (const scope of _scopes) {
    // We check for any missing scope from authorized token scopes
    if (scopes.indexOf(scope) === -1) {
      exists = false;
      break;
    }
  }
  return exists;
}

/**
 * Activate guard functional interface
 */
export const canActivate: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const auth = inject(AUTH_SERVICE);
  return timer(300).pipe(
    mergeMap(() =>
      auth.signInState$.pipe(
        map((state) => (state?.authToken ? true : false)),
        map((signedIn) =>
          signedIn ? signedIn : router.createUrlTree(["/login"])
        )
      )
    )
  );
};

/**
 * Angular child route activation guard
 */
export function canActivateChild(
  childRoute: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) {
  const router = inject(Router);
  const auth = inject(AUTH_SERVICE);
  return timer(300).pipe(
    mergeMap(() =>
      auth.signInState$.pipe(
        map((state) => (state?.authToken ? true : false)),
        map((signedIn) =>
          signedIn ? signedIn : router.createUrlTree(["/login"])
        )
      )
    )
  );
}

/**
 * Funtional interface applied to canActivate guard that checks if connected user
 * token has any of the provided scopes in the guard
 */
export function tokenCanAnyActivate(
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) {
  const router = inject(Router);
  const auth = inject(AUTH_SERVICE);
  return timer(300).pipe(
    mergeMap(() =>
      auth.signInState$.pipe(
        map((state) => state?.scopes ?? []),
        map((scopes) => {
          const _scopes = route?.data
            ? route?.data["authorizations"] ?? route?.data["scopes"]
            : [];
          return matchAny(scopes, _scopes);
        }),
        map((result) => (result ? result : router.createUrlTree(["/login"])))
      )
    )
  );
}

/**
 * Funtional interface applied to canActivate guard that checks if connected user
 * token has all of the provided scopes in the guard
 */
export function tokenCanActivate(
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) {
  const router = inject(Router);
  const auth = inject(AUTH_SERVICE);
  return timer(300).pipe(
    mergeMap(() =>
      auth.signInState$.pipe(
        map((state) => state?.scopes ?? []),
        map((scopes) => {
          const _scopes = route?.data
            ? route?.data["authorizations"] ?? route?.data["scopes"]
            : [];
          return match(scopes, _scopes);
        }),
        map((result) => (result ? result : router.createUrlTree(["/login"])))
      )
    )
  );
}

/**
 * Funtional interface applied to canMatch angular guard that checks if user token
 * has some given scopes
 */
export function tokenCanAnyMatch(route: Route, segments: UrlSegment[]) {
  const router = inject(Router);
  const auth = inject(AUTH_SERVICE);
  return timer(300).pipe(
    mergeMap(() =>
      auth.signInState$.pipe(
        map((state) => {
          const { scopes, authToken } = state ?? {};
          const _scopes = route?.data
            ? route?.data["authorizations"] ?? route?.data["scopes"]
            : [];
          return authToken && matchAny(scopes ?? [], _scopes);
        }),
        map((result) => (result ? result : router.createUrlTree(["/login"])))
      )
    )
  );
}

/**
 * Funtional interface applied to canMatch angular guard that checks if user token
 * has all provided scopes
 */
export function tokenCanMatch(route: Route, segments: UrlSegment[]) {
  const router = inject(Router);
  const auth = inject(AUTH_SERVICE);
  return timer(300).pipe(
    mergeMap(() =>
      auth.signInState$.pipe(
        map((state) => {
          const { scopes, authToken } = state ?? {};
          const _scopes = route?.data
            ? route?.data["authorizations"] ?? route?.data["scopes"]
            : [];
          return authToken && match(scopes ?? [], _scopes);
        }),
        map((result) => (result ? result : router.createUrlTree(["/login"])))
      )
    )
  );
}
