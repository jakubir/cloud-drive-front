import {Injectable} from '@angular/core';
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
import {HttpClient, HttpHeaders} from "@angular/common/http";
import { Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class FilesService {
  private url: string = 'http://localhost:8080/files';
  public path: string = 'root';
  public owner: string = '';
  public isLoading: boolean = true;
  public fileTree: File = {
    name: 'root',
    type: 'directory',
    children: []
  };
  public pathFileTree: File[] = [];
  public cos = false;

  constructor (private auth: AuthService, private router: Router, private http: HttpClient, private title: Title) {

    if (this.auth.getPayload() == null) return;

    this.getFileList();
    this.owner = this.auth.getPayload()!.sub;
  }

  reset() {
    this.path = 'root';
    this.owner = '';
    this.isLoading = true;
    this.fileTree = {
      name: 'root',
      type: 'directory',
      children: []
    }
    this.pathFileTree = []
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
    const locationId = buf.toString('base64').replaceAll('=', '').replaceAll('+', '-').replaceAll('/', '_');

    this.router.navigateByUrl(`/${locationId}`);
    this.path = path;
    this.pathFileTree = this.fileTreeFromPath();
    this.title.setTitle(`${this.path.replace('root', 'Twój dysk').split('/')[this.path.replace('root', 'Twój dysk').split('/').length - 1]} - J\'Drive`);
  }

  sortFileList(sortBy: 'name' | 'date' | 'size' = 'name', order: 'ASC' | 'DESC' = 'ASC') {
    this.auth.renewToken();

    let directories = this.fileTree.children.filter((file) => file.type == 'directory');
    let files = this.fileTree.children.filter((file) => file.type == 'file');

    this.fileTree.children = [...directories, ...files];
  }

  getFileList() {
    this.auth.renewToken();
    this.cos = true;

    this.isLoading = true;

    this.http.get(`${this.url}/list`, {
      headers: new HttpHeaders()
        .set('Authorization', 'Bearer ' + this.auth.getToken())
        .set('Accept', 'application/json')
    }).subscribe({
      next: (data: any) => {
        const buf = Buffer.from(this.router.url.substring(1).replaceAll('_', '/').replaceAll('-', '+'), 'base64');

        this.fileTree = data;

        this.path = buf.toString('utf8');
        this.pathFileTree = this.fileTreeFromPath();
        this.isLoading = false;
        this.title.setTitle(`${this.path.replace('root', 'Twój dysk').split('/')[this.path.replace('root', 'Twój dysk').split('/').length - 1]} - J\'Drive`);
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }
}
