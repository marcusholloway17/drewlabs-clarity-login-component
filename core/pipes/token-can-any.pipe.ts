import { Pipe, PipeTransform } from '@angular/core';
import { RequiredProp, SignInResultInterface } from '../../contracts';
import { tokenCanAny } from '../helpers';

/**
 * Instead of using helper function `[tokenCanAny]` or rxjs operators `[tokenCanAny$]`
 * the `tokenCan` pipe can be used to check if the auth result have
 * any of the provided scopes
 */
@Pipe({
  name: 'tokenCanAny',
})
export class TokenCanAnyPipe implements PipeTransform {
  /**
   * {@inheritdoc}
   *
   * @param value
   * @param scopes
   */
  transform(
    value: RequiredProp<SignInResultInterface, 'scopes'>,
    ...scopes: string[]
  ) {
    return tokenCanAny(value, ...scopes);
  }
}
