export {
  AuthGuardService,
  TokenCanAnyGuard,
  TokenCanGuard,
} from "./auth.guard";
export { AuthClientInterceptor as ClientAuthorizationInterceptor } from "../core/strategies/local/interceptors.guard";
export { UnAuthorizedInterceptor as UnAuthorizedResponseInterceptorGuard } from "../http/unauthorized-interceptor";

export {
  canActivate,
  tokenCanActivate,
  tokenCanAnyActivate,
  tokenCanAnyMatch,
  tokenCanMatch,
  canActivateChild
} from "./auth-v15.guard";
