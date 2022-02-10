// import { TestBed } from '@angular/core/testing';
// import { SharedModule } from '../../shared.module';
// import { LoginViewComponent } from './login-view.component';
// import { createTestComponent, TestingComponentContainer } from '../../lib/testing/testing';
// import { buildLoginFormControlObj } from './constants/login-form';
// import { Router } from '@angular/router';
// import { IHTMLFormControl, DynamicControlParser } from 'src/app/lib/components/dynamic-inputs/core';
// import { ComponentReactiveFormHelpers } from 'src/app/lib/components/dynamic-inputs/core';
// import { FormBuilder, AbstractControl } from '@angular/forms';
// import { Injectable } from '@angular/core';
// import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
// import { TranslationModule } from 'src/app/lib/translator';
// import { DrewlabsTranslateLoader } from 'src/app/lib/translator';
// import { HttpClient } from '@angular/common/http';

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

// const testSetup = () => {
//   const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl', 'navigate']);
//   TestBed.configureTestingModule({
//     imports: [SharedModule,
//       TranslateModule.forRoot({
//         loader: {
//           provide: TranslateLoader,
//           useClass: DrewlabsTranslateLoader,
//           deps: [HttpClient]
//         }
//       }),
//       TranslationModule.forRoot({})
//     ],
//     declarations: [
//       LoginViewComponent
//     ],
//     providers: [
//       { provide: DynamicControlParser, useClass: DynamicControlParserMock },
//       { provide: Router, useValue: routerSpy }
//     ]
//   });
//   return createTestComponent(LoginViewComponent);
// };

// describe('Login View Component testing', () => {

//   it('should call builForm when parent set input property', (done: DoneFn) => {
//     // Arrange
//     const { component, fixture } = testSetup();
//     // const nativeElement = debugElement.nativeElement;
//     const page = new TestingComponentContainer<LoginViewComponent, any>(fixture, ['onFormSubmit', 'buildForm']);
//     // Simulate parent setting the component control configs
//     component.controlConfigs = buildLoginFormControlObj({});
//     // Act
//     // Trigger changes detection
//     fixture.detectChanges();
//     // Assert
//     component.componentFormGroup$.subscribe((state) => {
//       const control = state.controls[component.controlConfigs[0].formControlName];
//       expect(control instanceof AbstractControl).toBe(true);
//       done();
//     });
//     expect(page.getSpyMethod('buildForm').calls.any()).toBe(true, 'Expect to call component buildForm method');
//   });
//   it('should call onFormSubmit when triggers form submission', () => {
//     // Arrange
//     const { component, fixture, debugElement } = testSetup();
//     // const nativeElement = debugElement.nativeElement;
//     const page = new TestingComponentContainer<LoginViewComponent, any>(fixture, ['onFormSubmit', 'buildForm']);
//     // Simulate parent setting the component control configs
//     component.controlConfigs = buildLoginFormControlObj({});
//     // Act
//     // Trigger changes detection
//     fixture.detectChanges();
//     // Assert
//     component.loginForm.ngSubmit.emit({});
//     expect(page.getSpyMethod('onFormSubmit').calls.any()).toBe(true, 'Expect to call component onFormSubmit when trigger form submission method');
//   });
//   it('should create a form with 2 text input', () => {
//     // Arrange
//     const { component, fixture, debugElement } = testSetup();
//     // const nativeElement = debugElement.nativeElement;
//     const page = new TestingComponentContainer<LoginViewComponent, HTMLInputElement>(fixture, ['onFormSubmit', 'buildForm']);
//     // Simulate parent setting the component control configs
//     component.controlConfigs = buildLoginFormControlObj({});
//     // Act
//     // Trigger changes detection
//     fixture.detectChanges();
//     // Assert
//     expect(page.queryAll('input').length).toBe(2, 'expect total number of inputs to be 2');
//   });
//   it('should emit form submitted event when trigger form submission', (done: DoneFn) => {
//     // Arrange
//     const { component, fixture } = testSetup();
//     const defaults = { username: 'azandrew@gmail.com', password: 'SuperSecretPassword' };
//     // Simulate parent setting the component control configs
//     component.controlConfigs = buildLoginFormControlObj({}, false, defaults);
//     // Act
//     // Trigger changes detection
//     fixture.detectChanges();
//     // Assert
//     component.formSubmitted.subscribe((state: any) => {
//       expect(state).toEqual(defaults);
//       done();
//     });
//     component.loginForm.ngSubmit.emit();
//   });
// });
