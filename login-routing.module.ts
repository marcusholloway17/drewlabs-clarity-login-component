import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { LoginComponent } from "./login.component";
import { LoginViewComponent } from "./login-view.component";

const LOGIN_ROUTES = [
  {
    path: "",
    component: LoginComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(LOGIN_ROUTES)],
  declarations: [],
  providers: [],
})
export class LoginRoutingModule {}

export const LOGIN_NAVIGATION_COMPONENTS = [LoginComponent, LoginViewComponent];
