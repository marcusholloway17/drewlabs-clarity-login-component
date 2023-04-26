// Export constants
export {
  AUTH_ACTION_HANDLERS,
  AUTH_CLIENT_CONFIG,
  AUTH_SERVICE, AUTH_SERVICE_CONFIG
} from '../constants';
// Interfaces and types exports
export {
  AuthActionHandlers,
  AuthClientConfig,
  AuthServiceConfig,
  AuthServiceInterface,
  DoubleAuthSignInResultInterface
} from '../contracts';
// Module exports
export { StrategyBasedAuthModule } from './auth.module';
export { AuthService } from './auth.service';
// Helpers
export { tokenCan, tokenCanAny } from './helpers';
// Pipes exports
export { TokenCanAnyPipe, TokenCanPipe } from './pipes';
// RxJS operators
export { tokenCan$, tokenCanAny$ } from './rx';
// Strategies exports
export { LocalStrategy } from './strategies/local-strategy';








