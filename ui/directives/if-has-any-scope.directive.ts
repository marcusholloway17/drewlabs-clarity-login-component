import {
  AfterViewInit,
  Directive,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  TemplateRef,
  ViewContainerRef,
} from "@angular/core";
import { AUTH_SERVICE } from "../../constants";
import { AuthServiceInterface } from "../../types";
import { Subscription, distinctUntilChanged, map, tap } from "rxjs";
import { tokenCanAny } from "../../core";
import { cancelSubscriptions } from "./helpers";

@Directive({
  selector: "[ifHasAnyScope]",
})
export class IfHasAnyScopeDirective
  implements AfterViewInit, OnDestroy, OnChanges
{
  // #region Component inputs
  private _scopes!: string[];
  @Input() set ifHasAnyScope(value: string[]) {
    this._scopes = value ?? [];
  }
  get scopes() {
    return this._scopes;
  }
  // #endregion Component inputs

  // #region Component internal properties
  private _hasView: boolean = false;
  private _showView: boolean = false;
  private _subscriptions: Subscription[] = [];
  // #endregion Component internal properties

  constructor(
    private template: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    @Inject(AUTH_SERVICE) private auth: AuthServiceInterface
  ) {}

  //
  ngAfterViewInit(): void {
    //
    this.updateView();
  }

  //
  ngOnChanges(changes: SimpleChanges): void {
    if ("ifHasAnyScope" in changes) {
      this.resetState();
      this.updateView();
    }
  }
  /**
   * Reset directive state
   */
  private resetState() {
    cancelSubscriptions(this._subscriptions ?? []);
    this._subscriptions = [];
  }

  /**
   * Update directive view container template
   */
  private updateView() {
    const _scopes = this.scopes ?? [];
    this._subscriptions.push(
      this.auth.signInState$
        .pipe(
          map((state) => state?.scopes ?? []),
          distinctUntilChanged(),
          tap((scopes) => {
            const _hasScope = tokenCanAny({ scopes }, ..._scopes);

            // Add template to view container
            if (_hasScope && !this._hasView) {
              this.viewContainer.createEmbeddedView(this.template);
              this._hasView = true;
              return;
            }

            // Clear view container
            if (!_hasScope && this._hasView) {
              this.viewContainer.clear();
              this._hasView = false;
              return;
            }
          })
        )
        .subscribe()
    );
  }

  //
  ngOnDestroy(): void {
    cancelSubscriptions(this._subscriptions);
  }
}
