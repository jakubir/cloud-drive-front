import { Component, ElementRef, OnInit } from '@angular/core';
import { FilesService } from '../../files.service';
import { UploadButtonComponent } from './upload-button/upload-button.component';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition, faAngleDown, faAngleUp, faFile, faFolder, faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { Buffer } from 'buffer';
import { File } from '../../types/file.type';
import { NewFolderDialogComponent } from './new-folder-dialog/new-folder-dialog.component';

@Component({
  selector: 'app-file-tree',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, NewFolderDialogComponent, UploadButtonComponent],
  templateUrl: './file-tree.component.html',
  styleUrl: './file-tree.component.css'
})
export class FileTreeComponent implements OnInit {
  angleIcon: Map<boolean, IconDefinition> = new Map([
    [false, faAngleUp],
    [true, faAngleDown],
  ]);
  folderIcon: Map<boolean, IconDefinition> = new Map([
    [false, faFolder],
    [true, faFolderOpen],
  ]);
  openDirectories: {
    [path: string]: boolean
  } = {};
  maxNumberOfFileChildren: number = 2;
  dialogRef!: ElementRef<HTMLDialogElement>;

  constructor (public files: FilesService, public router: Router) { }

  ngOnInit(): void {
    const buf = Buffer.from(this.router.url.substring(1).replaceAll('_', '/').replaceAll('-', '+'), 'base64');
    const path = buf.toString('utf8');

    let pathParts = '';

    path.split('/').map((part) => {
      pathParts = !pathParts.length ? part : pathParts + '/' + part;      
      this.openDirectories[pathParts] = true;
    })
  }

  getFileExtension(fileName: string) {
    const fileNameParts = fileName.split('.');

    return fileNameParts[fileNameParts.length - 1].toLowerCase();
  }

  getFileName(fileName: string) {
    const fileNameParts = fileName.split('.');

    return fileNameParts.slice(0, -1).join('.');
  }

  toggleOpen(path: string) {
    this.openDirectories[path] = !this.openDirectories[path];
  }

  numberOfDirectoryChildren(files: File[]): number {
    let i;

    for (i = 0; i < files.length; i++)
      if (files[i].type != 'directory')
        break;

    return i;
  }
  
  numberOfFilesChildren(files: File[]): number {
    return files.length - this.numberOfDirectoryChildren(files);
  }

  openNewFolderDialog() {
    this.dialogRef.nativeElement.showModal();
  }

  getDialogRef(ref: ElementRef<HTMLDialogElement>) {
    this.dialogRef = ref;
  }
}