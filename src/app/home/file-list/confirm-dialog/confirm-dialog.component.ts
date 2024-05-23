import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { DialogComponent } from '../../dialog/dialog.component';
import { FilesService } from '../../../files.service';
import { File } from '../../../types/file.type';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [DialogComponent],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css'
})
export class ConfirmDialogComponent implements AfterViewInit {
  dialog!: ElementRef<HTMLDialogElement>;
  @Output() dialogRef = new EventEmitter<ElementRef<HTMLDialogElement>>();
  @Input() file: File = {
    name: '',
    type: 'file',
    children: []
  };

  constructor(private files: FilesService) { }
  
  ngAfterViewInit(): void {
    this.dialogRef.emit(this.dialog);
  }

  getDialogRef(ref: ElementRef<HTMLDialogElement>) {
    this.dialog = ref;
  }

  closeDialog() {
    this.dialog.nativeElement.close();
  }

  removeFile() {
    this.dialog.nativeElement.close();
    this.files.removeResource(this.file.name);
  }
}
