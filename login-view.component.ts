import { FormGroup, AbstractControl, NgForm } from "@angular/forms";
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ViewChild,
  Inject,
} from "@angular/core";
import { IHTMLFormControl } from "../../core/components/dynamic-inputs/core";
import {
  AngularReactiveFormBuilderBridge,
  ANGULAR_REACTIVE_FORM_BRIDGE,
  ComponentReactiveFormHelpers,
} from "../../core/components/dynamic-inputs/angular";

@Component({
  selector: "app-login-view",
  templateUrl: "./login-view.component.html",
  styleUrls: ["./login-view.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginViewComponent {
  @Output() formSubmitted = new EventEmitter<object>();
  @Output() loadRegistrationViewEvent = new EventEmitter<boolean>();

  public formGroup: FormGroup;

  // tslint:disable-next-line: variable-name
  private _controlConfigs!: IHTMLFormControl[];
  @Input() set controlConfigs(value: IHTMLFormControl[]) {
    this._controlConfigs = value;
    this.formGroup = this.builder.group(value) as FormGroup;
  }
  // tslint:disable-next-line: typedef
  get controlConfigs() {
    return this._controlConfigs;
  }
  // tslint:disable-next-line: no-inferrable-types
  @Input() performingAction: boolean = false;

  // tslint:disable-next-line: no-inferrable-types
  @Input() loggedIn: boolean = false;

  @ViewChild("loginForm") loginForm!: NgForm;

  @Input() public moduleName = "FinApp Clients";
  public workspaceLogo = "app/lib/views/global-styles/assets/images/app-logo.png";

  /**
   * @description Component object instance initializer
   * @param controlsParser [[DynamicControlParser]] Angular ReactiveForm FormBuilder
   */
  constructor(
    @Inject(ANGULAR_REACTIVE_FORM_BRIDGE)
    private builder: AngularReactiveFormBuilderBridge
  ) {}

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
