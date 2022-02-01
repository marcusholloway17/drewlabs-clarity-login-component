import { Observable } from "rxjs";
import { SignInOptionsType, SignInResultInterface } from "./signin";

export interface StrategyInterface {

  loginState$: Observable<SignInResultInterface>;

  signIn(options?: SignInOptionsType): Observable<boolean>;

  signOut(revoke?: boolean): Observable<boolean>;
}
