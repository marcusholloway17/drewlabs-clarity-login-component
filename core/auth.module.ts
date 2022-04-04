import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { ModuleWithProviders, NgModule, Provider } from "@angular/core";
import {
  AuthStrategies,
  AUTH_SERVICE,
  AUTH_SERVICE_CONFIG,
} from "../constants";
import {
  AuthGuardService,
  AuthInterceptorService,
  AuthorizationsGuard,
  ClientAuthorizationInterceptor,
  UnAuthorizedResponseInterceptorGuard,
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
    authConfigProvider?: Provider
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
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ClientAuthorizationInterceptor,
          multi: true
        },
        AuthorizationsGuard,
        AuthGuardService,
        authConfigProvider ?? {
          provide: AUTH_SERVICE_CONFIG,
          useValue: {
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
        {
          provide:  HTTP_INTERCEPTORS,
          useClass: UnAuthorizedResponseInterceptorGuard,
          multi: true
        }
      ],
    };
  }
}
