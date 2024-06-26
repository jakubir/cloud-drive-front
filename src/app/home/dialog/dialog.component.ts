import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.css'
})
export class DialogComponent implements AfterViewInit {
  @Output('dialogClosed') close = new EventEmitter();
  @ViewChild('dialog', { static: true }) dialog!: ElementRef<HTMLDialogElement>;
  @Output() dialogRef = new EventEmitter<ElementRef<HTMLDialogElement>>();

  @HostListener('window:mousedown', ['$event'])
  onClick(event: MouseEvent) {
    if (this.dialog.nativeElement.open) {
      let con = true;
      const search = (child: ChildNode) => {
        if (child == event.target) 
          con = false;
        else
          child.childNodes.forEach(search);
      }
      if (event.target != this.dialog.nativeElement)  
        this.dialog.nativeElement.childNodes.forEach(search);
      else
        con = true;

      if (con) {
        this.closeDialog()
      }
    }
  }

  ngAfterViewInit(): void {
    this.dialogRef.emit(this.dialog);
  }

  closeDialog() {
    this.close.emit();
  }
}
