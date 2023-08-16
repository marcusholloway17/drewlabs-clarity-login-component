import { InjectionToken } from "@angular/core";
import { Observable } from "rxjs";
import { CommonStringsType } from "./types";

/**
 * Common strings provider injection token
 */
export const COMMON_STRINGS = new InjectionToken<Observable<CommonStringsType>>(
  "Common Strings Provider Token"
);
