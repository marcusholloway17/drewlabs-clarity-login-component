import {
  FormGroup,
  AbstractControl,
  NgForm,
  FormBuilder,
  FormArray,
  Validators,
} from "@angular/forms";
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ViewChild,
} from "@angular/core";

@Component({
  selector: "app-login-view",
  templateUrl: "./login-view.component.html",
  styleUrls: ["./login-view.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginViewComponent {
  @Output() formSubmitted = new EventEmitter<object>();
  @Output() loadRegistrationViewEvent = new EventEmitter<boolean>();

  public formGroup: FormGroup = this.builder.group({
    username: this.builder.control(
      undefined,
      Validators.compose([Validators.maxLength(190), Validators.required])
    ),
    password: this.builder.control(
      undefined,
      Validators.compose([
        Validators.required,
        Validators.pattern(/((?=[a-zA-Z]*)(?=d*)(?=[~!@#$%^&*()/-_]*).{6,})/),
      ])
    ),
  });

  // tslint:disable-next-line: no-inferrable-types
  @Input() performingAction: boolean = false;
  // tslint:disable-next-line: no-inferrable-types
  @Input() loggedIn: boolean = false;
  @ViewChild("loginForm") loginForm!: NgForm;
  @Input() public moduleName = "APPNAME";
  @Input() logoAssetPath = "...";
  @Input() hasRememberMe!: boolean;

  /**
   * Component object instance initializer
   * @param builder
   */
  constructor(private builder: FormBuilder) {}

  onFormSubmit(formGroup: FormGroup) {
    // Mark componentFormGroup controls as touched
    this.validateFormGroupFields(formGroup);
    // Check if the formGroup is valid
    if (formGroup.valid) {
      // Fire formSubmitted event with the formGroup value
      this.formSubmitted.emit(formGroup.getRawValue());
    }
  }

  private validateFormGroupFields(control: FormGroup | FormArray): void {
    Object.keys(control.controls).forEach((field: string) => {
      if (control.get(field) instanceof FormGroup) {
        this.validateFormGroupFields(control.get(field) as FormGroup);
      } else {
        this.markControlAsTouched(control.get(field) || undefined, field);
      }
    });
  }

  private markControlAsTouched(
    control?: AbstractControl,
    field?: string
  ): void {
    if (control) {
      control?.markAsTouched({ onlySelf: true });
      control?.markAsDirty({ onlySelf: true });
      control?.markAsPristine({ onlySelf: true });
    }
  }

  onNavigateToRegistrationView = () => {
    this.loadRegistrationViewEvent.emit(true);
  };
}
