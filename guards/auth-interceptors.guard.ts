import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
} from "@angular/common/http";
import { Inject, Injectable, OnDestroy } from "@angular/core";
import { Subject, takeUntil, tap } from "rxjs";
import { AUTH_SERVICE } from "../constants";
import { AuthServiceInterface } from "../contracts";

@Injectable({
  providedIn: "root",
})
export class AuthInterceptorService implements HttpInterceptor, OnDestroy {
  // Service destroy handler
  private _destroy$ = new Subject<void>();
  // Authenticated user token
  private token: string | undefined;

  /// Service instance initializer
  constructor(@Inject(AUTH_SERVICE) auth: AuthServiceInterface) {
    // Sourscrire sur le service de gestion du token d'authentification
    //  et assigner à la propriété privé _token the la classe la valeur
    // récupérée depuis le service de gestion de token
    auth.signInState$
      .pipe(
        // Souscrire jusqu'a ce que le service ne soit détruit
        takeUntil(this._destroy$),
        tap((state) => {
          this.token = state?.authToken ?? undefined;
        })
      )
      .subscribe();
  }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // Vérifier si la valeur du token est pas défini
    // Si la valeur du token d'authentification est défini
    // Modifier la requête en passant l'entête d'authorization
    // récupéré depuis le service de gestion des token
    if (this.token) {
      // Clone the request and replace the original headers with
      // cloned headers, updated with the authorization.
      req = req.clone({
        headers: req.headers.set("Authorization", `Bearer ${this.token}`),
      });
    }
    // Retrourner la prochaine exécution de la pile des middlewares
    return next.handle(req);
  }

  ngOnDestroy() {
    this._destroy$.next();
  }
}
