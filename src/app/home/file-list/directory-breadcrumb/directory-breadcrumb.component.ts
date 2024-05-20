import { Component } from '@angular/core';
import { FilesService } from '../../../files.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/free-regular-svg-icons';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-directory-breadcrumb',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './directory-breadcrumb.component.html',
  styleUrl: './directory-breadcrumb.component.css'
})
export class DirectoryBreadcrumbComponent {
  faAngleRight: IconDefinition = faAngleRight;
  
  constructor (public files: FilesService) { }
}
