import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {AuthService} from '../../../services/auth.service';


@Component({
  selector: 'buy-ram-dialog',
  templateUrl: 'buy-ram-dialog.html',
  styleUrls: ['./buy-ram-dialog.css']
})

export class BuyRamDialog {
  name: any;
  amount: any;

  constructor(
    public dialogRef: MatDialogRef<BuyRamDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log("dialog data: ", this.data)
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  buy() {
    console.log("start buy ram", this.name)
    this.dialogRef.close({amount: this.amount});
  }

}
