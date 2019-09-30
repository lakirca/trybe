import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {AuthService} from '../../../services/auth.service';
export interface DialogData {
  text: string;
  name: string;
}

@Component({
  selector: 'allert-dialog',
  templateUrl: 'allert-dialog.html',
  styleUrls: ['./allert-dialog.css']
})

export class allertDialog {
  name: any;
  stakedAmount: any;
  constructor(
    public dialogRef: MatDialogRef<allertDialog>,
    public auth: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }


}
