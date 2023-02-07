import { Inject, Injectable, OnDestroy } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  CanLoad,
  Route,
  Router,
  RouterStateSnapshot
} from "@angular/router";
import { interval, map, Observable, Subject, take, takeUntil, tap } from "rxjs";
import { AUTH_SERVICE } from "../constants";
import { AuthServiceInterface } from "../contracts";
import { TokenGuardType } from "../contracts/guards";

@Injectable()
export class ScopeGuard
  implements CanActivate, CanActivateChild, CanLoad, OnDestroy, TokenGuardType
{
  // #region Component properties
  private _destroy$ = new Subject<void>();
  private _scopes: string[] = [];
  // #endregion Component properties

  /**
   * Creates guard instance
   *
   * @param router
   * @param auth
   */
  constructor(
    private router: Router,
    @Inject(AUTH_SERVICE) private auth: AuthServiceInterface
  ) {
    this.auth.signInState$
      .pipe(
        tap((state) => {
          if (state) {
            this._scopes = state.scopes ?? ([] as string[]);
            // TODO: Check if the sope contains the information required
          }
        }),
        takeUntil(this._destroy$)
      )
      .subscribe();
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const url: string = state.url;
    return this.tokenCan(next.data["authorizations"], url);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> | Promise<boolean> {
    return this.canActivate(childRoute, state);
  }

  canLoad(route: Route): boolean | Observable<boolean> | Promise<boolean> {
    const url = `/${route.path}`;
    const abilities = route?.data ? route?.data["authorizations"] : [];
    return this.tokenCan(abilities, url);
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  /**
   * Provides an intereface to check if the token has a given scope in a list
   * of scopes provided by application developper
   *
   * @param scopes
   * @param redirectTo
   */
  tokenCan(scopes: string[] | string, redirectTo?: string) {
    const observable$ = interval(100).pipe(
      take(1),
      map(() => {
        scopes = Array.isArray(scopes) ? scopes : [scopes];
        let authorized = true;
        for (const scope of scopes) {
          // We check for any missing scope from authorized token scopes
          if (this._scopes.indexOf(scope) === -1) {
            authorized = false;
            break;
          }
        }
        if (!authorized && redirectTo) {
          this.router.navigateByUrl(redirectTo);
        }
        return authorized;
      })
    );
    return observable$;
  }
}
