import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {AuthService} from '../../../services/auth.service';
import {EosioService} from '../../../services/eosio.service';
import {allertDialog} from '../allert-dialog/allert-dialog.utils';
export interface DialogData {
  staked: string;
  name: string;
}

@Component({
  selector: 'staked-dialog',
  templateUrl: 'unstaked-dialog.html',
  styleUrls: ['./unstaked-dialog.css']
})

export class unstakedDialog {
  name: any;
  stakedAmount: any;
  constructor(
    public dialogRef: MatDialogRef<unstakedDialog>,
    public auth: AuthService,
    public eos: EosioService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  public openAllertDialog(data, text): void {
    const dialogRef = this.dialog.open(allertDialog, {
      width: '450px',
      data: {name: data, text: text}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });

  }

  unstakeAll() {
    this.stakedAmount = this.data.staked
  }

  stakedTokens() {
    let amount = this.stakedAmount.toFixed(4)
    let authAccount = this.data.name
    let key = null
    let code = "trybenetwork"
    let actionName = "unstake"
    let params = [
      this.data.name,
      this.data.name,
      amount += " TRYBE",
    ]
    let comingEos = this.auth.eosConnectionData.eos
    let broadcast = true, _
    let sign = true

    this.eos.eosAction(actionName, key, code, authAccount, params, broadcast, sign, comingEos)
      .then((action:any) => {
        console.log('$$$$$ action: ', action);
        let text = "SUCCESS";
        this.onNoClick()
        this.openAllertDialog(text, action.transaction_id)
      })
      .catch(err => {
        const errorRes = err.message ? err.message : err;
        console.log('# action error: ', errorRes);
        let text = "ERROR"
        this.onNoClick()
        this.openAllertDialog(text, err.message);
      });
  }

}
