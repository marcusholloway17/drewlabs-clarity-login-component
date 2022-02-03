import { StrategyInterface } from "./strategy";

/**
 * An interface to define the shape of the service configuration options.
 */
 export interface AuthServiceConfig {
    autoLogin?: boolean;
    strategies: { id: string; strategy: StrategyInterface }[];
    onError?: (error: any) => any;
  }
  