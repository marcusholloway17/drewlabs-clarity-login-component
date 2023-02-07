import { lastValueFrom, tap } from "rxjs";
import { SignInResultInterface } from "../../contracts";
import {
    AUTHENTICATED_RESULT,
    HttpClient,
    ResponseTypes
} from "../../testing/stubs";
import { LocalStrategy } from "./local/local-strategy";

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
    let loginState!: SignInResultInterface|undefined;
    service.signInState$
      .pipe(
        tap((state) => (loginState = state)),
      )
      .subscribe();
    const result = await lastValueFrom(service.signIn());
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
