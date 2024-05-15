import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { faFile, faFolderOpen, faFolder, faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import {} from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { File } from '../../../types/file.type';
import { FilesService } from '../../../files.service';

@Component({
  selector: 'app-file-tree-branch',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './file-tree-branch.component.html',
  styleUrl: './file-tree-branch.component.css'
})
export class FileTreeBranchComponent implements OnInit {
  @Input('fileTreeBranch') branch: File = {name: '', type: 'file', children: []};
  @Input('directoryOpen') isParentDirectoryOpened: boolean = false;
  @Input('path') path: string = '';
  extension: string = '';
  name: string = '';
  icon = faFile;
  faAngle = faAngleDown;
  isOpened = true;

  constructor (public files: FilesService) { }

  ngOnInit(): void {
    
    if (this.branch.type == 'directory') {

      this.path = !this.path.length ? this.branch.name : this.path + '/' + this.branch.name;      

      if (!this.isParentDirectoryOpened || !(this.files.path.split('/').find((part) => this.branch.name == part))) {
        this.isOpened = false;
        this.icon = faFolder;
        this.faAngle = faAngleUp;
        this.isParentDirectoryOpened = false;
      } else {
        this.icon = faFolderOpen;
      }
    } else {
      const fileNameParts = this.branch.name.split('.');
      const fileExtension = fileNameParts[fileNameParts.length - 1].toLowerCase();

      this.name = fileNameParts.slice(0, -1).join('.');
      this.extension = fileExtension;
      this.icon = this.files.getIcon(fileExtension);
    }
  }

  changeIsOpenStatus() {
    this.isOpened = !this.isOpened;
    if (this.isOpened) {
      this.icon = faFolderOpen;
      this.faAngle = faAngleDown;
    } else {
      this.icon = faFolder;
      this.faAngle = faAngleUp;
    }
  }

  changeIsOpenStatusAndLocation() {
    if (!this.isOpened)
      this.changeIsOpenStatus()

    this.files.changeLocation(this.path);
  }
}
