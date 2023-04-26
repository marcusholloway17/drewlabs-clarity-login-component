import { BehaviorSubject, Observable, of, Subject } from "rxjs";
import { map, mergeMap } from "rxjs/operators";
import {
  DoubleAuthSignInResultInterface,
  RequestClient,
  SignInOptionsType,
  SignInResult,
  SignInResultInterface,
  StrategyInterface,
  UnAuthenticatedResultInterface
} from "../../../contracts";
import { host } from "../../helpers";
import { DEFAULT_ENDPOINTS, LOCAL_SIGNIN_RESULT_CACHE } from "./defaults";
import { RESTInterfaceType, SingInResultType, UserInterface } from "./types";

/**
 * Local strategy provides interface for authenticating first party
 * application users via bearer token.
 * 
 * **Note**
 * Implementation flow is based on drewlabs identity web service. Provide
 * your own implementation inspired by the current implementation  if
 * using a service other that the service mention above.
 * 
 * **Note**
 * By default, the strategy implementation use default routes prefixed by
 * `/auth/v2`. To change the default behavior, pass the required endpoint
 * as parameter to the constructor:
 * 
 * ```ts
 * 
 * 
 * // Example using api/v2/ as prefix to authentication routes
 * const strategy = new LocalStrategy(client, host, {
 *    users: "api/v2/user",
 *    signIn: "api/v2/login",
 *    signOut: "api/v2/logout"
 * })
 * ```
 */
export class LocalStrategy implements StrategyInterface {
  // Properties definition
  private endpoints: RESTInterfaceType;
  private _signInState$ = new BehaviorSubject<SingInResultType>(undefined);
  signInState$ = this._signInState$.asObservable();
  private _request2FaConsent$ = new Subject<string>();
  request2FaConsent$ = this._request2FaConsent$.asObservable();

  // Instance initializer
  constructor(
    private http: RequestClient,
    private host: string,
    private cache?: Storage,
    endpoints?: Partial<RESTInterfaceType>
  ) {
    this.endpoints = { ...DEFAULT_ENDPOINTS, ...(endpoints ?? {}) };
  }

  initialize(autologin?: boolean): Observable<void> {
    // TODO : If Auto-login is true, load the signIn result from the cache storage
    // And publish a signInResult event
    return of();
  }

  getLoginStatus() {
    return new Promise<SingInResultType>((resolve, reject) => {
      if (this.cache) {
        const value = this.cache.getItem(LOCAL_SIGNIN_RESULT_CACHE) as any;
        if (typeof value === "undefined" || value === null) {
          return resolve(undefined);
        }
        if (typeof value === "string") {
          return resolve(JSON.parse(value) as SignInResultInterface);
        }
        return resolve(value);
      }
      return resolve(undefined);
    });
  }

  signIn(options?: SignInOptionsType) {
    return this.http
      .post(`${host(this.host)}/${this.endpoints.signIn}`, options)
      .pipe(
        mergeMap((state: SignInResult) => {
          let authState: SignInResult =
            state as DoubleAuthSignInResultInterface;
          if (authState.is2faEnabled) {
            this._request2FaConsent$.next(authState.auth2faToken);
            return of(true);
          }
          authState = state as UnAuthenticatedResultInterface;
          if (Boolean(authState.locked)) {
            return of(false);
          }
          const authenticated = authState.authenticated;
          if (
            !(null === authenticated || typeof authenticated === "undefined") &&
            Boolean(authenticated) === false
          ) {
            return of(false);
          }
          return this.http
            .get(`${host(this.host)}/${this.endpoints.users}`, {
              headers: {
                Authorization: `Bearer ${
                  (state as Partial<SignInResultInterface>).authToken
                }`,
              },
            })
            .pipe(
              map((user: UserInterface) => {
                if (state) {
                  const result = {
                    ...(state as SignInResultInterface),
                    id: user.id,
                    emails: user?.user_details?.emails,
                    name: user?.username,
                    photoUrl: user?.user_details?.profile_url,
                    firstName: user?.user_details?.firstname,
                    lastName: user?.user_details?.lastname,
                    phoneNumber: user?.user_details?.phone_number,
                    address: user?.user_details?.address,
                  };
                  this._signInState$.next(result);
                  if (this.cache) {
                    this.cache.setItem(
                      LOCAL_SIGNIN_RESULT_CACHE,
                      JSON.stringify(result)
                    );
                  }
                }
                return true;
              })
            );
        })
      );
  }

  signOut(revoke?: boolean): Observable<boolean> {
    return this.http
      .get(`${host(this.host)}/${this.endpoints.users}`, {
        params: { revoke },
      })
      .pipe(
        map(() => {
          this._signInState$.next(undefined);
          this.cache?.removeItem(LOCAL_SIGNIN_RESULT_CACHE);
          return true;
        })
      );
  }
}
