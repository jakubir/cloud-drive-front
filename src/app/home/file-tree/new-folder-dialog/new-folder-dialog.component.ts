import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { FilesService } from '../../../files.service';
import { DialogComponent } from '../../dialog/dialog.component';

@Component({
  selector: 'app-new-folder-dialog',
  standalone: true,
  imports: [FormsModule, DialogComponent],
  templateUrl: './new-folder-dialog.component.html',
  styleUrl: './new-folder-dialog.component.css'
})
export class NewFolderDialogComponent implements AfterViewInit {
  dialog!: ElementRef<HTMLDialogElement>;
  @Output() dialogRef = new EventEmitter<ElementRef<HTMLDialogElement>>();
  @ViewChild('form', { static: true }) form!: NgForm;
  name: string = '';

  constructor(private files: FilesService) { }

  ngAfterViewInit(): void {
    this.dialogRef.emit(this.dialog);
  }

  getDialogRef(ref: ElementRef<HTMLDialogElement>) {
    this.dialog = ref;
  }
  
  createNewFolder(form: NgForm) {
    const folderName = form.value.folderName;

    this.dialog.nativeElement.close();
    form.reset();

    this.files.createNewFolder(folderName);
  }

  isFolderNameTaken(): boolean {
    return this.files.isResourceNameTaken(this.name);
  }

  isFolderNameIncorrect(): boolean {
    return this.files.isResourceNameIncorrect(this.name);
  }

  closeDialog() {
    this.dialog.nativeElement.close(); 
    this.form.reset()
  }
}
