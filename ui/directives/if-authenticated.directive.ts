import {
  AfterViewInit,
  Directive,
  Inject,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
} from "@angular/core";
import { Subscription, distinctUntilChanged, map, tap } from "rxjs";
import { AUTH_SERVICE } from "../../constants";
import { AuthServiceInterface } from "../../types";
import { cancelSubscriptions } from "./helpers";

@Directive({
  selector: "[ifAuthenticated]",
})
export class IfAuthenticatedDirective implements AfterViewInit, OnDestroy {
  // #region Component internal properties
  private _hasView: boolean = false;
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
    this._subscriptions.push(
      this.auth.signInState$
        .pipe(
          map((state) => state?.authToken),
          distinctUntilChanged(),
          tap((authToken) => {
            const authenticated = !!authToken;

            // Add template to view container
            if (authenticated && !this._hasView) {
              this.viewContainer.createEmbeddedView(this.template);
              this._hasView = true;
              return;
            }

            // Clear view container
            if (!authenticated && this._hasView) {
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
