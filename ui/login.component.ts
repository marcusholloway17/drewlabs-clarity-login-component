import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  Inject,
  Input,
  Injector,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { map, tap } from "rxjs/operators";
import { Subject, firstValueFrom } from "rxjs";
import { AuthServiceInterface } from "../types";
import { AuthActions, AuthStrategies, AUTH_SERVICE } from "../constants";
import { AuthService } from "../core";

@Component({
  selector: "app-login",
  template: `
    <app-login-view
      [performingAction]="(performingAction$ | async) || false"
      (formSubmitted)="handleSubmit($event)"
      (loadRegistrationViewEvent)="router.navigateByUrl('/register')"
      [moduleName]="moduleName"
      [logoAssetPath]="logoAssetPath"
    ></app-login-view>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnDestroy {
  // Properties definitions
  private destroy$ = new Subject<void>();
  public readonly router = this.injector.get(Router);
  // private data: { [index: string]: any } = this.route.snapshot.data;
  // View text declarations

  // #region Component inputs
  @Input() moduleName!: string;
  @Input() loginHeadingText!: string;
  @Input() logoAssetPath!: string;
  @Input() hasRememberMe!: string;
  // #region Component inputs

  performingAction$ = (this.auth as AuthService)?.actionsState$.pipe(
    map((state) => {
      switch (state) {
        case AuthActions.COMPLETE:
        case AuthActions.FAILED:
          return false;
        case AuthActions.ONGOING:
          return true;
        default:
          return false;
      }
    })
  );

  // Class constructor
  constructor(
    public readonly route: ActivatedRoute,
    @Inject(AUTH_SERVICE) private auth: AuthServiceInterface,
    public readonly injector: Injector
  ) {
    // #region Set Login component properties
    const { moduleName, loginHeadingText, logoAssetPath, hasRememberMe, path } =
      this.route.snapshot.data;
    this.moduleName = moduleName;
    this.loginHeadingText = loginHeadingText;
    this.logoAssetPath = logoAssetPath;
    this.hasRememberMe = hasRememberMe;
    // #endregion  Set Login component properties

    this.auth.signInState$
      .pipe(
        tap((state) => {
          // TODO : CHECK IF USER HAS ABILITIES
          if (state) {
            // TODO : NAVIGATE TO THE APPLICATION DASHBOARD
            setTimeout(() => {
              if (typeof path === "function" && path !== null) {
                return path(this.injector, state);
              }
              return this.router.navigateByUrl(`/${path}`);
            }, 300);
          }
        })
      )
      .subscribe();
  }

  // tslint:disable-next-line: typedef
  async handleSubmit(event: { [index: string]: any }) {
    await firstValueFrom(this.auth.signIn(AuthStrategies.LOCAL, event));
  }

  ngOnDestroy() {
    this.destroy$.next();
  }
}
