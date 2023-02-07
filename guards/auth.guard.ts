import { Inject, Injectable, OnDestroy } from "@angular/core";
import {
  ActivatedRouteSnapshot, CanActivate, CanActivateChild,
  CanLoad,
  Route, Router, RouterStateSnapshot
} from "@angular/router";
import { interval, map, Observable, Subject, takeUntil, tap } from "rxjs";
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
