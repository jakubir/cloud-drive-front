import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DialogComponent } from '../../dialog/dialog.component';
import { FormsModule, NgForm } from '@angular/forms';
import { FilesService } from '../../../files.service';
import { File } from '../../../types/file.type';

@Component({
  selector: 'app-rename-dialog',
  standalone: true,
  imports: [DialogComponent, FormsModule],
  templateUrl: './rename-dialog.component.html',
  styleUrl: './rename-dialog.component.css'
})
export class RenameDialogComponent implements AfterViewInit {
  dialog!: ElementRef<HTMLDialogElement>;
  @Output() dialogRef = new EventEmitter<ElementRef<HTMLDialogElement>>();
  @Input() file: File = {
    name: '',
    type: 'file',
    children: []
  };
  name: string = '';

  constructor (private files: FilesService) { }
  
  ngAfterViewInit(): void {    
    this.dialogRef.emit(this.dialog);
  }

  getDialogRef(ref: ElementRef<HTMLDialogElement>) {
    this.dialog = ref;
  }

  closeDialog() {
    this.dialog.nativeElement.close();
  }

  renameResource(form: NgForm) {
    const newName = form.value.name;

    this.dialog.nativeElement.close();
    form.reset();

    this.files.renameResource(this.file.name, newName);
  }

  isResourceNameTaken(): boolean {
    return this.files.isResourceNameTaken(this.name);
  }

  isResourceNameIncorrect(): boolean {
    return this.files.isResourceNameIncorrect(this.name);
  }

  isResourceNameDiffrent(): boolean {
    return this.name != this.file.name;
  }
}
