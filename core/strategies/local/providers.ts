import { HttpClient } from "@angular/common/http";
import { RESTInterfaceType } from "./types";
import { LocalStrategy } from "./strategy";

type ProvideLocalStorageType = {
  client: HttpClient;
  host: string;
  storage: Storage;
  endpoints?: Partial<RESTInterfaceType>;
};

/**
 * Factory function to create a local strategy instance
 */
export function useLocalStrategy(param: ProvideLocalStorageType) {
  const { client, host, storage, endpoints } = param;
  return new LocalStrategy(client, host, storage, endpoints);
}
