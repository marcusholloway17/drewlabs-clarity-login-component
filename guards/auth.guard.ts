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
import { interval, Observable, Subject, takeUntil, tap } from "rxjs";
import { map } from "rxjs";
import { AUTH_SERVICE } from "../constants";
import { AuthServiceInterface } from "../contracts";

@Injectable()
export class AuthGuardService
  implements CanActivate, CanActivateChild, CanLoad, OnDestroy
{
  // tslint:disable-next-line: variable-name
  private _destroy$ = new Subject<void>();
  private _signedIn = false;

  constructor(
    private router: Router,
    @Inject(AUTH_SERVICE) private auth: AuthServiceInterface
  ) {
    this.auth.signInState$
      .pipe(
        takeUntil(this._destroy$),
        tap((state) => {
          this._signedIn = state ? true : false;
        })
      )
      .subscribe();
  }

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
    // Simulating a timeout for signin result to be available
    return interval(100).pipe(
      map(() => {
        if (!this._signedIn) {
          this.router.navigateByUrl("/login");
        }
        return this._signedIn;
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
    return this.isAuthorized(next.data["authorizations"], url);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> | Promise<boolean> {
    return this.canActivate(childRoute, state);
  }

  canLoad(route: Route): boolean | Observable<boolean> | Promise<boolean> {
    const url = `/${route.path}`;
    return this.isAuthorized(
      route?.data ? route?.data["authorizations"] : [],
      url
    );
  }

  private isAuthorized(
    authorizations: string[] | string,
    url: string
  ): Observable<boolean> | boolean | Promise<boolean> {
    return true;
  }
}
