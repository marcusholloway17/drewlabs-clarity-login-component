import { Injector, ModuleWithProviders, NgModule } from "@angular/core";
import {
  LOGIN_NAVIGATION_COMPONENTS,
  LoginRoutingModule,
} from "./login-routing.module";
import { Router, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ClarityModule } from "@clr/angular";
import { StrategyBasedAuthModule } from "./core/auth.module";
import { UITextsModule } from "./ui-text";
import {
  AUTH_ACTION_HANDLERS,
  AUTH_SERVICE,
  AUTH_SERVICE_CONFIG,
} from "./constants";
import {
  ActionHandlersType,
  AuthService,
  ProvideAuthServiceConfig,
  provideAuthActionHandlersFactory,
  AuthClientConfig,
  AUTH_CLIENT_CONFIG,
} from "./core";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    LoginRoutingModule,
    ClarityModule,
    StrategyBasedAuthModule,
    UITextsModule,
  ],
  declarations: [...LOGIN_NAVIGATION_COMPONENTS],
})
export class LoginModule {
  static forRoot(config: {
    handleActions: ActionHandlersType;
    authConfigProvider: ProvideAuthServiceConfig;
    authClientConfigProvider?: (injector: Injector) => AuthClientConfig;
  }): ModuleWithProviders<LoginModule> {
    const { handleActions, authConfigProvider, authClientConfigProvider } =
      config;
    return {
      ngModule: LoginModule,
      providers: [
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
      ],
    };
  }
}
