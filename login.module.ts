import {
  Injector,
  ModuleWithProviders,
  NgModule,
  Provider,
} from "@angular/core";
import { Router } from "@angular/router";
import {
  AUTH_ACTION_HANDLERS,
  AUTH_SERVICE,
  AUTH_SERVICE_CONFIG,
} from "./constants";
import {
  ActionHandlersType,
  AuthService,
  provideAuthActionHandlersFactory,
  AuthClientConfig,
  AUTH_CLIENT_CONFIG,
  AuthClientInterceptor,
} from "./core";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { AuthInterceptor } from "./http";
import { TokenCanAnyPipe, TokenCanPipe } from "./ui/pipes";
import { ProvideCommonStringsType, provideCommonStrings } from "./ui";
import { ProvideAuthServiceConfig } from "./types";

@NgModule({
  declarations: [TokenCanAnyPipe, TokenCanPipe],
  exports: [TokenCanAnyPipe, TokenCanPipe],
})
export class LoginModule {
  static forRoot(config: {
    handleActions: ActionHandlersType;
    authConfigProvider: ProvideAuthServiceConfig;
    authClientConfigProvider?: (injector: Injector) => AuthClientConfig;
    strings?: ProvideCommonStringsType;
  }): ModuleWithProviders<LoginModule> {
    const {
      handleActions,
      authConfigProvider,
      authClientConfigProvider,
      strings,
    } = config;

    const providers: Provider[] = [
      {
        provide: AUTH_ACTION_HANDLERS,
        useFactory: (injector: Injector, router: Router) => {
          return provideAuthActionHandlersFactory(handleActions)(
            injector,
            router
          );
        },
        deps: [Injector, Router],
      },
      {
        provide: AUTH_SERVICE_CONFIG,
        useFactory: authConfigProvider,
        deps: [Injector],
      },
      {
        provide: AUTH_SERVICE,
        useClass: AuthService,
      },
      {
        provide: AUTH_CLIENT_CONFIG,
        useFactory:
          authClientConfigProvider ??
          (() => {
            return {
              id: "",
              secret: "",
            } as AuthClientConfig;
          }),
        deps: [Injector],
      },
      {
        provide: HTTP_INTERCEPTORS,
        useClass: AuthClientInterceptor,
        multi: true,
      },
      {
        provide: HTTP_INTERCEPTORS,
        useClass: AuthInterceptor,
        multi: true,
      },
    ];

    // Provide common strings for UI component if strings provider
    // is specidied in the configuration object
    if (strings) {
      providers.push(provideCommonStrings(strings));
    }

    return { ngModule: LoginModule, providers };
  }
}
