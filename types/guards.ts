import { Observable } from "rxjs";

export type TokenGuardType = {
  /**
   * Provides an intereface to check if the token has given scopes
   * provided by the implementation user
   *
   * @param scopes
   * @param redirectTo
   */
  tokenCan(
    scopes: string[] | string,
    redirectTo?: string
  ): Observable<boolean> | Promise<boolean> | boolean;
};
