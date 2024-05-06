import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCloudArrowUp } from '@fortawesome/free-solid-svg-icons';
import { NgForm, FormsModule } from '@angular/forms';
import { TokenService } from '../token.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FontAwesomeModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  faCloud = faCloudArrowUp;

  constructor(private token: TokenService) { }

  submit(form: NgForm) {
    const emailAdress = form.value.email;
    const password = form.value.password;

    this.token.getToken(emailAdress, password)
  }
}
