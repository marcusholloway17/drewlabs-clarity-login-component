import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import {
  SignInOptionsType,
  SignInResultInterface,
  StrategyInterface,
  DoubleAuthSignInResultInterface,
  SignInResult,
  UnAuthenticatedResultInterface,
  RequestClient,
} from '../../contracts';
import { host } from '../helpers';

//#region Types
type GetUserDetailsResult = {
  id: number | string;
  username: string;
  user_details: {
    firstname: string;
    lastname: string;
    address?: string;
    phone_number?: string;
    profile_url?: string;
    emails: string[];
  };
  double_auth_active: boolean;
  authorizations: string[];
  roles: string[];
};

type RESTInterfaceType = {
  users: string;
  signIn: string;
  signOut: string;
};
//#endregion Types

//#region Constants
const LOCAL_SIGNIN_RESULT_CACHE = 'LOCAL_STRATEGY_SIGNIN_RESULT_CACHE';

const DEFAULT_ENDPOINTS = {
  users: 'auth/v2/user',
  signIn: 'auth/v2/login',
  signOut: 'auth/v2/logout',
};
//#endregion Constants

export class LocalStrategy implements StrategyInterface {
  // Properties definition
  _signInState$ = new BehaviorSubject<SignInResultInterface | undefined>(
    undefined
  );
  signInState$ = this._signInState$.asObservable();

  private _request2FaConsent$ = new Subject<string>();
  request2FaConsent$ = this._request2FaConsent$.asObservable();
  private endpoints: RESTInterfaceType;

  // Instance initializer
  constructor(
    private http: RequestClient,
    private host: string,
    private cache?: Storage,
    endpoints?: Partial<RESTInterfaceType>
  ) {
    this.endpoints = { ...(endpoints ?? {}), ...DEFAULT_ENDPOINTS };
  }

  initialize(autologin?: boolean): Observable<void> {
    // TODO : If Auto-login is true, load the signIn result from the cache storage
    // And publish a signInResult event
    return of();
  }

  getLoginStatus() {
    return new Promise<SignInResultInterface | undefined>((resolve, reject) => {
      if (this.cache) {
        const value = this.cache.getItem(LOCAL_SIGNIN_RESULT_CACHE) as any;
        if (typeof value === 'undefined' || value === null) {
          return resolve(undefined);
        }
        if (typeof value === 'string') {
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
            !(null === authenticated || typeof authenticated === 'undefined') &&
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
              map((user: GetUserDetailsResult) => {
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
