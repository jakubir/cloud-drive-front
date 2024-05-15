import {CanActivateFn, Router} from "@angular/router";
import {AuthService} from "./auth.service";
import {inject} from "@angular/core";


export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated) {
    const url = auth.loginRedirectUrl(state.url);

    router.navigateByUrl(url);

    return false;
  }

  return true;
}
