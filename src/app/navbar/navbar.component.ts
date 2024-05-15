import { Component, HostListener } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleUser } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../auth.service';
import { RouterLink } from '@angular/router';
import { FilesService } from '../files.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [FontAwesomeModule, RouterLink, FormsModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  isMenuHidden = true;
  faUser = faCircleUser;

  constructor(public auth: AuthService, public files: FilesService) {}

  @HostListener('window:mousedown', ['$event'])
  onClick(event: MouseEvent) {

    if (!this.isMenuHidden) {
      let con = true;
      const search = (child: ChildNode) => {
        if (child == event.target) con = false;
        child.childNodes.forEach(search);
      }  
      document.querySelector('nav > div')?.childNodes.forEach(search);

      if (con)
        this.isMenuHidden = true;
    }
  }

  toggleMenu() {
    this.isMenuHidden = !this.isMenuHidden;
  }

  signOut() {
    this.auth.signOut(); 
    this.isMenuHidden = true;
    this.files.reset()
    this.files.cos = false;
  }
}
