import { ResponseErrorBag } from 'src/app/lib/domain/http/contracts/http-response-data';
import { AuthUser } from 'src/app/lib/domain/auth/contracts/user';
import { FormGroup } from '@angular/forms';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import {
  InputTypes,
  IHTMLFormControl,
  TextInput,
  PasswordInput
} from 'src/app/lib/domain/components/dynamic-inputs/core';
import { LoginViewComponent } from './login-view.component';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from 'src/app/lib/application/services/identity/authentication.service';
import { User } from 'src/app/lib/domain/auth/models/user';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AppRoutes } from '../routes-definitions';
import { IFormParentComponent } from 'src/app/lib/domain/helpers/component-interfaces';
import { AppUIStoreManager } from 'src/app/lib/domain/helpers/app-ui-store-manager.service';

@Component({
  selector: 'app-login',
  template: `
    <app-login-view
      [controlConfigs]="loginInputsConfig"
      (formSubmitted)="onChildComponentFormSubmitted($event)"
      #childView
    ></app-login-view>
  `
})
export class LoginComponent implements OnInit, OnDestroy, IFormParentComponent {
  @ViewChild('childView', { static: true }) childView: LoginViewComponent;
  public loginInputsConfig: IHTMLFormControl[] = [];

  constructor(
    private translate: TranslateService,
    private authService: AuthenticationService,
    private appUIStoreManager: AppUIStoreManager,
    private router: Router
  ) { }

  ngOnInit() {
    this.translate
      .get(['login.username', 'login.password'])
      .subscribe(values => {
        const username: string = values['login.username']
          ? values['login.username']
          : 'Identifiant';
        const password: string = values['login.password']
          ? values['login.password']
          : 'Mot de passe';
        this.loginInputsConfig = [
          {
            label: username,
            type: InputTypes.TEXT_INPUT,
            placeholder: username,
            formControlName: 'user_name',
            classes: 'clr-input',
            rules: {
              isRequired: true,
              maxLength: true
            },
            maxLength: 100,
            value: environment.testUser
          } as TextInput,
          {
            label: password,
            type: InputTypes.PASSWORD_INPUT,
            placeholder: password,
            formControlName: 'user_password',
            classes: 'clr-input',
            pattern: '((?=[a-zA-Z]*)(?=d*)(?=[~!@#$%^&*()/-_]*).{6,})',
            rules: {
              isRequired: true,
              pattern: true
            },
            minLength: 6,
            value: environment.testUserPassword
          } as PasswordInput
        ];
        // Initialise child component input properties manually
        this.childView.controlConfigs = this.loginInputsConfig;
        // Build the form group
        this.childView.componentFormGroup = this.childView.buildForm() as FormGroup;
      });
  }

  onChildComponentFormSubmitted(event: any) {
    this.translate
      .get([
        'login.authenticationFailed',
        'login.authenticating',
        'invalidRequestParams',
        'serverRequestFailed'
      ])
      .subscribe(values => {
        this.appUIStoreManager.initializeUIStoreAction(values['login.authenticating']);
        this.authService
          .authenticateUser({
            username: event.user_name,
            password: event.user_password,
            remeberMe: false
          })
          .then((res: AuthUser | ResponseErrorBag | null) => {
            // 502 : Bad request response returned from server
            if (res instanceof ResponseErrorBag) {
              this.appUIStoreManager.completeActionWithWarning(values.invalidRequestParams);
            }
            // User is authenticated successfully
            if (res instanceof User) {
              // Navigate to dashboard
              this.router.navigate([AppRoutes.dashboardHomeRoute]);
              this.appUIStoreManager.completeUIStoreAction();
            }
            // The res is null, could not authenticate user
            if (res === null) {
              this.appUIStoreManager.completeActionWithError(values['login.authenticationFailed']);
            }
          })
          .catch(err => {
            // Handle exception rejected from the request
            this.appUIStoreManager.completeActionWithError(values.serverRequestFailed);
          });
      });
  }

  ngOnDestroy() {
    this.appUIStoreManager.resetUIStore();
  }
}
