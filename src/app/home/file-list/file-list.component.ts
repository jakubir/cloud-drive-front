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
import { MoveDialogComponent } from './move-dialog/move-dialog.component';

interface sort {
  sortBy: "name" | "date" | "size",
  order: "ASC" | "DESC"
}

@Component({
  selector: 'app-file-list',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, MemoryUnitPipe, DirectoryBreadcrumbComponent, ConfirmDialogComponent, RenameDialogComponent, MoveDialogComponent],
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
  moveDialogRef!: ElementRef<HTMLDialogElement>;

  fileDragging: boolean = false;
  dragId!: number;
  offScreenDiv!: HTMLDivElement;
  dragData!: number;
  @ViewChild('section') section!: ElementRef<HTMLElement>;

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

  @HostListener('window:dragover', ['$event'])
  onDragOver(event: DragEvent) {
    // event.preventDefault();
    this.fileDragging = true;
  }

  @HostListener('window:dragleave', ['$event'])
  onDragLeave(event: DragEvent) {
    // event.preventDefault();
    this.fileDragging = false;
  }

  getConfirmDialogRef(ref: ElementRef<HTMLDialogElement>) {
    this.confirmDialogRef = ref
  }

  getRenameDialogRef(ref: ElementRef<HTMLDialogElement>) {
    this.renameDialogRef = ref
  }

  getMoveDialogRef(ref: ElementRef<HTMLDialogElement>) {
    this.moveDialogRef = ref
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
    const file: File = this.files.fileTreeFromPath()[selectedId];
    
    if (file == undefined)
      return {
        name: '',
        type: 'file',
        children: []
      };

    return file;
  }

  getTargetParent(event: Event): EventTarget {
    let parent = (event.target as HTMLElement);

    while (!parent!.hasAttribute('data-id'))
      if (parent!.parentElement != null)
        parent = parent!.parentElement!;
      else 
        break;
    
    return parent as EventTarget;
  }

  getRelatedTargetParent(event: DragEvent): EventTarget {
    let parent = (event.relatedTarget as HTMLElement);

    while (!parent!.hasAttribute('data-id'))
      if (parent!.parentElement != null)
        parent = parent!.parentElement!;
      else 
        break;
    
    return parent as EventTarget;
  }

  openMenu(event: MouseEvent) {
    event.preventDefault();
    
    const target = this.getTargetParent(event);

    const x = (event.clientX - this.contextMenu.nativeElement.offsetLeft);
    const y = (event.clientY - this.contextMenu.nativeElement.offsetTop - this.contextMenu.nativeElement.offsetHeight/2);

    this.selectedId = Number((target as HTMLElement).getAttribute('data-id'));
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
    this.files.movePath = this.files.path;
    this.files.movePathFileTree = this.files.pathFileTree;
    this.moveDialogRef.nativeElement.showModal();
  }

  dragOver(event: DragEvent) {
    event.preventDefault();

    const target = this.getTargetParent(event);

    this.dragId = Number((target as HTMLElement).getAttribute('data-id'));    

    if (
      (target as HTMLElement).getAttribute('data-id') != null &&
      this.files.fileTreeFromPath()[this.dragId].type == 'directory'
    )
      document.querySelectorAll(`[data-id="${this.dragId}"]`).forEach((e) => e.classList.add('drag-over'));
    else 
      this.section.nativeElement.classList.add('drag-over');
  }

  dragLeave(event: DragEvent) {
    const target = this.getTargetParent(event);
    const relatedTarget = this.getRelatedTargetParent(event);

    this.dragId = Number((target as HTMLElement).getAttribute('data-id'));

    if ((target as HTMLElement).getAttribute('data-id') == null)
      this.section.nativeElement.classList.remove('drag-over');
    else if (
      this.files.fileTreeFromPath()[this.dragId].type == 'directory' &&
      (target as HTMLElement).getAttribute('data-id') != (relatedTarget as HTMLElement).getAttribute('data-id')
    )     
      document.querySelectorAll(`[data-id="${this.dragId}"]`).forEach((e) => e.classList.remove('drag-over'));
  }
 
  drop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.section.nativeElement.classList.remove('drag-over');
    document.querySelectorAll(`[data-id="${this.dragId}"]`).forEach((e) => e.classList.remove('drag-over'));
    
    const target = this.getTargetParent(event);
    let folder = '';
    
    this.dragId = Number((target as HTMLElement).getAttribute('data-id'));

    if (
      (target as HTMLElement).getAttribute('data-id') != null &&
      this.files.fileTreeFromPath()[this.dragId].type == 'directory'
    )
      folder = this.files.fileTreeFromPath()[this.dragId].name;

    if (!event.dataTransfer?.files)
      this.files.showErrorAlert('Nie można przesłać pliku');
    else if (event.dataTransfer?.files.length! > 0)
      this.files.uploadFile(event.dataTransfer?.files, folder);
    else {
      const resource = this.files.pathFileTree[this.dragData];
      const path = this.files.path + '/' + resource.name;
      const newPath = this.files.path + (folder.length > 0 ? '/' + folder : '');
      
      if (path != newPath + '/' + resource.name)
        this.files.moveResource(path, newPath);
    }
  }

  dragStart(event: DragEvent) {
    const target = this.getTargetParent(event);
    const id = (target as HTMLElement).getAttribute('data-id')!;
    const element = document.querySelector(`[data-id="${id}"]`)!.firstChild!.firstChild!;
    const color = this.files.pathFileTree[Number(id)].type == 'file' ? 'text-slate-600' : 'text-amber-300';
    
    const wrapper = document.createElement('div');
    wrapper.style.fontSize = '3rem';
    wrapper.appendChild(element.cloneNode(true));
    
    this.offScreenDiv = document.createElement('div');
    this.offScreenDiv.style.position = 'absolute'; 
    this.offScreenDiv.style.left = '-9999px';
    this.offScreenDiv.classList.add(color);
    this.offScreenDiv.appendChild(wrapper);
    document.body.appendChild(this.offScreenDiv);
    
    event.dataTransfer?.setDragImage(wrapper, 20, 20);
    this.dragData = Number(id);
  }
  
  dragEnd(event: DragEvent) {
    document.body.removeChild(this.offScreenDiv);
  }
}
