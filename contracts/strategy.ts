import { Observable } from "rxjs";
import { SignInOptionsType, SignInResultInterface } from "./signin";

export interface StrategyInterface {
  initialize(): Promise<void> | Observable<void> | void;

  loginState$: Observable<SignInResultInterface>;

  signIn(options?: SignInOptionsType): Observable<boolean>;

  signOut(revoke?: boolean): Observable<boolean>;
}
