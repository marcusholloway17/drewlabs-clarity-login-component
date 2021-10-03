// import { TestBed, tick, fakeAsync } from '@angular/core/testing';
// import { SharedModule } from '../../shared.module';
// import { createTestComponent, SpyObj } from '../../lib/testing/testing';
// import { Router, ActivatedRoute, Data } from '@angular/router';
// import { IHTMLFormControl, DynamicControlParser } from 'src/app/lib/components/dynamic-inputs/core';
// import { ComponentReactiveFormHelpers } from 'src/app/lib/components/dynamic-inputs/core';
// import { FormBuilder } from '@angular/forms';
// import { Injectable, Component, Input } from '@angular/core';
// import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
// import { TranslationModule } from 'src/app/lib/translator';
// import { DrewlabsTranslateLoader } from 'src/app/lib/translator';
// import { HttpClient } from '@angular/common/http';
// import { LoginComponent } from './login.component';
// import { observaleOf } from '../../lib/rxjs/helpers/index';
// import { AppUser } from 'src/app/lib/auth/contracts/v2';
// import { AuthRememberTokenService } from 'src/app/lib/auth-token/core';
// import { AuthService } from 'src/app/lib/auth/core';
// import { GenericUndecoratedSerializaleSerializer } from 'src/app/lib/built-value/core/js/serializer';
// import { buildLoginFormControlObj } from './constants';
// import { ActivatedRouteStub } from '../../lib/testing/activated-route-stub';
// import { isArray } from '../../lib/utils/types/type-utils';
// import { authenticatedResponse, unauthenticatedResponse } from 'src/app/lib/auth/testing';
// import { UserStorageProvider } from '../../lib/auth/core/services/user-storage';
// import { AuthTokenModule } from 'src/app/lib/auth-token';
// import { StorageModule } from 'src/app/lib/storage';
// import { environment } from 'src/environments/environment';
// import { AuthModule } from 'src/app/lib/auth';
// import { HttpClientStub } from 'src/app/lib/testing/http-client';
// import { filter } from 'rxjs/operators';
// import { Log } from '../../lib/utils/logger';
// import { SessionStorage, InMemoryStoreService } from '../../lib/storage/core';
// import { isDefined } from 'src/app/lib/utils/types';

// @Injectable()
// class DynamicControlParserMock {
//   constructor(private formBuilder: FormBuilder) { }

//   public buildFormGroupFromInputConfig(inputs: IHTMLFormControl[]) {
//     return ComponentReactiveFormHelpers.buildFormGroupFromInputConfig(
//       this.formBuilder,
//       inputs,
//     );
//   }
// }

// export class TranslateServiceStub {

//   public get(key: any): any {
//     if (isArray(key)) {
//       return observaleOf((key as string[]).map((k) => `${k}_translated`));
//     }
//     return observaleOf(`${key}_translated`);
//   }
// }

// @Component({
//   selector: 'app-login-view'
// })
// class LoginViewComponentStubComponent {
//   @Input() controlConfigs: IHTMLFormControl[];

//   // tslint:disable-next-line: no-inferrable-types
//   @Input() performingAction: boolean = false;
// }


// const testSetup = (routeData?: Data) => {
//   const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl', 'navigate']) as SpyObj<Router>;
//   const httpClientServiceSpy = new HttpClientStub();
//   const rememberTokenProviderSpy = jasmine.createSpyObj('RememberTokenStorageProvider', ['setToken']) as SpyObj<AuthRememberTokenService>;
//   rememberTokenProviderSpy.setToken.and.returnValue(null);
//   TestBed.configureTestingModule({
//     imports: [
//       SharedModule,
//       StorageModule.forRoot({ secretKey: environment.APP_SECRET }),
//       AuthTokenModule.forRoot({}),
//       AuthModule.forRoot(),
//       TranslateModule.forRoot({
//         loader: {
//           provide: TranslateLoader,
//           useClass: DrewlabsTranslateLoader,
//           deps: [HttpClient]
//         }
//       }),
//       TranslationModule.forRoot({}),
//     ],
//     declarations: [
//       LoginComponent, LoginViewComponentStubComponent
//     ],
//     providers: [
//       {
//         provide: SessionStorage,
//         useClass: InMemoryStoreService
//       },
//       { provide: DynamicControlParser, useClass: DynamicControlParserMock },
//       { provide: Router, useValue: routerSpy },
//       { provide: TranslateService, useClass: TranslateServiceStub },
//       { provide: HTTP_CLIENT, useValue: httpClientServiceSpy },
//       { provide: AuthRememberTokenService, useValue: rememberTokenProviderSpy },
//       { provide: ActivatedRoute, useValue: new ActivatedRouteStub(null, routeData) },
//       AuthService,
//       UserStorageProvider,
//       { provide: 'APP_SECRET', useValue: 'SuperSecretToken' },
//       {
//         provide: 'USER_SERIALIZER',
//         useValue: (new GenericUndecoratedSerializaleSerializer<AppUser>())
//       },
//       {
//         provide: 'DREWLABS_USER_TOKEN_KEY',
//         useValue: 'X_Testing_Auth_Token'
//       },
//     ]
//   });
//   return Object.assign({}, createTestComponent(LoginComponent), { httpClientServiceSpy, routerSpy });
// };

// describe('Login component testing', () => {

//   it('should set component state when component initialize', () => {
//     // Arrange
//     const { component, fixture } = testSetup({ dashboardPath: 'dashboard' });

//     // Assert
//     component.loginViewState$.subscribe(state => {
//       expect(state.performingAction).toEqual(false);
//       expect(state.controlConfigs[0].formControlName).toEqual(buildLoginFormControlObj({})[0].formControlName);
//     });
//     // Act
//     // Trigger changes detection
//     fixture.detectChanges();
//   });

//   it('should call component onChildComponentFormSubmitted method and expect loginState to be true', (done: DoneFn) => {
//     // Arrange
//     let { component, fixture, httpClientServiceSpy } = testSetup({ dashboardPath: 'dashboard' });
//     httpClientServiceSpy = httpClientServiceSpy.setReturnValue(authenticatedResponse);
//     const defaults = { username: 'azandrew@gmail.com', password: 'SuperSecretPassword' };

//     // Trigger changes detection
//     fixture.detectChanges();
//     // Assert
//     component.loginState$
//       .pipe(
//         filter(state => !state.authenticating && isDefined(state.isInitialState))
//       ).subscribe(state => {
//         expect(state.isLoggedIn).toBe(false);
//         done();
//       });
//     // Act
//     done();
//     component.onChildComponentFormSubmitted(defaults);
//   });

//   it('should navigate to dashboard when authenticate successfully', fakeAsync(() => {
//     // Arrange
//     let { component, fixture, httpClientServiceSpy, routerSpy } = testSetup({ dashboardPath: 'dashboard' });
//     httpClientServiceSpy = httpClientServiceSpy.setReturnValue(authenticatedResponse);
//     const defaults = { username: 'azandrew@gmail.com', password: 'SuperSecretPassword' };

//     // Trigger changes detection
//     fixture.detectChanges();
//     // Assert
//     component.loginState$
//       .pipe(
//         filter(state => !state.authenticating && isDefined(state.isInitialState))
//       ).subscribe(() => {
//         expect(routerSpy.navigateByUrl.calls.first().args[0]).toBe('/dashboard');
//       });
//     // Act
//     component.onChildComponentFormSubmitted(defaults);
//     tick(1000);
//   }));

//   it('should have login state with loggedIn status equals false', (done: DoneFn) => {
//     // Arrange
//     let { component, fixture, httpClientServiceSpy } = testSetup({ dashboardPath: 'dashboard' });
//     httpClientServiceSpy = httpClientServiceSpy.setReturnValue(unauthenticatedResponse);
//     const defaults = { username: 'azandrew@gmail.com', password: 'SuperSecretPassword' };

//     // Trigger changes detection
//     fixture.detectChanges();
//     // Assert
//     component.loginState$
//       .pipe(
//         filter(state => !state.authenticating && isDefined(state.isInitialState))
//       ).subscribe((state) => {
//         expect(state.isLoggedIn).toBe(false);
//         done();
//       });
//     // Act
//     component.onChildComponentFormSubmitted(defaults);
//     done();
//   });
// });
