import { FormGroup, AbstractControl, NgForm } from "@angular/forms";
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ViewChild,
} from "@angular/core";
import { IHTMLFormControl } from "../../core/components/dynamic-inputs/core";
import { createStateful } from "../../core/rxjs/helpers";
import { DynamicControlParser } from "../../core/helpers/dynamic-control-parser";
import { ComponentReactiveFormHelpers } from "../../core/components/dynamic-inputs/angular";

interface LoginViewState {
  controlConfigs: IHTMLFormControl[];
  username: string | undefined;
  password: string | undefined;
}

@Component({
  selector: "app-login-view",
  templateUrl: "./login-view.component.html",
  styleUrls: ["./login-view.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginViewComponent {
  @Output() formSubmitted = new EventEmitter<object>();
  @Output() loadRegistrationViewEvent = new EventEmitter<boolean>();

  // tslint:disable-next-line: variable-name
  private _componentFormGroup$ = createStateful<FormGroup | undefined>(
    undefined
  );
  // tslint:disable-next-line: typedef
  get componentFormGroup$() {
    return this._componentFormGroup$.asObservable();
  }

  // tslint:disable-next-line: variable-name
  private _controlConfigs!: IHTMLFormControl[];
  get controlConfigs() {
    return this._controlConfigs;
  }

  @Input() set state(value: LoginViewState) {
    this._controlConfigs = value.controlConfigs;
    const formgroup = this.buildForm() as FormGroup;
    // #region Set Default username an password before returning the formgroup
    if (value?.username && value?.password) {
      formgroup.get("username")?.setValue(value?.username);
      formgroup.get("password")?.setValue(value?.password);
    }
    // #endregion
    this._componentFormGroup$.next(formgroup);
  }
  // tslint:disable-next-line: no-inferrable-types
  @Input() performingAction: boolean = false;

  // tslint:disable-next-line: no-inferrable-types
  @Input() loggedIn: boolean = false;

  @ViewChild("loginForm") loginForm!: NgForm;

  @Input() public moduleName = "Controle de Vie CNSS";
  public appLogo = "/assets/images/app-logo.png";

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

  onFormSubmit = (formGroup: FormGroup) => {
    // Mark componentFormGroup controls as touched
    ComponentReactiveFormHelpers.validateFormGroupFields(formGroup);
    // Check if the formGroup is valid
    if (formGroup.valid) {
      // Fire formSubmitted event with the formGroup value
      this.formSubmitted.emit(formGroup.getRawValue());
    }
  };

  onNavigateToRegistrationView = () => {
    this.loadRegistrationViewEvent.emit(true);
  };
}
