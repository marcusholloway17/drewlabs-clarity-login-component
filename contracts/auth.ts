import { Observable } from "rxjs";
import { StrategyInterface } from "./strategy";

/**
 * An interface to define the shape of the service configuration options.
 */
export interface AuthServiceConfig {
  autoLogin?: boolean;
  strategies: { id: string; strategy: StrategyInterface }[];
  onError?: (error: any) => any;
}

/**
 * The service encapsulating authentication functionality. Exposes methods like
 * `signIn`, `signOut`. Also, exposes an `signInState` `Observable` that one can
 * subscribe to get the current logged in user information.
 *
 */
export interface AuthServiceInterface {
  /**
   * A method used to sign in a user with a specific `Strategy`.
   *
   * @param id Id with which the {@code Strategy} has been registered with the service
   * @param options Optional {@code Strategy} specific arguments
   * @returns A `Promise` that resolves to the authenticated user information
   */
  signIn(id: string, options?: any): Observable<boolean> | Observable<any>;

  /**
   * A method used to sign out the currently loggen in user.
   *
   * @param revoke Optional parameter to specify whether a hard sign out is to be performed
   * @returns A `Promise` that resolves if the operation is successful, rejects otherwise
   */
  signOut(revoke?: boolean): Observable<boolean> | Observable<any>;
}
