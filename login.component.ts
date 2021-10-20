import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  Inject,
  Optional,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { mergeMap, takeUntil, tap, filter, map } from "rxjs/operators";
import { Subject } from "rxjs";
import { TRANSLATIONS, buildLoginFormControlObj } from "./constants";
import { TranslationService } from "src/app/lib/core/translator";
import { AuthService } from "src/app/lib/core/auth/core";
import { SessionStorage } from "src/app/lib/core/storage/core";
import { observableOf } from "src/app/lib/core/rxjs/helpers";
import { isDefined } from "src/app/lib/core/utils";
import { doLog } from "src/app/lib/core/rxjs/operators";
import { User, userCanAny } from "src/app/lib/core/auth/contracts/v2";
import { IHTMLFormControl } from "src/app/lib/core/components/dynamic-inputs/core";
import { AppUIStateProvider } from "src/app/lib/core/ui-state";
import { UIStateStatusCode } from "src/app/lib/core/contracts/ui-state";
import {
  ConfigurationManager,
  CONFIG_MANAGER,
} from "src/app/lib/core/configuration";
export interface ComponentState {
  translations: { [index: string]: any };
  controlConfigs: IHTMLFormControl[];
  performingAction: boolean;
}

@Component({
  selector: "app-login",
  template: `
    <ng-container *ngIf="loginViewState$ | async as state">
      <app-login-view
        [state]="{
          controlConfigs: state?.controlConfigs,
          username: username,
          password: password
        }"
        [performingAction]="(uiState$ | async)?.performingAction"
        (formSubmitted)="onChildComponentFormSubmitted($event)"
        (loadRegistrationViewEvent)="router.navigateByUrl('/register')"
        [moduleName]="moduleName"
      ></app-login-view>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnDestroy {
  private destroy$ = new Subject<{}>();
  moduleName = this.route.snapshot.data.moduleName;
  loginHeadingText = this.route.snapshot.data.loginHeadingText;
  // Load translations
  translations$ = this.translate
    .translate(TRANSLATIONS)
    .pipe(doLog("Translations loaded...."));

  loginViewState$ = this.translations$.pipe(
    mergeMap((source) =>
      observableOf({
        controlConfigs: buildLoginFormControlObj(source),
      })
    )
  );
  uiState$ = this.uiState.uiState;

  loginState$ = this.auth.state$.pipe(
    map((state) => {
      if (state.authenticating) {
        this.uiState.startAction();
      } else if (isDefined(state.isInitialState) && !state.isInitialState) {
        this.uiState.endAction(
          "",
          state.isLoggedIn
            ? UIStateStatusCode.AUTHENTICATED
            : UIStateStatusCode.UNAUTHENTICATED
        );
      }
      return state;
    })
  );

  isProduction: boolean = this.config?.get("production");
  username: string = !this.isProduction
    ? this.config?.get("dev.users.username")
    : undefined;
  password: string = !this.isProduction
    ? this.config?.get("dev.users.password")
    : undefined;

  constructor(
    private translate: TranslationService,
    private uiState: AppUIStateProvider,
    public route: ActivatedRoute,
    private auth: AuthService,
    public readonly router: Router,
    cache: SessionStorage,
    @Optional() @Inject(CONFIG_MANAGER) public config?: ConfigurationManager
  ) {
    // Component state observale
    // Checks for session expiration
    if (isDefined(cache.get("X_SESSION_EXPIRED"))) {
      this.translations$
        .pipe(takeUntil(this.destroy$))
        .subscribe((translations) => {
          this.uiState.endAction(
            translations.sessionExpired,
            UIStateStatusCode.UNAUTHORIZED
          );
          setTimeout(() => {
            this.uiState.endAction();
            cache.delete("X_SESSION_EXPIRED");
          }, 3000);
        });
    } else {
      this.uiState.endAction();
    }

    // Set login state
    this.loginState$
      .pipe(
        takeUntil(this.destroy$),
        filter(
          (state) => !state.authenticating && isDefined(state.isInitialState)
        ),
        doLog("Logging state in loggin component: "),
        tap((state) => {
          if (state.isLoggedIn) {
            // Checks if user has permission provided to the login component
            if (
              !(
                state.user &&
                state.user instanceof User &&
                isDefined(this.route.snapshot.data.authorizations) &&
                !userCanAny(
                  state.user,
                  this.route.snapshot.data.authorizations ?? []
                )
              )
            ) {
              // Navigate to dashboard
              setTimeout(() => {
                console.log(`Navigating to: /${this.route.snapshot.data.path}`);
                this.router.navigateByUrl(`/${this.route.snapshot.data.path}`);
              }, 1000);
            }
          }
        })
      )
      .subscribe();
    // End Checks for auth expiration
  }

  // tslint:disable-next-line: typedef
  async onChildComponentFormSubmitted(event: any) {
    // Start the UiState action
    this.uiState.startAction();
    await this.auth.authenticate(Object.assign({}, event)).toPromise();
  }

  runningInProdution() {
    return Boolean();
  }

  ngOnDestroy = () => this.destroy$.next();
}
