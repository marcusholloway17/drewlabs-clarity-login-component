import { ApplicationModule } from './../../application/application.module';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared.module';
import {
  LOGIN_NAVIGATION_COMPONENTS,
  LoginRoutingModule
} from './login-routing.module';

@NgModule({
  imports: [SharedModule, LoginRoutingModule, ApplicationModule],
  declarations: [...LOGIN_NAVIGATION_COMPONENTS],
  providers: []
})
export class LoginModule {}
