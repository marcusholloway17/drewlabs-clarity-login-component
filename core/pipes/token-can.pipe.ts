import { Pipe, PipeTransform } from '@angular/core';
import { RequiredProp, SignInResultInterface } from '../../contracts';
import { tokenCan } from '../helpers';

/**
 * Instead of using helper function, or rxjs operators [tokenCan$]
 * the `tokenCan` pipe can be used to check if the auth result have
 * all provided scopes
 */
@Pipe({
  name: 'tokenCan',
})
export class TokenCanPipe implements PipeTransform {
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
    if (typeof value === 'undefined' || value === null) {
      return false;
    }
    return tokenCan(value, ...scopes);
  }
}
