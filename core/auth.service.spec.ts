import { TestBed } from "@angular/core/testing";
import {
  AuthStrategies,
  AUTH_SERVICE,
  AUTH_SERVICE_CONFIG,
} from "../constants";
import { AuthServiceConfig } from "../contracts";
import { HttpClient } from "../testing/stubs";
import { AuthService } from "./auth.service";
import { LocalStrategy } from "./strategies/local-strategy";

describe("LocalStrategy", () => {
  let client = new HttpClient();

  beforeEach(() => {
    // TODO : CONFIGURE PROVIDERS
    TestBed.configureTestingModule({
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
    });
  });
});
