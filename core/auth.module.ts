import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { ModuleWithProviders, NgModule, Provider } from "@angular/core";
import {
  AuthStrategies,
  AUTH_SERVICE,
  AUTH_SERVICE_CONFIG,
  AUTH_ACTION_HANDLERS,
} from "../constants";
import { AuthServiceConfig } from "../contracts";
import {
  AuthGuardService,
  AuthInterceptorService,
  AuthorizationsGuard,
} from "../guards";
import { HttpClient } from "../testing/stubs";
import { AuthService } from "./auth.service";
import { LocalStrategy } from "./strategies";

@NgModule({
  providers: [],
})
export class StrategyBasedAuthModule {
  static forRoot(
    authResultHandlersProvider: Provider,
    authConfig: AuthServiceConfig = undefined
  ): ModuleWithProviders<StrategyBasedAuthModule> {
    return {
      ngModule: StrategyBasedAuthModule,
      providers: [
        {
          provide: AUTH_SERVICE,
          useClass: AuthService,
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptorService,
          multi: true,
        },
        AuthorizationsGuard,
        AuthGuardService,
        {
          provide: AUTH_SERVICE_CONFIG,
          useValue: authConfig ?? {
            strategies: [
              {
                id: AuthStrategies.LOCAL,
                strategy: new LocalStrategy(new HttpClient(), ""),
              },
            ],
            autoLogin: true,
          },
        },
        authResultHandlersProvider,
      ],
    };
  }
}
