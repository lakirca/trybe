import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'usa-dialog',
  templateUrl: 'usa-dialog.html',
  styleUrls: ['./usa-dialog.css']
})

export class usaDialog {

  constructor(
    public dialogRef: MatDialogRef<usaDialog>) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}
