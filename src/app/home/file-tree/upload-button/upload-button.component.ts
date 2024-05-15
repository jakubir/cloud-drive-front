import { Component, HostListener } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faFolderPlus, faFileArrowUp } from '@fortawesome/free-solid-svg-icons';
import { FilesService } from '../../../files.service';


@Component({
  selector: 'app-upload-button',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './upload-button.component.html',
  styleUrl: './upload-button.component.css'
})
export class UploadButtonComponent {
  faPlus = faPlus;
  faFile = faFileArrowUp;
  faFolder = faFolderPlus;
  isOptionsHidden = true;

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

    const file = (fileInput as HTMLInputElement).files!;
    this.isOptionsHidden = true;
    
    this.files.uploadFile(file)
  }

  toggleOptions() {
    this.isOptionsHidden = !this.isOptionsHidden;
  }
}
