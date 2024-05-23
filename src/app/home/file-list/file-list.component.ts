import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { faFile, faFolder, IconDefinition, faCaretDown, faCaretUp, faTrashCan, faDownload, faPenToSquare, faRightToBracket } from '@fortawesome/free-solid-svg-icons';
import { faFolderOpen } from '@fortawesome/free-regular-svg-icons'
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FilesService } from '../../files.service';
import { File } from '../../types/file.type';
import { MemoryUnitPipe } from '../../memory-unit.pipe';
import { Router } from '@angular/router';
import { DirectoryBreadcrumbComponent } from './directory-breadcrumb/directory-breadcrumb.component';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { RenameDialogComponent } from './rename-dialog/rename-dialog.component';

interface sort {
  sortBy: "name" | "date" | "size",
  order: "ASC" | "DESC"
}

@Component({
  selector: 'app-file-list',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, MemoryUnitPipe, DirectoryBreadcrumbComponent, ConfirmDialogComponent, RenameDialogComponent],
  templateUrl: './file-list.component.html',
  styleUrl: './file-list.component.css'
})
export class FileListComponent {
  faFile: IconDefinition = faFile;
  faFolder: IconDefinition = faFolder;
  faFolderOpen: IconDefinition = faFolderOpen;
  faArrow: IconDefinition = faCaretDown;
  faTrashCan: IconDefinition = faTrashCan;
  faDownload: IconDefinition = faDownload;
  faPen: IconDefinition = faPenToSquare;
  faMove: IconDefinition = faRightToBracket;

  currentSort: sort = {
    sortBy: "name",
    order: "ASC"
  }

  isMenuHidden: boolean = true;
  selectedId!: number;
  @ViewChild('contextMenu') contextMenu!: ElementRef<HTMLDivElement>;

  confirmDialogRef!: ElementRef<HTMLDialogElement>;
  renameDialogRef!: ElementRef<HTMLDialogElement>;

  constructor (public files: FilesService, public router: Router) {
    router.events.subscribe(() => { // clearing filters when file-list content changes
      this.currentSort.order = 'DESC'; 
      this.sort('name');
    })
  }

  @HostListener('window:mousedown', ['$event'])
  onClick(event: MouseEvent) {
    if (!this.isMenuHidden) {
      let con = true;
      const search = (child: ChildNode) => {
        if (child == event.target) 
          con = false;
        else
          child.childNodes.forEach(search);
      }  
      this.contextMenu.nativeElement.childNodes.forEach(search);

      if (con) 
        this.hideMenu()
    }
  }

  getConfirmDialogRef(ref: ElementRef<HTMLDialogElement>) {
    this.confirmDialogRef = ref
  }

  getRenameDialogRef(ref: ElementRef<HTMLDialogElement>) {
    this.renameDialogRef = ref
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

  getSelectedFile(selectedId: number): File {
    if (selectedId == undefined)
      return {
        name: '',
        type: 'file',
        children: []
      };

    return this.files.fileTreeFromPath()[selectedId];
  }

  openMenu(event: MouseEvent) {
    event.preventDefault();
    
    const x = (event.clientX - this.contextMenu.nativeElement.offsetLeft);
    const y = (event.clientY - this.contextMenu.nativeElement.offsetTop - this.contextMenu.nativeElement.offsetHeight/2);
    
    this.selectedId = Number((event.target as HTMLDivElement).getAttribute('data-id'));
    this.contextMenu.nativeElement.style.transform = "translate("+ (x + 5) + "px," + y + "px)";
    this.isMenuHidden = false;

    document.querySelectorAll(`[data-id="${this.selectedId}"]`).forEach((e) => e.classList.add('focused'));
  }

  hideMenu() {
    this.isMenuHidden = true;
    document.querySelectorAll(`[data-id="${this.selectedId}"]`).forEach((e) => e.classList.remove('focused'));
  }

  removeElement() {
    this.hideMenu()
    this.confirmDialogRef.nativeElement.showModal();
  }

  downloadElement() {
    this.hideMenu()
    this.files.downloadResource(this.getSelectedFile(this.selectedId).name);
  }

  changeName() {
    this.hideMenu()
    this.renameDialogRef.nativeElement.showModal();
  }

  moveElement() {
    this.hideMenu()

    throw new Error('Method not implemented.');
  }
}