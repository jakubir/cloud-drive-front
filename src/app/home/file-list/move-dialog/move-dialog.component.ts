import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { DialogComponent } from '../../dialog/dialog.component';
import { HomeComponent } from '../../home.component';
import { FilesService } from '../../../files.service';
import { CommonModule } from '@angular/common';
import { MemoryUnitPipe } from '../../../memory-unit.pipe';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFile, faFolder, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { faFolderOpen } from '@fortawesome/free-regular-svg-icons'
import { File } from '../../../types/file.type';
import { MoveBreadcrumbComponent } from './move-breadcrumb/move-breadcrumb.component';

@Component({
  selector: 'app-move-dialog',
  standalone: true,
  imports: [DialogComponent, HomeComponent, MoveBreadcrumbComponent, CommonModule, FontAwesomeModule, MemoryUnitPipe],
  templateUrl: './move-dialog.component.html',
  styleUrl: './move-dialog.component.css'
})
export class MoveDialogComponent implements AfterViewInit {
  faFile: IconDefinition = faFile;
  faFolder: IconDefinition = faFolder;
  faFolderOpen: IconDefinition = faFolderOpen;

  @Input() pathToFile: string = '';
  dialog!: ElementRef<HTMLDialogElement>;
  @Output() dialogRef = new EventEmitter<ElementRef<HTMLDialogElement>>();

  constructor (public files: FilesService) { }
  
  ngAfterViewInit(): void {
    this.dialogRef.emit(this.dialog);
  }

  getDialogRef(ref: ElementRef<HTMLDialogElement>) {
    this.dialog = ref;
  }

  closeDialog() {
    this.dialog.nativeElement.close();
  }

  getDirectories(files: File[]): File[] {
    return files.filter((file) => file.type == 'directory');
  }

  moveResource() {
    this.closeDialog();
    this.files.moveResource(this.pathToFile, this.files.movePath);
  }
}
