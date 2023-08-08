import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { ModuleWithProviders, NgModule, Provider } from "@angular/core";
import { AUTH_SERVICE, AUTH_SERVICE_CONFIG } from "../constants";
import {
  AuthGuardService,
  AuthInterceptorService,
  ClientAuthorizationInterceptor,
  TokenCanAnyGuard,
  TokenCanGuard,
  UnAuthorizedResponseInterceptorGuard,
} from "../guards";
import { AuthService } from "./auth.service";
import { TokenCanAnyPipe, TokenCanPipe } from "./pipes";

@NgModule({
  declarations: [TokenCanAnyPipe, TokenCanPipe],
  exports: [TokenCanAnyPipe, TokenCanPipe],
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
        authConfigProvider ?? {
          provide: AUTH_SERVICE_CONFIG,
          useValue: {
            // Do not provide any strategy
            strategies: [],
            autoLogin: true,
          },
        },
        authResultHandlersProvider,
      ],
    };
  }
}
