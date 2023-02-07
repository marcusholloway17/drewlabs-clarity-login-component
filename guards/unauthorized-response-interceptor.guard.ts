import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { catchError, lastValueFrom, Observable, throwError } from "rxjs";
import { AUTH_SERVICE } from "../constants";
import { AuthServiceInterface } from "../contracts";

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
