import { NgModule } from '@angular/core';
import { LOGIN_NAVIGATION_COMPONENTS, LoginRoutingModule } from './login-routing.module';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared.module';

@NgModule({
  imports: [
    SharedModule,
    RouterModule,
    LoginRoutingModule
  ],
  declarations: [...LOGIN_NAVIGATION_COMPONENTS],
  providers: []
})
export class LoginModule { }
