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

  renameElement(form: NgForm) {
    const newName = form.value.elementName;

    this.dialog.nativeElement.close();
    form.reset();

    this.files.renameElement(this.file.name, newName);
  }

  isElementNameTaken(): boolean {
    return this.files.isElementNameTaken(this.name);
  }

  isElementNameIncorrect(): boolean {
    return this.files.isElementNameIncorrect(this.name);
  }

  isElementNameDiffrent(): boolean {
    return this.name != this.file.name;
  }
}
