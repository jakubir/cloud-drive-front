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

  public movePath: string = '';
  public movePathFileTree: File[] = [];

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

  fileTreeFromPath(path: string = this.path): File[] {

    if (path == 'root')
      return this.fileTree.children;

    const pathResource = path.split('/');
    let fileTreePart = this.fileTree.children;

    for (let i = 1; i < pathResource.length; i++) {

      const foundDirectory = fileTreePart.find(
        (child) => child.type == 'directory' && child.name == pathResource[i]
      );

      if (foundDirectory == undefined) {
        this.router.navigateByUrl('/cm9vdA');
        path = 'root';

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

  changeMoveLocation(path: string) {
    this.movePath = path;
    this.movePathFileTree = this.fileTreeFromPath(path);
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

  showSuccessAlert(message: string) {
    this.isSendingFiles = false;
    this.sendingFilesSuccessful = true;
    this.sendingSuccessMessage = message;
    setTimeout(() => {
      this.sendingFilesSuccessful = false;
    }, 4500);
  }
  
  showErrorAlert(message: string) {
    this.isSendingFiles = false;
    this.sendingFilesAborted = true;
    this.sendingFilesError = message;
    setTimeout(() => {
      this.sendingFilesAborted = false;
    }, 4500);
  }

  isResourceNameTaken(fileName: string): boolean {
    if (this.fileTreeFromPath().filter((file) => file.name == fileName.trim()).length)
      return true;

    return false;
  }

  isResourceNameIncorrect(fileName: string): boolean {
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

  uploadFile(files: FileList, folder: string = '') {
    this.auth.renewToken();
    let path = this.path.replace('root/', '').replace('root', '');
    let formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    formData.append('path', path + ((path.length && folder.length) ? '/' : '') + folder);

    this.isSendingFiles = true;    

    this.http.post(`${this.url}`, formData, {
      headers: new HttpHeaders()
        .set('Authorization', 'Bearer ' + this.auth.getToken())
        .set('Accept', 'application/json')
    }).subscribe({
      next: () => {
        let message: string = "Przesłano plik";

        this.getFileList();
        this.showSuccessAlert(message + (folder.length ? ' do folderu ' + folder : ''));
      },
      error: (err: HttpErrorResponse) => {
        let message: string;

        switch (err.status) {
          case 400:
            message = 'Nie można przesyłać pustych plików';
            break;
          case 413:
            if (files.length > 1)
              message = 'Conajmniej jeden z plików jest za duży (> 10 MB)';
            else
              message = 'Wybrany plik jest za duży (> 10 MB)';
            break;
          default:
            message = 'Przesyłanie plików nie powiodło się';
            break;
        }
        this.showErrorAlert(message);
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
        this.getFileList();
        this.showSuccessAlert("Utworzono folder " + folderName);
      },
      error: (err: HttpErrorResponse) => {
        let message: string;

        switch (err.status) {
          case 400:
            message = 'Folder o podanej nazwie już istnieje';
            break;
          default:
            message = 'Tworzenie folderu nie powiodło się';
            break;
        }
        this.showErrorAlert(message);
      }
    })
  }

  removeResource(name: string) {
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
        this.getFileList();
        this.showSuccessAlert("Usunięto " + name);
      },
      error: (err: HttpErrorResponse) => {
        let message: string;

        switch (err.status) {
          case 400:
            message = 'Wybrany zasób już nie istnieje';
            break;
          default:
            message = 'Usuwanie nie powiodło się';
            break;
        }
        this.showErrorAlert(message);
      }
    })
  }

  renameResource(name: string, newName: string) {
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
        this.getFileList();
        this.showSuccessAlert("Zmieniono nazwę " + name + " na " + newName);
      },
      error: (err: HttpErrorResponse) => {
        this.showErrorAlert('Nie udało się zmienić nazwy');
      }
    })
  }

  downloadResource(name: string) {
    this.auth.renewToken();

    let path = this.path.replace('root/', '').replace('root', '');
    path += (path.length ? "/" : "") + name;
    let buf = Buffer.from(path, 'utf8');
    const locationId = buf
      .toString('base64')
      .replaceAll('=', '')
      .replaceAll('+', '-')
      .replaceAll('/', '_');

    this.http.get(`${this.url}/${locationId}`, {
      headers: new HttpHeaders()
        .set('Authorization', 'Bearer ' + this.auth.getToken()),
        responseType: 'blob',
        observe: 'response'
    }).subscribe({
      next: (response) => {
        const encodedName = response.headers.get('content-disposition')?.split(';')[1]?.split('=')[1];
        buf = Buffer.from(encodedName!, 'base64');
        const fileName = buf.toString('utf8');

        const blob = response.body as Blob;
        let downloadLink = document.createElement('a');
        downloadLink.download = fileName!;
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.click();

        this.showSuccessAlert("Plik " + name + " dostępny do pobrania");
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);

        this.showErrorAlert('Nie udało się pobrać zasobu');
      }
    })
  }

  moveResource(path: string, newPath: string) {
    this.auth.renewToken();

    path = path.replace('root/', '').replace('root', '');
    newPath = newPath.replace('root/', '').replace('root', '');
    let formData = new FormData();

    formData.append('path', path);
    formData.append('newPath', newPath + (newPath.length ? "/" : "") + path.split('/').slice(-1));

    console.log(formData.get('path'));
    console.log(formData.get('newPath'));

    this.http.patch(`${this.url}/move`, formData, {
      headers: new HttpHeaders()
        .set('Authorization', 'Bearer ' + this.auth.getToken())
        .set('Accept', 'application/json')
    }).subscribe({
      next: () => {
        this.getFileList();
        this.showSuccessAlert("Przeniesiono " + path.split('/').slice(-1) + " do " + newPath);
      },
      error: (err: HttpErrorResponse) => {
        this.showErrorAlert('Nie udało się przenieść zasobu');
      }
    })
  }
}
