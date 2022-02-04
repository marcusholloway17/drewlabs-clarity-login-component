import { NgModule } from "@angular/core";
import {
  LOGIN_NAVIGATION_COMPONENTS,
  LoginRoutingModule,
} from "./login-routing.module";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { ClarityModule } from "@clr/angular";
import { StrategyBasedAuthModule } from "./core/auth.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    LoginRoutingModule,
    TranslateModule,
    ClarityModule,
    StrategyBasedAuthModule,
  ],
  declarations: [...LOGIN_NAVIGATION_COMPONENTS],
  providers: [],
})
export class LoginModule {}
