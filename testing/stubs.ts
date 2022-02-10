import { of } from "rxjs";
import {
  RequestClient,
  SignInResultInterface,
  UnAuthenticatedResultInterface,
} from "../contracts";

export const AUTHENTICATED_RESULT = {
  authToken: "<TOKEN>",
  provider: "LOCAL",
  id: 1,
  idToken: "<TOKEN_ID>",
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

export const USER_RESPONSE = {
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

export enum ResponseTypes {
  UNAUTHENTICATED = 0,
  AUTHENTICATED = 1,
  LOCKED = 2,
  DOUBLE_AUTH = 3,
}

export class HttpClient implements RequestClient {
  constructor(
    private responseType: ResponseTypes = ResponseTypes.AUTHENTICATED
  ) {}

  public setResponseType(responseType: ResponseTypes) {
    this.responseType = responseType;
  }

  post(path: string, body: any, options?: { [index: string]: any }) {
    switch (this.responseType) {
      case ResponseTypes.UNAUTHENTICATED:
        return of({
          authenticated: false,
        } as UnAuthenticatedResultInterface);
      case ResponseTypes.LOCKED:
        return of({
          authenticated: false,
          locked: true,
        } as UnAuthenticatedResultInterface);
      case ResponseTypes.AUTHENTICATED:
        body = body ?? {};
        if (body.username === "ADMIN" && body.password === "secret") {
          return of(AUTHENTICATED_RESULT as Partial<SignInResultInterface>);
        }
        return of({
          authenticated: false,
        } as UnAuthenticatedResultInterface);
      default:
        return of({
          authenticated: false,
        } as UnAuthenticatedResultInterface);
    }
  }
  get(path: string, options?: { [index: string]: any }) {
    return of(USER_RESPONSE);
  }
}
