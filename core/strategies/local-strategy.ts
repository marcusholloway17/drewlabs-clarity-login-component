import { Observable } from "rxjs";
import { map, mergeMap, tap } from "rxjs/operators";
import { Client } from "src/app/lib/core/http";
import { httpHost } from "src/app/lib/core/http/helpers";
import { createStateful, createSubject, observableOf } from "src/app/lib/core/rxjs/helpers";
import {
  SignInOptionsType,
  SignInResultInterface,
  StrategyInterface,
  DoubleAuthSignInResultInterface,
  SignInResult,
  UnAuthenticatedResultInterface,
} from "../../contracts";

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
  _loginState$ = createStateful<SignInResultInterface>(undefined);
  loginState$ = this._loginState$.asObservable();

  private _request2FaConsent$ = createSubject<string>();
  request2FaConsent$ = this._request2FaConsent$.asObservable();

  // Instance initializer
  constructor(private http: Client, private host: string) {}

  signIn(options?: SignInOptionsType) {
    return this.http
      .post(`${httpHost(this.host)}/${LOCAL_API_LOGIN}`, options)
      .pipe(
        mergeMap((state: SignInResult) => {
          if ((state as DoubleAuthSignInResultInterface).is2faEnabled) {
            this._request2FaConsent$.next(
              (state as DoubleAuthSignInResultInterface).auth2faToken
            );
            return observableOf(true);
          }

          if (Boolean((state as UnAuthenticatedResultInterface).locked)) {
            return observableOf(false);
          }
          const authenticated = (state as UnAuthenticatedResultInterface)
            .authenticated;
          if (
            !(null === authenticated || typeof authenticated === "undefined") &&
            Boolean(authenticated) === false
          ) {
            return observableOf(false);
          }
          return this.http
            .get(`${httpHost(this.host)}/${LOCAL_API_GET_USER}`)
            .pipe(
              map((user: GetUserDetailsResult) => {
                console.log(user.username);
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
      .get(`${httpHost(this.host)}/${LOCAL_API_LOGOUT}`, {
        params: { revoke },
      })
      .pipe(map((_) => true));
  }
}
