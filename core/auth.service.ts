import { Inject, Injectable } from "@angular/core";
import {
  catchError,
  forkJoin,
  from,
  isObservable,
  lastValueFrom,
  mergeMap,
  of,
  ReplaySubject,
  startWith,
  tap,
  throwError,
} from "rxjs";
import {
  AuthActions,
  AuthStrategies,
  AUTH_SERVICE_CONFIG,
  ERR_LOGIN_STRATEGY_NOT_FOUND,
  ERR_NOT_INITIALIZED,
  ERR_NOT_SUPPORTED_FOR_REFRESH_TOKEN,
} from "../constants";
import {
  AuthServiceConfig,
  SignInResultInterface,
  StrategyInterface,
} from "../contracts";

const isPromise = (p: any) => {
  return typeof p === "object" && typeof p.then === "function" ? true : false;
};

const asObservable = (state: any) =>
  isObservable(state) ? state : isPromise(state) ? from(state) : of(state);

/**
 * The service encapsulating authentication functionality. Exposes methods like
 * `signIn`, `signOut`. Also, exposes an `signInState` `Observable` that one can
 * subscribe to get the current logged in user information.
 *
 * @dynamic
 */
@Injectable()
export class AuthService {
  // Properties definitions
  private strategies = new Map<string, StrategyInterface>();
  private autoLogin = false;

  private _signInResult: SignInResultInterface = undefined;

  private _signInState$ = new ReplaySubject<SignInResultInterface>(1);
  /** An `Observable` that one can subscribe to get the current logged in user information */
  public signInState$ = this._signInState$.asObservable();

  /* Consider making this an enum comprising LOADING, LOADED, FAILED etc. */
  private initialized = false;
  private _actionsState$ = new ReplaySubject<AuthActions>(1);

  public actionsState$ = this._actionsState$.pipe(
    startWith(AuthActions.ONGOING)
  );

  /**
   * @param config A `AuthServiceConfig` object or a `Promise` that resolves to a `AuthServiceConfig` object
   */
  constructor(
    @Inject(AUTH_SERVICE_CONFIG)
    config: AuthServiceConfig | Promise<AuthServiceConfig>
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
    const initializers = forkJoin([
      Array.from(this.strategies.values()).map((strategy) =>
        asObservable(strategy.initialize())
      ),
    ]).pipe(
      mergeMap(() => {
        if (this.autoLogin) {
          return forkJoin(
            Array.from(this.strategies.entries()).map(([key, strategy]) => {
              return strategy.loginState$.pipe(
                tap((signInResult: SignInResultInterface) => {
                  this._signInResult = { ...signInResult, provider: key };
                  this._signInState$.next(this._signInResult);
                })
              );
            })
          );
        }
        return of([]);
      })
    );

    try {
      await lastValueFrom(initializers);
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
        // const providerObject = this.providers.get(providerId);
        // if (providerObject) {
        //   providerObject
        //     .getLoginStatus({ refreshToken: true })
        //     .then((user: SignInResultInterface) => {
        //       user.provider = providerId;
        //       this._user = user;
        //       this._authState.next(user);
        //       resolve();
        //     })
        //     .catch((err) => {
        //       reject(err);
        //     });
        // } else {
        //   reject(ERR_LOGIN_STRATEGY_NOT_FOUND);
        // }
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
      throwError(() => new Error(ERR_NOT_INITIALIZED));
    }
    const strategy = this.strategies.get(id);
    if (typeof strategy === "undefined" || strategy === null) {
      throwError(() => new Error(ERR_LOGIN_STRATEGY_NOT_FOUND));
    }
    this._actionsState$.next(AuthActions.ONGOING);
    return strategy.signIn(options).pipe(
      tap(() => this._actionsState$.next(AuthActions.COMPLETE)),
      catchError((err) => {
        this._actionsState$.next(AuthActions.FAILED);
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
      throwError(() => new Error(ERR_NOT_INITIALIZED));
    }
    if (!this._signInResult) {
      throwError(() => new Error(ERR_NOT_INITIALIZED));
    }
    const strategy = this.strategies.get(this._signInResult.provider);
    if (typeof strategy === "undefined" || strategy === null) {
      throwError(() => new Error(ERR_LOGIN_STRATEGY_NOT_FOUND));
    }
    this._actionsState$.next(AuthActions.ONGOING);
    return strategy.signOut(revoke).pipe(
      tap(() => this._actionsState$.next(AuthActions.COMPLETE)),
      catchError((err) => {
        this._actionsState$.next(AuthActions.FAILED);
        return throwError(() => err);
      })
    );
  }

  private applyConfigs(config: AuthServiceConfig) {
    this.autoLogin = config.autoLogin ?? false;
    config.strategies.forEach((item) => {
      this.strategies.set(item.id, item.strategy);
    });
    return config.onError ?? console.error;
  }
}
