import {CanActivateFn, Router} from "@angular/router";
import {TokenService} from "./token.service";
import {inject} from "@angular/core";
import {Buffer} from "buffer"


export const authGuard: CanActivateFn = (route, state) => {
  const token = inject(TokenService);
  const router = inject(Router);

  if (!token.isAuthenticated) {
    let url = '/login';

    if (state.url.substring(1) !== '') { // saving the url to navigate to it after sign-in

      const buf = Buffer.from(state.url.substring(1), 'utf8');

      url += `?r=${encodeURIComponent(buf.toString('base64'))}`;
    }

    router.navigateByUrl(url);

    return false;
  }

  return true;
}
