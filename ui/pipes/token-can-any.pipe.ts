import { Pipe, PipeTransform } from "@angular/core";
import { RequiredProp, SignInResultInterface } from "../../types";
import { tokenCanAny } from "../../core";

/**
 * Instead of using helper function `[tokenCanAny]` or rxjs operators `[tokenCanAny$]`
 * the `tokenCan` pipe can be used to check if the auth result have
 * any of the provided scopes
 */
@Pipe({
  name: "tokenCanAny",
})
export class TokenCanAnyPipe implements PipeTransform {
  /**
   * {@inheritdoc}
   *
   * @param value
   * @param scopes
   */
  transform(
    value: RequiredProp<SignInResultInterface, "scopes">,
    ...scopes: string[]
  ) {
    if (typeof value === "undefined" || value === null) {
      return false;
    }
    return tokenCanAny(value, ...scopes);
  }
}
