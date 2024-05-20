import { Component } from '@angular/core';
import { FileTreeComponent } from './file-tree/file-tree.component';
import { FileListComponent } from './file-list/file-list.component';
import { FilesService } from '../files.service';
import { AuthService } from '../auth.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSpinner, faCircleCheck, faCircleXmark, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FileTreeComponent, FileListComponent, FontAwesomeModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  faSpinner: IconDefinition = faSpinner;
  faCheck: IconDefinition = faCircleCheck;
  faXmark: IconDefinition = faCircleXmark;

  constructor (public files: FilesService, private auth: AuthService) {
    if (this.auth.getPayload() != null && !this.files.afterLoginFileList) {
      this.auth.renewToken();
      this.files.getFileList();
    }
  }
}
