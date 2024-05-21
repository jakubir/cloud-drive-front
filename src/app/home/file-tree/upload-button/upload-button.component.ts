import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faFolderPlus, faFileArrowUp, IconDefinition, faFolder } from '@fortawesome/free-solid-svg-icons';
import { FilesService } from '../../../files.service';


@Component({
  selector: 'app-upload-button',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './upload-button.component.html',
  styleUrl: './upload-button.component.css'
})
export class UploadButtonComponent {
  faPlus: IconDefinition = faPlus;
  faFileUpload: IconDefinition = faFileArrowUp;
  faFolderUpload: IconDefinition = faFolderPlus;
  faFolder: IconDefinition = faFolder;
  isOptionsHidden: boolean = true;

  @Output() newFolderEvent = new EventEmitter();

  constructor(private files: FilesService) { }

  @HostListener('window:mousedown', ['$event'])
  onClick(event: MouseEvent) {
    if (!this.isOptionsHidden) {
      let con = true;
      const search = (child: ChildNode) => {
        if (child == event.target) con = false;
        child.childNodes.forEach(search);
      }  
      document.querySelector('app-upload-button > div')?.childNodes.forEach(search);

      if (con)
        this.isOptionsHidden = true;
    }
  }

  fileInput(fileInput: EventTarget | null) {
    if (fileInput == null) return;

    // sprawdzenie czy wybrany folder jest pusty

    const file = (fileInput as HTMLInputElement).files!;
    this.isOptionsHidden = true;
    
    this.files.uploadFile(file);
  }

  openNewFolderDialog() {
    this.newFolderEvent.emit();

    this.isOptionsHidden = true;
  }

  toggleOptions() {
    this.isOptionsHidden = !this.isOptionsHidden;
  }
}
