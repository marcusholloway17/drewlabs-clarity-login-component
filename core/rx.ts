import { Observable } from 'rxjs';
import { RequiredProp, SignInResultInterface } from '../types';
import { map } from 'rxjs/operators';
import { tokenCan, tokenCanAny } from './helpers';

/**
 * RxJs operator function that returns the value of `tokenCan` function on an
 * observable of `SignInResultInterface`
 *
 * @param scopes
 */
export function tokenCan$(...scopes: string[]) {
  return (source$: Observable<RequiredProp<SignInResultInterface, 'scopes'>>) =>
    source$.pipe(map((state) => tokenCan(state, ...scopes)));
}

/**
 * RxJs operator function that returns the value of `tokenCanAny` function on an
 * observable of `SignInResultInterface`
 *
 * @param scopes
 */
export function tokenCanAny$(...scopes: string[]) {
  return (source$: Observable<RequiredProp<SignInResultInterface, 'scopes'>>) =>
    source$.pipe(map((state) => tokenCanAny(state, ...scopes)));
}
