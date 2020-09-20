import { FormGroup, AbstractControl, NgForm } from '@angular/forms';
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { IHTMLFormControl } from '../../domain/components/dynamic-inputs/core';
import { observableOf } from '../../domain/rxjs/helpers';
import { ComponentReactiveFormHelpers } from '../../domain/helpers/component-reactive-form-helpers';
import { DynamicControlParser } from '../../domain/helpers/dynamic-control-parser';
import { Log } from '../../domain/utils/logger';

@Component({
  selector: 'app-login-view',
  templateUrl: './login-view.component.html',
  styleUrls: ['./login-view.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginViewComponent {

  @Output() formSubmitted = new EventEmitter<object>();
  @Output() loadRegistrationViewEvent = new EventEmitter<boolean>();

  // tslint:disable-next-line: variable-name
  private _componentFormGroup$ = new Observable<FormGroup>();
  // tslint:disable-next-line: typedef
  get componentFormGroup$() {
    return this._componentFormGroup$;
  }

  // tslint:disable-next-line: variable-name
  private _controlConfigs: IHTMLFormControl[];
  @Input() set controlConfigs(value: IHTMLFormControl[]) {
    this._controlConfigs = value;
    this._componentFormGroup$ = observableOf(this.buildForm() as FormGroup);
  }
  // tslint:disable-next-line: typedef
  get controlConfigs() {
    return this._controlConfigs;
  }
  // tslint:disable-next-line: no-inferrable-types
  @Input() performingAction: boolean = false;

  // tslint:disable-next-line: no-inferrable-types
  @Input() loggedIn: boolean = false;

  @ViewChild('loginForm', {static: false}) loginForm: NgForm;

  @Input() public moduleName = 'Module name';
  public elewouLogo = '/assets/images/logo-elewou-main.png';
  /**
   * @description Component object instance initializer
   * @param controlsParser [[DynamicControlParser]] Angular ReactiveForm FormBuilder
   */
  constructor(private controlsParser: DynamicControlParser) {}

  buildForm(): AbstractControl {
    return this.controlsParser.buildFormGroupFromInputConfig(
      this.controlConfigs
    );
  }

  onFormSubmit = (formGroup: FormGroup) =>  {
    // Mark componentFormGroup controls as touched
    ComponentReactiveFormHelpers.validateFormGroupFields(
      formGroup
    );
    // Check if the formGroup is valid
    if (formGroup.valid) {
      // Fire formSubmitted event with the formGroup value
      this.formSubmitted.emit(formGroup.getRawValue());
    }
  }

  onNavigateToRegistrationView = () => {
    this.loadRegistrationViewEvent.emit(true);
  }
}
