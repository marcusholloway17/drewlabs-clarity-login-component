import { Inject, Injectable, OnDestroy } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivateChild,
  CanLoad,
  Route,
} from '@angular/router';
import { interval, Observable, Subject } from 'rxjs';
import { AUTH_SERVICE } from '../constants';
import { AuthServiceInterface, SignInResultInterface } from '../contracts';
import { takeUntil, tap, map, first } from 'rxjs/operators';
import { tokenCan, tokenCanAny } from '../core/helpers';

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
    return interval(300).pipe(
      first(),
      map(() => {
        if (!this._signedIn) {
          this.router.navigateByUrl('/login');
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
export class TokenCanGuard implements CanActivate {
  // #region Class properties
  private _destroy$ = new Subject<void>();
  private _signInResult!: Required<SignInResultInterface>;
  // #endregion Class properties

  /**
   * Creates new class instance
   *
   * @param router
   * @param auth
   */
  constructor(@Inject(AUTH_SERVICE) private auth: AuthServiceInterface) {
    this.auth.signInState$
      .pipe(
        takeUntil(this._destroy$),
        tap(
          (state) =>
            (this._signInResult = {
              ...state,
              scopes: state.scopes ?? [],
            } as Required<SignInResultInterface>)
        )
      )
      .subscribe();
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const url: string = state.url;
    return this.can(
      next.data['authorizations'] ?? next.data['scopes'],
      url
    );
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> | Promise<boolean> {
    return this.canActivate(childRoute, state);
  }

  canLoad(route: Route): boolean | Observable<boolean> | Promise<boolean> {
    const url = `/${route.path}`;
    return this.can(
      route.data ? route.data['authorizations'] ?? route.data['scopes'] : [],
      url
    );
  }

  private can(scopes: string[] | string, url: string) {
    if (
      typeof this._signInResult === 'undefined' ||
      this._signInResult === null
    ) {
      return false;
    }
    const _scopes = typeof scopes === 'string' ? [scopes] : scopes;
    return tokenCan(this._signInResult, ..._scopes);
  }
}


@Injectable()
export class TokenCanAnyGuard implements CanActivate {
  // #region Class properties
  private _destroy$ = new Subject<void>();
  private _signInResult!: Required<SignInResultInterface>;
  // #endregion Class properties

  /**
   * Creates new class instance
   *
   * @param router
   * @param auth
   */
  constructor(@Inject(AUTH_SERVICE) private auth: AuthServiceInterface) {
    this.auth.signInState$
      .pipe(
        takeUntil(this._destroy$),
        tap(
          (state) =>
            (this._signInResult = {
              ...state,
              scopes: state.scopes ?? [],
            } as Required<SignInResultInterface>)
        )
      )
      .subscribe();
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const url: string = state.url;
    return this.can(
      next.data['authorizations'] ?? next.data['scopes'],
      url
    );
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> | Promise<boolean> {
    return this.canActivate(childRoute, state);
  }

  canLoad(route: Route): boolean | Observable<boolean> | Promise<boolean> {
    const url = `/${route.path}`;
    return this.can(
      route.data ? route.data['authorizations'] ?? route.data['scopes'] : [],
      url
    );
  }

  private can(scopes: string[] | string, url: string) {
    if (
      typeof this._signInResult === 'undefined' ||
      this._signInResult === null
    ) {
      return false;
    }
    const _scopes = typeof scopes === 'string' ? [scopes] : scopes;
    return tokenCanAny(this._signInResult, ..._scopes);
  }
}
