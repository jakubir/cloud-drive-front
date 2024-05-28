import {Component, OnInit} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCloudArrowUp, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { NgForm, FormsModule, NgModel } from '@angular/forms';
import { AuthService } from '../auth.service';
import {CommonModule} from "@angular/common";
import {Router} from "@angular/router";

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
  passwordField: string = '';
  emailNotValid: boolean = false;
  passwordNotValid: boolean = false;

  constructor(public auth: AuthService, public router: Router) { }

  ngOnInit() {
    if (this.auth.isAuthenticated)
      this.router.navigateByUrl('/');
  }

  submit(form: NgForm, emailInput: NgModel, passwordInput: NgModel): void {

    if (form.invalid) {
      if (emailInput.invalid)
        this.emailNotValid = true;
      if (passwordInput.invalid)
        this.passwordNotValid = true;

      return;
    }

    if (this.auth.preventLoginFormSubmission) return;

    const emailAddress = form.value.email;
    const password = form.value.password;

    this.auth.preventLoginFormSubmission = true;
    this.emailNotValid = false;
    this.passwordNotValid = false;
    this.auth.login(emailAddress, password)

    const myInterval = setInterval(() => {
      if (!this.auth.preventLoginFormSubmission) {
        if (this.auth.loginRequestStatus !== 200)
          this.passwordField = ''
        clearInterval(myInterval);
      }
    }, 50)

  }

  removeErrorMessage(email: boolean = false) {
    this.auth.loginRequestStatus = 200;

    if (email)
      this.emailNotValid = false;
    else
      this.passwordNotValid = false;
  }
}
