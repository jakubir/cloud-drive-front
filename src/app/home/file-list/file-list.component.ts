import { Component } from '@angular/core';
import { faFile, faFolder, IconDefinition, faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { faFolderOpen } from '@fortawesome/free-regular-svg-icons'
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FilesService } from '../../files.service';
import { File } from '../../types/file.type';
import { MemoryUnitPipe } from '../../memory-unit.pipe';
import { Router } from '@angular/router';
import { DirectoryBreadcrumbComponent } from './directory-breadcrumb/directory-breadcrumb.component';

interface sort {
  sortBy: "name" | "date" | "size",
  order: "ASC" | "DESC"
}

@Component({
  selector: 'app-file-list',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, MemoryUnitPipe, DirectoryBreadcrumbComponent],
  templateUrl: './file-list.component.html',
  styleUrl: './file-list.component.css'
})
export class FileListComponent {
  faFile: IconDefinition = faFile;
  faFolder: IconDefinition = faFolder;
  faFolderOpen: IconDefinition = faFolderOpen;
  faArrow: IconDefinition = faCaretDown;
  currentSort: sort = {
    sortBy: "name",
    order: "ASC"
  }

  constructor (public files: FilesService, public router: Router) {
    router.events.subscribe(() => { // clearing filters when file-list content changes
      this.currentSort.order = 'DESC'; 
      this.sort('name');
    })
  }

  getLatestChangeDate(file: File): string {
    const dates = file.children.map((child) => child.date);

    if (!dates.length) return '';

    let latestDate = dates[0];

    for (const date of dates)
      if (new Date(date!).getTime() > new Date(latestDate!).getTime())
        latestDate = date;

    return latestDate!;
  }

  sort(sortBy: sort["sortBy"]) {    
    if (this.currentSort.sortBy == sortBy) {
      this.currentSort.order = this.currentSort.order == "ASC" ? "DESC" : "ASC";
      this.faArrow = this.currentSort.order == "ASC" ? faCaretDown : faCaretUp;
    } else {
      this.currentSort.order = 'ASC';
      this.faArrow = faCaretDown;
    }
    this.currentSort.sortBy = sortBy;    

    this.files.pathFileTree = this.files.sortFileList(this.files.pathFileTree, false, this.currentSort.sortBy, this.currentSort.order);
  }
}
