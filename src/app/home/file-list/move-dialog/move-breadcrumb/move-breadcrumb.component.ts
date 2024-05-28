import { Component } from '@angular/core';
import { FilesService } from '../../../../files.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-move-breadcrumb',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './move-breadcrumb.component.html',
  styleUrl: './move-breadcrumb.component.css'
})
export class MoveBreadcrumbComponent {
  faAngleRight: IconDefinition = faAngleRight;

  constructor (public files: FilesService) { }
}
