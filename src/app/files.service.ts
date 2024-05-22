import {Injectable, signal} from '@angular/core';
import {AuthService} from './auth.service';
import {Router} from '@angular/router';
import {
  faFile,
  faFileAudio,
  faFileCsv,
  faFileImage,
  faFileLines,
  faFilePdf,
  faFileVideo,
  faFileZipper
} from '@fortawesome/free-solid-svg-icons'
import {Buffer} from 'buffer';
import {File} from './types/file.type'
import {IconDefinition} from '@fortawesome/fontawesome-svg-core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http";
import { Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class FilesService {
  private url: string = 'http://localhost:8080/files';
  public path: string = 'root';
  public owner: string = '';
  public fileTree: File = {
    name: 'root',
    type: 'directory',
    children: []
  };
  public pathFileTree: File[] = [];

  public afterLoginFileList: boolean = false;
  public isLoading: boolean = true;
  public isSendingFiles: boolean = false;
  public sendingFilesSuccessful: boolean = false;
  public sendingSuccessMessage: string = '';
  public sendingFilesAborted: boolean = false;
  public sendingFilesError: string = '';

  constructor (private auth: AuthService, private router: Router, private http: HttpClient, private title: Title) {
    const buf = Buffer.from(this.router.url.substring(1).replaceAll('_', '/').replaceAll('-', '+'), 'base64');

    if (this.auth.getPayload() == null) return;

    this.getFileList();
    this.owner = this.auth.getPayload()!.sub;
    this.path = buf.toString('utf8');
  }

  reset() {
    this.path = 'root';
    this.owner = '';
    this.isLoading = true;
    this.fileTree = {
      name: 'root',
      type: 'directory',
      children: []
    };
    this.pathFileTree = [];
  }

  fileTreeFromPath(): File[] {

    if (this.path == 'root')
      return this.fileTree.children;

    const pathElements = this.path.split('/');
    let fileTreePart = this.fileTree.children;

    for (let i = 1; i < pathElements.length; i++) {

      const foundDirectory = fileTreePart.find(
        (child) => child.type == 'directory' && child.name == pathElements[i]
      );

      if (foundDirectory == undefined) {
        this.router.navigateByUrl('/cm9vdA');
        this.path = 'root';

        return this.fileTree.children;
      } else {
        fileTreePart = foundDirectory.children;
      }
    }

    return fileTreePart;
  }

  getIcon(extension: string): IconDefinition {
    const extensionToIcon = new Map<string, IconDefinition>([
      ['txt', faFileLines],
      ['docx', faFileLines],
      ['odt', faFileLines],
      ['xlsx', faFileCsv],
      ['csv', faFileCsv],
      ['jpg', faFileImage],
      ['png', faFileImage],
      ['zip', faFileZipper],
      ['rar', faFileZipper],
      ['pdf', faFilePdf],
      ['mp4', faFileVideo],
      ['mp3', faFileAudio],
    ]);

    return extensionToIcon.get(extension) || faFile;
  }

  changeLocation(path: string) {
    const buf = Buffer.from(path, 'utf8');
    const locationId = buf
      .toString('base64')
      .replaceAll('=', '')
      .replaceAll('+', '-')
      .replaceAll('/', '_');
    const pathParts = this.path
      .replace('root', 'Twój dysk')
      .split('/');

    this.router.navigateByUrl(`/${locationId}`);
    this.path = path;
    this.pathFileTree = this.sortFileList(this.fileTreeFromPath());
    this.title.setTitle(`${pathParts[pathParts.length - 1]} - J\'Drive`);
  }

  sortFileList(fileList: File[], recursive = false, sortBy: 'name' | 'date' | 'size' = 'name', order: 'ASC' | 'DESC' = 'ASC') {

    let directories = fileList.filter((file) => file.type == 'directory');
    let files = fileList.filter((file) => file.type == 'file');

    if (sortBy == 'name') {
      directories.sort((a, b) => a.name.localeCompare(b.name));
      files.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy == 'date') {
      directories.sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());
      files.sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());
    } else if (sortBy == 'size') {
      directories.sort((a, b) => a.size! - b.size!);
      files.sort((a, b) => a.size! - b.size!);
    }

    if (order == 'DESC') {
      directories.reverse();
      files.reverse();
    }

    if (recursive)
      directories.map((file) => file.children = this.sortFileList(file.children, true, sortBy, order));

    fileList = [...directories, ...files];

    return fileList;
  }

  isElementNameTaken(fileName: string): boolean {    
    if (this.fileTreeFromPath().filter((file) => file.name == fileName.trim()).length)
      return true;

    return false;
  }

  isElementNameIncorrect(fileName: string): boolean {
    if (fileName.trim().match(/[^<>:"/\\|?*]+/) == null) 
      return true;
    
    if (fileName.trim().match(/[^<>:"/\\|?*]+/)![0].length == fileName.trim().length)
      return false;

    return true;
  }

  getFileList() {
    this.afterLoginFileList = true;
    this.isLoading = true;

    this.http.get(`${this.url}`, {
      headers: new HttpHeaders()
        .set('Authorization', 'Bearer ' + this.auth.getToken())
        .set('Accept', 'application/json')
    }).subscribe({
      next: (res: any) => {
        const buf = Buffer.from(this.router.url.substring(1).replaceAll('_', '/').replaceAll('-', '+'), 'base64');

        this.fileTree = res;
        this.fileTree.children = this.sortFileList(this.fileTree.children, true);
        this.path = buf.toString('utf8');
        this.pathFileTree = this.fileTreeFromPath();
        this.title.setTitle(`${this.path.replace('root', 'Twój dysk').split('/')[this.path.replace('root', 'Twój dysk').split('/').length - 1]} - J\'Drive`);
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  uploadFile(files: FileList) {
    this.auth.renewToken();

    let formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    formData.append('path', this.path.replace('root/', '').replace('root', ''));

    this.isSendingFiles = true;

    this.http.post(`${this.url}`, formData, {
      headers: new HttpHeaders()
        .set('Authorization', 'Bearer ' + this.auth.getToken())
        .set('Accept', 'application/json')
    }).subscribe({
      next: () => {
        this.isSendingFiles = false;
        this.sendingFilesSuccessful = true;
        this.sendingSuccessMessage = "Przesłano plik";
        this.getFileList();
        setTimeout(() => {
          this.sendingFilesSuccessful = false;
        }, 4500);
      },
      error: (err: HttpErrorResponse) => {
        this.isSendingFiles = false;
        this.sendingFilesAborted = true;
        switch (err.status) {
          case 400:
            this.sendingFilesError = 'Nie można przesyłać pustych plików';
            break;
          case 413:
            if (files.length > 1)
              this.sendingFilesError = 'Conajmniej jeden z plików jest za duży';
            else 
              this.sendingFilesError = 'Wybrany plik jest za duży';
            break;
          default:
            this.sendingFilesError = 'Przesyłanie plików nie powiodło się';
            break;
        }
        setTimeout(() => {
          this.sendingFilesAborted = false;
        }, 4500);
      }
    })
  }

  createNewFolder(folderName: string) {
    this.auth.renewToken();

    let formData = new FormData();
    const path = this.path.replace('root/', '').replace('root', '');

    formData.append('path', path + (path.length ? "/" : "") + folderName);

    this.http.post(`${this.url}/new-folder`, formData, {
      headers: new HttpHeaders()
        .set('Authorization', 'Bearer ' + this.auth.getToken())
        .set('Accept', 'application/json')
    }).subscribe({
      next: () => {
        this.sendingFilesSuccessful = true;
        this.sendingSuccessMessage = "Utworzono folder " + folderName;
        this.getFileList();
        setTimeout(() => {
          this.sendingFilesSuccessful = false;
        }, 4500);
      },
      error: (err: HttpErrorResponse) => {
        this.isSendingFiles = false;
        this.sendingFilesAborted = true;
        switch (err.status) {
          case 400:
            this.sendingFilesError = 'Folder o podanej nazwie już istnieje';
            break;
          default:
            this.sendingFilesError = 'Tworzenie folderu nie powiodło się';
            break;
        }
        setTimeout(() => {
          this.sendingFilesAborted = false;
        }, 4500);
      }
    })
  }

  removeElement(name: string) {
    this.auth.renewToken();

    const path = this.path.replace('root/', '').replace('root', '');
    let formData = new FormData();

    formData.append('path', path + (path.length ? "/" : "") + name);    

    this.http.delete(`${this.url}`, {
      headers: new HttpHeaders()
        .set('Authorization', 'Bearer ' + this.auth.getToken())
        .set('Accept', 'application/json'),
      body: formData
    }).subscribe({
      next: () => {
        this.sendingFilesSuccessful = true;
        this.sendingSuccessMessage = "Usunięto " + name;
        this.getFileList();
        setTimeout(() => {
          this.sendingFilesSuccessful = false;
        }, 4500);
      },
      error: (err: HttpErrorResponse) => {
        this.isSendingFiles = false;
        this.sendingFilesAborted = true;
        switch (err.status) {
          case 400:
            this.sendingFilesError = 'Plik już nie istnieje';
            break;
          default:
            this.sendingFilesError = 'Usuwanie nie powiodło się';
            break;
        }
        setTimeout(() => {
          this.sendingFilesAborted = false;
        }, 4500);
      }
    })
  }

  renameElement(name: string, newName: string) {
    this.auth.renewToken();

    const path = this.path.replace('root/', '').replace('root', '');
    let formData = new FormData();

    formData.append('path', path + (path.length ? "/" : "") + name);
    formData.append('newName', newName);

    this.http.patch(`${this.url}`, formData, {
      headers: new HttpHeaders()
        .set('Authorization', 'Bearer ' + this.auth.getToken())
        .set('Accept', 'application/json')
    }).subscribe({
      next: () => {
        this.sendingFilesSuccessful = true;
        this.sendingSuccessMessage = "Zmieniono nazwę " + name + " na " + newName;
        this.getFileList();
        setTimeout(() => {
          this.sendingFilesSuccessful = false;
        }, 4500);
      },
      error: (err: HttpErrorResponse) => {
        this.isSendingFiles = false;
        this.sendingFilesAborted = true;
        this.sendingFilesError = 'Nie udało się zmienić nazwy';
        setTimeout(() => {
          this.sendingFilesAborted = false;
        }, 4500);
      }
    })
  }
}
