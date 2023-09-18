import { NgModule } from "@angular/core";
import {
  LOGIN_NAVIGATION_COMPONENTS,
  LoginRoutingModule,
} from "./login-routing.module";
import { CommonStringsModule } from "./common-strings";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { ClarityModule } from "@clr/angular";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    LoginRoutingModule,
    ClarityModule,
    CommonStringsModule,
  ],

  declarations: [...LOGIN_NAVIGATION_COMPONENTS],
})
export class LoginModule {}
