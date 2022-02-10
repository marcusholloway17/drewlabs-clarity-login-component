import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, lastValueFrom, Observable, tap, throwError } from "rxjs";
import { AUTH_ACTION_HANDLERS, AUTH_SERVICE } from "../constants";
import { AuthActionHandlers, AuthServiceInterface } from "../contracts";

@Injectable({
  providedIn: "root",
})
export class UnAuthorizedResponseInterceptorGuard implements HttpInterceptor {
  constructor(
    @Inject(AUTH_SERVICE)
    private auth: AuthServiceInterface
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
        }
        return throwError(() => err);
      })
    );
  }
}
