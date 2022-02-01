import { Observable, tap } from "rxjs";
import { Client } from "src/app/lib/core/http";
import { observableOf } from "src/app/lib/core/rxjs/helpers";
import {
  SignInResultInterface,
  UnAuthenticatedResultInterface,
} from "../../contracts";
import { LocalStrategy } from "./local-strategy";
import { lastValueFrom } from "rxjs";

const AUTHENTICATED_RESULT = {
  authToken:
    "<TOKEN>",
  provider: "local",
  id: 1,
  idToken:
    "<TOKEN_ID>",
  authorizationCode: undefined,
  response: undefined,
  scopes: [
    "list-roles",
    "create-roles",
    "update-roles",
    "delete-roles",
    "list-users",
    "create-users",
    "update-users",
    "delete-users",
  ],
  expiresAt: "2022-02-01T17:48:25.000000Z",
};

const USER_RESPONSE = {
  id: 1,
  username: "APPSYSADMIN",
  is_active: true,
  remember_token: undefined,
  user_details: {
    id: 1,
    firstname: "ADMIN",
    lastname: "MASTER",
    address: undefined,
    phone_number: undefined,
    postal_code: undefined,
    birthdate: undefined,
    sex: undefined,
    profile_url: undefined,
    deleted_at: undefined,
    created_at: "2022-01-06T11:31:58.000000Z",
    updated_at: "2022-01-06T11:31:58.000000Z",
    emails: ["contact@azlabs.tg"],
  },
  double_auth_active: false,
  channels: [],
  is_verified: true,
  authorizations: [
    "all",
    "list-roles",
    "create-roles",
    "update-roles",
    "delete-roles",
    "list-users",
    "create-users",
    "update-users",
    "delete-users",
  ],
  roles: ["SYSADMIN"],
  accessToken: {
    authToken: undefined,
    provider: "local",
    id: 1,
    idToken:
      "2a22cb11cb2afbbdad9634a0e58d5b0fd9428c3642f6262fd4947fd35aae1160503ffe17d8bbdd7e",
    authorizationCode: undefined,
    response: undefined,
    scopes: [
      "list-roles",
      "create-roles",
      "update-roles",
      "delete-roles",
      "list-users",
      "create-users",
      "update-users",
      "delete-users",
    ],
    expires_at: "2022-02-01T17:48:25.000000Z",
  },
};

enum ResponseTypes {
  UNAUTHENTICATED = 0,
  AUTHENTICATED = 1,
  LOCKED = 2,
  DOUBLE_AUTH = 3,
}

class HttpClient implements Client {
  constructor(private responseType: ResponseTypes = undefined) {}

  public setResponseType(responseType: ResponseTypes) {
    this.responseType = responseType;
  }

  post(
    path: string,
    body: any,
    options?: { [index: string]: any }
  ): Observable<any> {
    switch (this.responseType) {
      case ResponseTypes.UNAUTHENTICATED:
        return observableOf({
          authenticated: false,
        } as UnAuthenticatedResultInterface);
      case ResponseTypes.LOCKED:
        return observableOf({
          authenticated: false,
          locked: true,
        } as UnAuthenticatedResultInterface);
      case ResponseTypes.AUTHENTICATED:
        return observableOf(
          AUTHENTICATED_RESULT as Partial<SignInResultInterface>
        );
      default:
        break;
    }
  }
  get(path: string, options?: { [index: string]: any }): Observable<any> {
    return observableOf(USER_RESPONSE);
  }
  put(
    path: string,
    body: any,
    options?: { [index: string]: any }
  ): Observable<any> {
    throw new Error("Method not implemented.");
  }
  delete(path: string, options?: { [index: string]: any }): Observable<any> {
    throw new Error("Method not implemented.");
  }
}

describe("LocalStrategy", () => {
  let service: LocalStrategy;
  let client = new HttpClient();

  beforeEach(() => {
    service = new LocalStrategy(client, "");
  });

  it("#signIn should return false", async (done: DoneFn) => {
    client.setResponseType(ResponseTypes.UNAUTHENTICATED);
    const result = await lastValueFrom(service.signIn());
    expect(result).toBe(false);
    done();
  });

  it("#signIn should return false", async (done: DoneFn) => {
    client.setResponseType(ResponseTypes.LOCKED);
    const result = await lastValueFrom(service.signIn());
    expect(result).toBe(false);
    done();
  });

  it("#signIn should return an observable of true", async (done: DoneFn) => {
    client.setResponseType(ResponseTypes.AUTHENTICATED);
    let loginState = undefined;
    service.loginState$.pipe(tap(state => loginState = state)).subscribe();
    const result = await lastValueFrom(service.signIn());
    expect(result).toBe(true);
    expect(loginState).toEqual({
      ...AUTHENTICATED_RESULT,
      id: 1,
      emails: ["contact@azlabs.tg"],
      name: "APPSYSADMIN",
      photoUrl: undefined,
      firstName: "ADMIN",
      lastName: "MASTER",
      phoneNumber: undefined,
      address: undefined,
    } as SignInResultInterface);
    done();
  });
});
