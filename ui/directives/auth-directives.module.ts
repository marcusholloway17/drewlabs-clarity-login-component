import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { IfAuthenticatedDirective } from "./if-authenticated.directive";
import { IfHasAnyScopeDirective } from "./if-has-any-scope.directive";
import { IfHasScopesDirective } from "./if-has-scopes.directive";

@NgModule({
  imports: [CommonModule],
  declarations: [
    IfAuthenticatedDirective,
    IfHasAnyScopeDirective,
    IfHasScopesDirective,
  ],
  exports: [
    IfAuthenticatedDirective,
    IfHasAnyScopeDirective,
    IfHasScopesDirective,
  ],
})
export class AuthDirectivesModule {}
