import { Component } from '@angular/core';
import { faFile, faFolder, IconDefinition, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { faFolderOpen } from '@fortawesome/free-regular-svg-icons'
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FilesService } from '../../files.service';
import { File } from '../../types/file.type';
import { MemoryUnitPipe } from '../../memory-unit.pipe';

@Component({
  selector: 'app-file-list',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, MemoryUnitPipe],
  templateUrl: './file-list.component.html',
  styleUrl: './file-list.component.css'
})
export class FileListComponent {
  faFile: IconDefinition = faFile;
  faFolder: IconDefinition = faFolder;
  faAngleRight: IconDefinition = faAngleRight;
  faFolderOpen = faFolderOpen;

  constructor (public files: FilesService) {}

  getLatestChangeDate(file: File): string {
    const dates = file.children.map((child) => child.date);

    if (!dates.length) return '';

    let latestDate = dates[0];

    for (const date of dates)
      if (new Date(date!).getTime() > new Date(latestDate!).getTime())
        latestDate = date;

    return latestDate!;
  }
}
