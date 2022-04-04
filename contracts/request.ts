import { Observable } from "rxjs";

export interface RequestClient {
  /**
   * @description Send a request to an end server with HTTP POST verb
   */
  post(
    path: string,
    body: any,
    options?: { [index: string]: any }
  ): Observable<any>;

  /**
   * @description Send a request to an end server with HTTP GET verb
   */
  get(path: string, options?: { [index: string]: any }): Observable<any>;
}
