import {
  ChangeDetectorRef,
  Inject,
  Optional,
  Pipe,
  PipeTransform,
} from "@angular/core";
import { Observable, Subscription, map, of } from "rxjs";
import { COMMON_STRINGS } from "./tokens";
import { defaultCommonStrings } from "./default";

function getObjectProperty<T extends { [prop: string]: any }>(
  source: T,
  key: string,
  seperator = "."
) {
  if (
    key === "" ||
    typeof key === "undefined" ||
    key === null ||
    typeof source === "undefined" ||
    source === null
  ) {
    return source ?? undefined;
  }
  if (key.includes(seperator ?? ".")) {
    // Creates an array of inner properties
    const properties = key.split(seperator ?? ".");
    const current = source;
    // Reduce the source object to a single value
    return properties.reduce((carry, prop) => {
      if (carry) {
        carry =
          typeof current === "object" && current !== null && carry[prop]
            ? carry[prop] ?? undefined
            : undefined;
      }
      return carry;
    }, source);
  } else {
    return source ? source[key] : undefined;
  }
}

@Pipe({
  name: "commonString",
  pure: false,
})
export class CommonStringsPipe implements PipeTransform {
  // #region Class properties
  private _latestValue: string | unknown = "...";
  private _ref: ChangeDetectorRef | null;
  private _subscription!: Subscription | null;
  private _search!: string | null;
  private _commonStrings!: Observable<Record<string, any>>;
  // #endregion Class properties

  constructor(
    @Optional() ref: ChangeDetectorRef,
    @Inject(COMMON_STRINGS)
    @Optional()
    commonStrings?: Observable<Record<string, any>>
  ) {
    this._ref = ref;
    this._commonStrings = commonStrings ?? of(defaultCommonStrings);
  }

  //
  private updateResult(query: string) {
    // Set the current search string to equals the search argument value
    this._search = query;

    this._subscription = this._commonStrings
      .pipe(map((value) => {
        return getObjectProperty(value, query);
      }))
      .subscribe((result) => this._updateLatestValue(query, result));
  }

  private _updateLatestValue(search: string, value: unknown): void {
    if (search === this._search) {
      this._latestValue = value ?? "...";
      // Note: `this._ref` is only cleared in `ngOnDestroy` so is known to be available when a
      // value is being updated.
      this._ref?.markForCheck();
    }
  }

  private dispose() {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
    this._latestValue = null;
    this._subscription = null;
    this._search = null;
  }

  //
  transform(query: string, module?: string, _default: string = "..."): any {
    const _query = module
      ? `${module.toString()}.${query.toString()}`
      : `${query.toString()}`;

    if (!this._search) {
      // if we ask another time for the same key, return the last value
      this.updateResult(_query);
      return this._latestValue ?? _default;
    }

    if (_query !== this._search) {
      this.dispose();
      this.transform(query, _default);
    }

    return this._latestValue ?? _default;
  }

  ngOnDestroy() {
    this.dispose();
    this._ref = null;
  }
}
