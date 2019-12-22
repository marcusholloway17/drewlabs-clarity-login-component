import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy
} from '@angular/core';
import { IHTMLFormControl } from 'src/app/lib/domain/components/dynamic-inputs/core';
import { ComponentReactiveFormHelpers } from 'src/app/lib/presentation/component-reactive-form-helpers';
import { UIState } from 'src/app/lib/domain/components/ui-store/ui-state';
import { Subscription } from 'rxjs';
import { AppUIStoreManager } from '../app-ui-store-manager.service';
import { AlertConfig } from 'src/app/lib/domain/components/app-alert/app-alert.component';
import { SessionStorage } from 'src/app/lib/domain/storage/core/session-storage.service';
import { HttpRequestConfigs } from 'src/app/lib/domain/http/core';
import { isDefined } from 'src/app/lib/domain/utils/type-utils';
import { TranslatorService } from 'src/app/lib/application/services/translator/translator.service';

@Component({
  selector: 'app-login-view',
  templateUrl: './login-view.component.html',
  styleUrls: ['./login-view.component.css']
})
export class LoginViewComponent implements OnInit, OnDestroy {
  public componentFormGroup: FormGroup;
  @Input() controlConfigs: IHTMLFormControl[];
  @Output() formSubmitted: EventEmitter<object> = new EventEmitter<object>();
  performingAction: boolean;
  actionUiMessage: string;
  uiStoreSubscriptions: Subscription[] = [];
  /**
   * @description Component object instance initializer
   * @param builder [[FormBuilder]] Angular ReactiveForm FormBuilder
   * @param appUIStoreManager [[AppUIStoreManager]]
   */
  constructor(
    private builder: FormBuilder,
    public appUIStoreManager: AppUIStoreManager,
    public cache: SessionStorage,
    public translate: TranslatorService
  ) { }

  get alertProperties(): AlertConfig {
    return this.appUIStoreManager.alertConfigs;
  }

  ngOnInit() {
    this.uiStoreSubscriptions.push(
      this.appUIStoreManager.appUIStore.uiState.subscribe(
        (uiState: UIState) => {
          this.performingAction = uiState.performingAction;
          this.actionUiMessage = uiState.uiMessage;
        }
      )
    );
    if (isDefined(this.cache.get(HttpRequestConfigs.sessionExpiredStorageKey))) {
      this.translate.translate('sessionExpired').toPromise().then(translation => {
        this.appUIStoreManager.completeActionWithError(translation);
        setTimeout(() => {
          this.appUIStoreManager.completeUIStoreAction();
        }, 3000);
      });
    }
  }

  buildForm(): AbstractControl {
    return ComponentReactiveFormHelpers.buildFormGroupFromInputConfig(
      this.builder,
      this.controlConfigs
    );
  }

  onFormSubmit() {
    // Mark componentFormGroup controls as touched
    ComponentReactiveFormHelpers.validateFormGroupFields(
      this.componentFormGroup
    );
    // Check if the formGroup is valid
    if (this.componentFormGroup.valid) {
      // Fire formSubmitted event with the formGroup value
      this.formSubmitted.emit(this.componentFormGroup.getRawValue());
    } else {
      // Show error message
    }
  }

  ngOnDestroy() {
    if (this.uiStoreSubscriptions.length > 0) {
      this.uiStoreSubscriptions.map(subscription => subscription.unsubscribe());
    }
  }
}
