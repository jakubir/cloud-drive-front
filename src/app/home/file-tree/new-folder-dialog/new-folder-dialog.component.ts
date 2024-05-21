import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { FilesService } from '../../../files.service';

@Component({
  selector: 'app-new-folder-dialog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './new-folder-dialog.component.html',
  styleUrl: './new-folder-dialog.component.css'
})
export class NewFolderDialogComponent implements AfterViewInit {
  @ViewChild('newFolderDialog', { static: true }) dialog!: ElementRef<HTMLDialogElement>;
  @ViewChild('form', { static: true }) form!: NgForm;
  @Output() dialogRef = new EventEmitter<ElementRef<HTMLDialogElement>>();
  name: string = '';

  @HostListener('window:mousedown', ['$event'])
  onClick(event: MouseEvent) {
    if (this.dialog.nativeElement.open) {
      let con = true;
      const search = (child: ChildNode) => {
        if (child == event.target) 
          con = false;
        else
          child.childNodes.forEach(search);
      }  
      this.dialog.nativeElement.childNodes.forEach(search);

      if (con) {
        this.dialog.nativeElement.close();
        this.form.reset();
      }
    }
  }

  constructor(private files: FilesService) { }

  ngAfterViewInit(): void {
    this.dialogRef.emit(this.dialog);
  }
  
  createNewFolder(form: NgForm) {
    const folderName = form.value.folderName;

    this.dialog.nativeElement.close();
    form.reset();

    this.files.createNewFolder(folderName);
  }

  isFolderNameTaken(): boolean {
    if (this.files.fileTreeFromPath().filter((file) => file.name == this.name.trim()).length)
      return true;

    return false;
  }

  isFolderNameIncorrect(): boolean {
    if (this.name.trim().match(/[^<>:"/\\|?*]+/) == null) 
      return true;
    
    if (this.name.trim().match(/[^<>:"/\\|?*]+/)![0].length == this.name.trim().length)
      return false;

    return true;
  }
}
