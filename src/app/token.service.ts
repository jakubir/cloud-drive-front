import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Buffer} from 'buffer';
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private url = 'http://localhost:8080';
  public error = 200;
  public formSubmitted = false;
  private _isAuthenticated = false;

  get isAuthenticated(): boolean {
    return this._isAuthenticated;
  }

  constructor(private http: HttpClient, private router: Router) { }

  private saveToken(token: string) {
    localStorage.setItem("token", token);
  }

  private readToken(): string {
    const token = localStorage.getItem("token");

    return token != null ? token : "";
  }

  public generateToken(emailAddress: string, password: string) {
    const buf = Buffer.from(`${emailAddress}:${password}`)

    this.http
      .post<string>(`${this.url}/token`, '', {
        headers: new HttpHeaders()
            .set('Authorization', 'Basic ' + buf.toString('base64'))
            .set('Accept', 'application/json')
      })
      .subscribe({
        next: (res) => {
          setTimeout(() => {
            this.saveToken(res);
            this.formSubmitted = false;
            this._isAuthenticated = true;

            const redirectUrl = this.router.url.split('?r=')[1];

            if (redirectUrl !== undefined) {
              const decodedRedirectUrl = decodeURIComponent(redirectUrl);
              const buf = Buffer.from(decodedRedirectUrl, 'base64')

              this.router.navigateByUrl('/' + buf.toString('utf8'));
            }
          }, 1000);
        },
        error: (err) => {
          setTimeout(() => {
            this.error = err.status;
            this.formSubmitted = false;
          }, 1000);
        }
      })
  }

  // TODO
  public renewToken() {
    const oldToken = this.readToken();

    console.log("renewToken() -> niedokończona")
  }
}
