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
