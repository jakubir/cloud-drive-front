import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Buffer} from 'buffer';
import {Router} from "@angular/router";

interface Payload {
  sub: string;
  scp: string;
  exp: number;
  iat: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private url: string = 'http://localhost:8080/token';
  public loginRequestStatus: number = 200;
  public preventLoginFormSubmission: boolean = false;
  public isAuthenticated: boolean = true;

  constructor(private http: HttpClient, private router: Router) { }

  private setToken(token: string): void {
    localStorage.setItem("token", token);
  }

  getToken(): string | null {
    const token = localStorage.getItem("token");

    return token == '' ? null : token;
  }

  public getPayload(): Payload | null {
    const token = this.getToken();

    if (token == null) return null;

    const buf = Buffer.from(token!.split('.')[1].replaceAll('_', '/').replaceAll('-', '+'), 'base64')

    return JSON.parse(buf.toString());
  }

  public loginRedirectUrl(oldUrl: string): string { // saving the url to navigate to it after sign-in
    let redirectUrl = '/login';

    console.log(oldUrl)

    if (oldUrl.substring(1) !== '') {

      const buf = Buffer.from(oldUrl.substring(1), 'utf8');

      redirectUrl += `?r=${encodeURIComponent(buf.toString('base64'))}`;
    }

    return redirectUrl;
  }

  signOut() {
    this.setToken('');
    this.isAuthenticated = false;
    this.router.navigateByUrl('/login');
  }

  public login (emailAddress: string, password: string): void {
    const buf = Buffer.from(`${emailAddress}:${password}`)

    this.http
      .post<string>(this.url, '', {
        headers: new HttpHeaders()
          .set('Authorization', 'Basic ' + buf.toString('base64'))
          .set('Accept', 'application/json')
      })
      .subscribe({
        next: (res) => {
          setTimeout(() => {
            this.setToken(res);
            this.preventLoginFormSubmission = false;
            this.isAuthenticated = true;

            const redirectUrl = this.router.url.split('?r=')[1];
            let url = '/';

            if (redirectUrl !== undefined) {
              const decodedRedirectUrl = decodeURIComponent(redirectUrl);
              const buf = Buffer.from(decodedRedirectUrl, 'base64');
              url += buf.toString('utf8');
            }

            this.router.navigateByUrl(url);
          }, 1000);
        },
        error: (err) => {
          setTimeout(() => {
            this.loginRequestStatus = err.status;
            this.preventLoginFormSubmission = false;
          }, 1000);
        }
      })
  }

  public renewToken() {
    const oldToken = this.getToken();

    if (oldToken == null) {
      this.isAuthenticated = false;

      return;
    }

    this.http
      .post<string>(this.url, '', {
        headers: new HttpHeaders()
          .set('Authorization', `Bearer ${oldToken}`)
          .set('Accept', 'application/json')
      })
      .subscribe({
        next: (res) => {
          this.setToken(res)
        },
        error: (err) => {
          if (err.status == 401) {
            const url = this.loginRedirectUrl(this.router.url);

            this.isAuthenticated = false;
            this.router.navigateByUrl(url);
          }
        }
      })
  }
}
