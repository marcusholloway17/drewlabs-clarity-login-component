import { Inject, Injectable, OnDestroy } from "@angular/core";
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivateChild,
  CanLoad,
  Route,
} from "@angular/router";
import { Observable, Subject } from "rxjs";
import { map } from "rxjs";
import { AUTH_SERVICE } from "../constants";
import { AuthServiceInterface } from "../contracts";

@Injectable()
export class AuthGuardService
  implements CanActivate, CanActivateChild, CanLoad, OnDestroy
{
  // tslint:disable-next-line: variable-name
  private _destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    @Inject(AUTH_SERVICE) private auth: AuthServiceInterface
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.checkAuthStatus(state.url);
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.canActivate(route, state);
  }

  canLoad(route: Route): Observable<boolean> {
    return this.checkAuthStatus(`/${route.path}`);
  }

  checkAuthStatus(url: string): Observable<boolean> {
    return this.auth.signInState$.pipe(
      map((state) => {
        return state && state.authToken ? true : false;
      })
    );
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }
}

@Injectable()
export class AuthorizationsGuard implements CanActivate {
  constructor(
    private router: Router,
    @Inject(AUTH_SERVICE) private auth: AuthServiceInterface
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const url: string = state.url;
    return this.isAuthorized(next.data.authorizations, url);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> | Promise<boolean> {
    return this.canActivate(childRoute, state);
  }

  canLoad(route: Route): boolean | Observable<boolean> | Promise<boolean> {
    const url = `/${route.path}`;
    return this.isAuthorized(route.data?.authorizations, url);
  }

  private isAuthorized(
    authorizations: string[] | string,
    url: string
  ): Observable<boolean> | boolean | Promise<boolean> {
    return true;
  }
}
