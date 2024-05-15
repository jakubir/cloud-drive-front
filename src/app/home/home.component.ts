import { Component } from '@angular/core';
import { FileTreeComponent } from './file-tree/file-tree.component';
import { FileListComponent } from './file-list/file-list.component';
import { FilesService } from '../files.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FileTreeComponent, FileListComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor (private files: FilesService, private auth: AuthService) {
    if (this.auth.getPayload() != null && !this.files.cos) {
      this.auth.renewToken();
      this.files.getFileList();
    }
  }
}
