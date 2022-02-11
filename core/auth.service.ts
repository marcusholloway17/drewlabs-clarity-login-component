import { Inject, Injectable, OnDestroy, Optional } from "@angular/core";
import {
  catchError,
  forkJoin,
  from,
  isObservable,
  lastValueFrom,
  of,
  ReplaySubject,
  startWith,
  Subject,
  tap,
  throwError,
  takeUntil,
} from "rxjs";
import {
  AuthActions,
  AuthStrategies,
  AUTH_SERVICE_CONFIG,
  ERR_LOGIN_STRATEGY_NOT_FOUND,
  ERR_NOT_INITIALIZED,
  ERR_NOT_SUPPORTED_FOR_REFRESH_TOKEN,
  AUTH_ACTION_HANDLERS,
} from "../constants";
import {
  AuthServiceConfig,
  SignInResultInterface,
  StrategyInterface,
  AuthStrategiesContainer,
  AuthServiceInterface,
  AuthActionHandlers,
} from "../contracts";

const isPromise = (p: any) => {
  return typeof p === "object" && typeof p.then === "function" ? true : false;
};

const asObservable = (state: any) =>
  isObservable(state) ? state : isPromise(state) ? from(state) : of(state);

@Injectable({
  providedIn: "root",
})
export class AuthService
  implements AuthServiceInterface, AuthStrategiesContainer, OnDestroy
{
  // Properties definitions
  private strategies = new Map<string, StrategyInterface>();
  private autologin = false;

  private _signInResult!: SignInResultInterface | undefined;

  private _signInState$ = new ReplaySubject<SignInResultInterface | undefined>(
    1
  );
  /** An `Observable` that one can subscribe to get the current logged in user information */
  public signInState$ = this._signInState$.asObservable();

  /* Consider making this an enum comprising LOADING, LOADED, FAILED etc. */
  private initialized = false;
  private _actionsState$ = new ReplaySubject<AuthActions>(1);

  public actionsState$ = this._actionsState$.pipe(
    startWith(AuthActions.ONGOING)
  );

  private _destroy$ = new Subject<void>();

  /**
   * @param config A `AuthServiceConfig` object or a `Promise` that resolves to a `AuthServiceConfig` object
   */
  constructor(
    @Inject(AUTH_SERVICE_CONFIG)
    config: AuthServiceConfig | Promise<AuthServiceConfig>,
    @Optional()
    @Inject(AUTH_ACTION_HANDLERS)
    private handlers: AuthActionHandlers
  ) {
    config instanceof Promise
      ? config.then((config) => {
          this.initialize(config);
        })
      : this.initialize(config);
  }

  private async initialize(config: AuthServiceConfig) {
    const onError = this.applyConfigs(config);
    this._actionsState$.next(AuthActions.ONGOING);
    // Subscribe to strategies signInState$ changes
    // If a provider sign in state change, the authservice _signInState$ publish
    // an authenticated event that the view can use to sign user in
    forkJoin(
      Array.from(this.strategies.entries()).map(([key, strategy]) => {
        return strategy.signInState$.pipe(
          tap((signInResult) => {
            if (signInResult) {
              this._signInResult = { ...signInResult, provider: key };
              this._signInState$.next(this._signInResult);
            }
          })
        );
      })
    )
      .pipe(takeUntil(this._destroy$))
      .subscribe();
    try {
      await lastValueFrom(
        forkJoin([
          Array.from(this.strategies.values()).map((strategy) =>
            asObservable(strategy.initialize(this.autologin))
          ),
        ])
      );

      if (this.autologin) {
        await Promise.all(
          Array.from(this.strategies.entries()).map(async ([key, provider]) => {
            let signInResult = await provider.getLoginStatus();
            if (signInResult) {
              this._signInState$.next(signInResult);
            }
          })
        );
      }
    } catch (error) {
      this._actionsState$.next(AuthActions.FAILED);
      onError(error);
    } finally {
      this.initialized = true;
      this._actionsState$.next(AuthActions.COMPLETE);
    }
  }

  refreshAuthToken(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.initialized) {
        reject(ERR_NOT_INITIALIZED);
      } else if ([String(AuthStrategies.GOOGLE)].includes(String(id))) {
        reject(ERR_NOT_SUPPORTED_FOR_REFRESH_TOKEN);
      } else {
        // TODO : CALL GET REFRESH TOKEN ON SUPPRTE STRATEGIES
      }
    });
  }

  /**
   * A method used to sign in a user with a specific `Strategy`.
   *
   * @param id Id with which the {@code Strategy} has been registered with the service
   * @param options Optional {@code Strategy} specific arguments
   * @returns A `Promise` that resolves to the authenticated user information
   */
  signIn(id: string, options?: any) {
    if (!this.initialized) {
      return throwError(() => new Error(ERR_NOT_INITIALIZED));
    }
    const strategy = this.strategies.get(id);
    if (typeof strategy === "undefined" || strategy === null) {
      return throwError(() => new Error(ERR_LOGIN_STRATEGY_NOT_FOUND));
    }
    this._actionsState$.next(AuthActions.ONGOING);
    this.handlers?.onPerformingAction();
    return strategy?.signIn(options).pipe(
      tap((state) => {
        state
          ? this.handlers?.onAuthenticaltionSuccessful()
          : this.handlers?.onAuthenticationFailure();
        this._actionsState$.next(AuthActions.COMPLETE);
      }),
      catchError((err) => {
        this._actionsState$.next(AuthActions.FAILED);
        this.handlers?.onError();
        return throwError(() => err);
      })
    );
  }

  /**
   * A method used to sign out the currently loggen in user.
   *
   * @param revoke Optional parameter to specify whether a hard sign out is to be performed
   * @returns A `Promise` that resolves if the operation is successful, rejects otherwise
   */
  signOut(revoke: boolean = false) {
    if (!this.initialized) {
      this.onLoggedOut();
      return throwError(() => new Error(ERR_NOT_INITIALIZED));
    }
    if (
      typeof this._signInResult === "undefined" ||
      this._signInResult === null
    ) {
      this.onLoggedOut();
      return throwError(() => new Error(ERR_NOT_INITIALIZED));
    }
    const strategy = this.strategies.get(this._signInResult?.provider);
    if (typeof strategy === "undefined" || strategy === null) {
      this.onLoggedOut();
      return throwError(() => new Error(ERR_LOGIN_STRATEGY_NOT_FOUND));
    }
    this._actionsState$.next(AuthActions.ONGOING);
    return strategy.signOut(revoke).pipe(
      tap((state) => {
        this._actionsState$.next(AuthActions.COMPLETE);
        if (state) {
          this.onLoggedOut();
        }
      }),
      catchError((err) => {
        this._actionsState$.next(AuthActions.FAILED);
        this.onLoggedOut();
        return throwError(() => err);
      })
    );
  }

  public getStrategy(id: AuthStrategies) {
    return this.strategies.get(id);
  }

  private onLoggedOut() {
    this._signInState$.next(undefined);
    this._signInResult = undefined;
    this.handlers?.onLogout();
  }

  private applyConfigs(config: AuthServiceConfig) {
    this.autologin = config.autoLogin ?? false;
    config.strategies.forEach((item) => {
      this.strategies.set(item.id, item.strategy);
    });
    return config.onError ?? console.error;
  }

  public ngOnDestroy() {
    this._destroy$.next();
  }
}
