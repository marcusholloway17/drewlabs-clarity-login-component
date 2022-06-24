import { TestBed } from "@angular/core/testing";
import { lastValueFrom, tap } from "rxjs";
import {
  AuthStrategies,
  AUTH_SERVICE,
  AUTH_SERVICE_CONFIG,
} from "../constants";
import {
  AuthServiceConfig,
  AuthServiceInterface,
  AuthStrategiesContainer,
  SignInResultInterface,
} from "../contracts";
import {
  AUTHENTICATED_RESULT,
  HttpClient,
  ResponseTypes,
} from "../testing/stubs";
import { AuthService } from "./auth.service";
import { LocalStrategy } from "./strategies/local-strategy";

describe("LocalStrategy", () => {
  let client = new HttpClient();
  let authService: AuthServiceInterface | AuthStrategiesContainer;

  beforeEach(async () => {
    // TODO : CONFIGURE PROVIDERS
    await TestBed.configureTestingModule({
      providers: [
        AuthService,
        {
          provide: AUTH_SERVICE_CONFIG,
          useValue: {
            strategies: [
              {
                id: AuthStrategies.LOCAL,
                strategy: new LocalStrategy(client, ""),
              },
            ],
            autoLogin: true,
          } as AuthServiceConfig,
        },
        {
          provide: AUTH_SERVICE,
          useClass: AuthService,
        },
      ],
    }).compileComponents();
    authService = TestBed.inject(AUTH_SERVICE);
  });

  it("#inject when call on AUTH_SERVICE token must return an instance AuthService", (done: DoneFn) => {
    expect(authService).toBeInstanceOf(AuthService);
    done();
  });

  it("#AuthService.getProvider(AuthStrategies.LOCAL) should return an instance of LocalStrategy", (done: DoneFn) => {
    expect(
      (authService as AuthStrategiesContainer).getStrategy(AuthStrategies.LOCAL)
    ).toBeInstanceOf(LocalStrategy);
    done();
  });

  it("#AuthService.signIn(AuthStrategies.LOCAL) should return an observable of true", async (done: DoneFn) => {
    client.setResponseType(ResponseTypes.AUTHENTICATED);
    const result = await lastValueFrom(
      (authService as AuthServiceInterface).signIn(AuthStrategies.LOCAL, {
        username: "ADMIN",
        password: "secret",
      })
    );
    expect(result).toBe(true);
    done();
  });

  it("#AuthService.signIn(AuthStrategies.LOCAL) should return an observable of false for empty body", async (done: DoneFn) => {
    client.setResponseType(ResponseTypes.AUTHENTICATED);
    const result = await lastValueFrom(
      (authService as AuthServiceInterface).signIn(AuthStrategies.LOCAL, {})
    );
    expect(result).toBe(false);
    done();
  });

  it("#AuthService.signIn(AuthStrategies.LOCAL) notifies signInState$ observable on successful login", async (done: DoneFn) => {
    // TODO : Initialize variables
    client.setResponseType(ResponseTypes.AUTHENTICATED);
    let signState!: SignInResultInterface;
    // TODO : Run Effects
    (authService as AuthServiceInterface).signInState$
      .pipe(tap((state) => (signState = state as SignInResultInterface)))
      .subscribe();
    // Subscribe to get the sign in state result
    await lastValueFrom(
      (authService as AuthServiceInterface).signIn(AuthStrategies.LOCAL, {
        username: "ADMIN",
        password: "secret",
      })
    );
    // TODO : Assert
    expect(signState).toEqual({
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
