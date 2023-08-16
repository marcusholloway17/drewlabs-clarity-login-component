import { Observable } from "rxjs";
import { defaultCommonStrings } from "./default";
import { Injector } from "@angular/core";

/**
 * @internal
 * UI texts dictionary type definition
 */
export type CommonStringsType = typeof defaultCommonStrings;

/**
 * Type declaration for common strings provider type
 */
export type ProvideCommonStringsType<
  T extends CommonStringsType = CommonStringsType
> = T | Observable<T> | ((injector: Injector) => Observable<T>);
