import { BehaviorSubject, Observable, of, Subject } from "rxjs";
import { map, mergeMap } from "rxjs/operators";
import {
  SignInOptionsType,
  SignInResultInterface,
  StrategyInterface,
  DoubleAuthSignInResultInterface,
  SignInResult,
  UnAuthenticatedResultInterface,
  RequestClient,
} from "../../contracts";
import { host } from "../helpers";

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

const LOCAL_API_GET_USER = "auth/v2/user";

const LOCAL_API_LOGIN = "auth/v2/login";

const LOCAL_API_LOGOUT = "auth/v2/logout";

export class LocalStrategy implements StrategyInterface {
  // Properties definition
  _loginState$ = new BehaviorSubject<SignInResultInterface>(undefined);
  loginState$ = this._loginState$.asObservable();

  private _request2FaConsent$ = new Subject<string>();
  request2FaConsent$ = this._request2FaConsent$.asObservable();

  // Instance initializer
  constructor(private http: RequestClient, private host: string) {}

  initialize(): Observable<void> {
    throw new Error("Method not implemented.");
  }

  signIn(options?: SignInOptionsType) {
    return this.http
      .post(`${host(this.host)}/${LOCAL_API_LOGIN}`, options)
      .pipe(
        mergeMap((state: SignInResult) => {
          if ((state as DoubleAuthSignInResultInterface).is2faEnabled) {
            this._request2FaConsent$.next(
              (state as DoubleAuthSignInResultInterface).auth2faToken
            );
            return of(true);
          }

          if (Boolean((state as UnAuthenticatedResultInterface).locked)) {
            return of(false);
          }
          const authenticated = (state as UnAuthenticatedResultInterface)
            .authenticated;
          if (
            !(null === authenticated || typeof authenticated === "undefined") &&
            Boolean(authenticated) === false
          ) {
            return of(false);
          }
          return this.http.get(`${host(this.host)}/${LOCAL_API_GET_USER}`).pipe(
            map((user: GetUserDetailsResult) => {
              if (state) {
                this._loginState$.next({
                  ...(state as SignInResultInterface),
                  id: user.id,
                  emails: user?.user_details?.emails,
                  name: user?.username,
                  photoUrl: user?.user_details?.profile_url,
                  firstName: user?.user_details?.firstname,
                  lastName: user?.user_details?.lastname,
                  phoneNumber: user?.user_details?.phone_number,
                  address: user?.user_details?.address,
                });
              }
              return true;
            })
          );
        })
      );
  }

  signOut(revoke?: boolean): Observable<boolean> {
    return this.http
      .get(`${host(this.host)}/${LOCAL_API_LOGOUT}`, {
        params: { revoke },
      })
      .pipe(map((_) => true));
  }
}
