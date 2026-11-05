import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable, lastValueFrom, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { AUTH_SERVICE } from "../constants";
import { AuthServiceInterface } from "../types";
import { SessionStorageService } from "../../helpers/session-storage.service";

@Injectable({
  providedIn: "root",
})
export class UnAuthorizedInterceptor implements HttpInterceptor {
  constructor(
    @Inject(AUTH_SERVICE)
    private auth: AuthServiceInterface,
    private session$: SessionStorageService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err) => {
        const handler = async () => {
          return await lastValueFrom(this.auth.signOut());
        };
        if (err instanceof HttpErrorResponse && err.status === 401) {
          handler();
          this.session$.clear();
        }
        return throwError(() => err);
      })
    );
  }
}
