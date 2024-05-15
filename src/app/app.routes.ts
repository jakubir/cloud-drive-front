import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import {HomeComponent} from "./home/home.component";
import {authGuard} from "./auth.guard";

export const routes: Routes = [
  {path: 'login', component: LoginComponent, title: "Zaloguj się na swoje konto"},
  {path: ':id', component: HomeComponent, canActivate: [authGuard]},
  {path: '**', redirectTo: 'cm9vdA'}
];
