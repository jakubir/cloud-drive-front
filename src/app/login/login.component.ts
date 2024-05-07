import {Component, OnInit} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCloudArrowUp, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { NgForm, FormsModule, NgModel } from '@angular/forms';
import { TokenService } from '../token.service';
import {CommonModule} from "@angular/common";
import {Router} from "@angular/router";
import {Observable} from "rxjs";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FontAwesomeModule, FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  faCloud = faCloudArrowUp;
  faSpinner = faSpinner;
  passwordField = '';
  emailNotValid = false;
  passwordNotValid = false;

  constructor(public token: TokenService, public router: Router) { }

  ngOnInit() {
    if (this.token.isAuthenticated)
      this.router.navigateByUrl('/');
  }

  submit(form: NgForm, emailInput: NgModel, passwordInput: NgModel) {

    if (form.invalid) {
      if (emailInput.invalid)
        this.emailNotValid = true;
      if (passwordInput.invalid)
        this.passwordNotValid = true;

      return;
    }

    if (this.token.formSubmitted) return;

    const emailAddress = form.value.email;
    const password = form.value.password;

    this.token.formSubmitted = true;
    this.emailNotValid = false;
    this.passwordNotValid = false;
    this.token.generateToken(emailAddress, password)

    const myInterval = setInterval(() => {
      if (!this.token.formSubmitted) {
        if (this.token.error !== 200)
          this.passwordField = ''
        clearInterval(myInterval);
      }
    }, 50)

  }

  removeErrorMessage(email: boolean = false) {
    this.token.error = 200;

    if (email)
      this.emailNotValid = false;
    else
      this.passwordNotValid = false;
  }
}
