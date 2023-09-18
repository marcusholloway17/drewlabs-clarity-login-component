import { Observable } from "rxjs";
import { SignInOptionsType, SignInResultInterface } from "./signin";

export interface StrategyInterface {
  initialize(autologin?: boolean): Promise<void> | Observable<void> | void;

  signInState$: Observable<SignInResultInterface|undefined>;

  getLoginStatus(): Promise<SignInResultInterface|undefined>;

  signIn(options?: SignInOptionsType): Observable<boolean>;

  signOut(revoke?: boolean): Observable<boolean>;
}
