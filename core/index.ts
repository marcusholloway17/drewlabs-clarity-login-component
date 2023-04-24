export { AuthService } from './auth.service';

// Strategies exports
export { LocalStrategy } from './strategies/local-strategy';

// Module exports
export { StrategyBasedAuthModule } from './auth.module';

// Helpers
export { tokenCan, tokenCanAny } from './helpers';

// RxJS operators
export { tokenCan$, tokenCanAny$ } from './rx';

// Pipes exports
export { TokenCanAnyPipe, TokenCanPipe } from './pipes';

// Interfaces and types exports
export {
  AuthActionHandlers,
  AuthClientConfig,
  AuthServiceConfig,
  AuthServiceInterface,
  DoubleAuthSignInResultInterface,
} from '../contracts';

// Export constants
export {
  AUTH_SERVICE_CONFIG,
  AUTH_ACTION_HANDLERS,
  AUTH_CLIENT_CONFIG,
  AUTH_SERVICE,
} from '../constants';
