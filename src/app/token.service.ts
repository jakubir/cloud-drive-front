import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private url = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  getToken(emailAdress: string, password: string) {
      this.http.post(`${this.url}/token`, '', {
        headers: new HttpHeaders()
            .set('Authorization', 'Basic ' + btoa(`${emailAdress}:${password}`))
            .set('Accept', 'application/json')
      }).subscribe((res: any) => {
        console.log(res.results);
      })
  }
}
