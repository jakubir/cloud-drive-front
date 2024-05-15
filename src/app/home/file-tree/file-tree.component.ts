import { Component } from '@angular/core';
import { FileTreeBranchComponent } from './file-tree-branch/file-tree-branch.component';
import { FilesService } from '../../files.service';
import { UploadButtonComponent } from './upload-button/upload-button.component';
@Component({
  selector: 'app-file-tree',
  standalone: true,
  imports: [FileTreeBranchComponent, UploadButtonComponent],
  templateUrl: './file-tree.component.html',
  styleUrl: './file-tree.component.css'
})
export class FileTreeComponent {

  constructor (public files: FilesService) { }
}