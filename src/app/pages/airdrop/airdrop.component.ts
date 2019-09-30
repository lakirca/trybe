import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../services/auth.service';
import { EosioService } from '../../services/eosio.service';
import {HttpClient} from '@angular/common/http';
import {ViewChild} from '@angular/core';
import {MatPaginator, MatSort} from '@angular/material';
import {merge, Observable, of as observableOf} from 'rxjs';
import {catchError, map, startWith, switchMap} from 'rxjs/operators';
import * as moment from 'moment-timezone';
import {EosWidgetService} from '../../services/eos-widget';
import {allertDialog} from '../../utils/components/allert-dialog/allert-dialog.utils';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-portfolio',
  templateUrl: './airdrop.component.html',
  styleUrls: ['./airdrop.component.css']
})
export class AirdropComponent implements OnInit {

  name: any;
  liquid: any;
  staked: any;
  presale: any;
  offchain: any;
  userEosInfo: any;
  stakedUser: any;
  liquidUser: any;
  allUser: any;
  total:any;
  button = false;
  countTimer: any;
  totalUser: any;
  displayedColumns: string[] = ['Dating', 'AirdropAmount', 'OnChain'];

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private auth: AuthService, private eos: EosioService, private widget: EosWidgetService, public dialog: MatDialog) {
    let sub
    this.auth.loggedStatus
      ? (
        this.initProcess()
        && console.log('loggedStatus: ', this.auth.loggedStatus)
      )
      : sub = this.auth.loggedEvemt.subscribe((result: any) => {
        this.name = result.account.name;
        this.initProcess();
        sub.unsubscribe();
      });
  }

  initProcess(): any {
    this.name = this.auth.name.name
    this.getEosInfo(this.name)
  }

  ngOnInit() {
    this.buttonCheck()
    this.countDownTimer()
    this.getPresale()
    this.getOffChain()
  }


  buttonCheck() {
    let days = [12,13,14,15,16,17,18,19,20,21,22,23,24,25,26]
    let date = new Date()
    let day = date.getDate()
    this.button = days.indexOf(day) >= 0

  }

  getPresale() {
    this.widget.getMongPresale()
      .subscribe(
        (data: any) => {
          this.presale = data[0].total_presale
          this.getStaked()

        });
  }

  getStaked() {
    let staked
    this.widget.getMongStaked()
      .subscribe(
        (data: any) => {
          this.staked = data[0].total_staked
          this.getLiquid()
        });
  }

  getOffChain() {
    this.widget.getMongOffChain()
      .subscribe(
        (data: any) => {
          this.offchain = data[0].total_offchain
          this.getLiquid()
        });
  }

  getLiquid() {
    let liquid
    this.widget.getMongLiquid()
      .subscribe(
        (data: any) => {
          this.liquid = data[0].total_liquid
          this.getTotal()
        });
  }

  getEosInfo(name) {
    this.eos.eosGetRows()
      .then((result: any) => {
        console.log('ROWS ', result);
        let data = result.rows;
        let user = data.find(x => x.owner === name);
        if (user && user.trybe_amount !== "undefined")
          this.userEosInfo = parseFloat(user.trybe_amount);
        this.getLiquidBalance(name)
      });
  }

  getLiquidBalance(name) {
    this.eos.eosGetLiquidBalance(name)
      .then((result: any) => {
        console.log('Presale balance: ', result);
        this.liquidUser = result.rows[0] ? parseFloat(result.rows[0].balance) : 0;
        this.getEosStaked(name)
      });

  }

  getEosStaked (name) {
    this.eos.eosGetStaked(name)
      .then((result: any) => {
        //if (result.rows.length > 0)
        let data
        data = result.rows.find(x => x.from === name);
        this.stakedUser = data ? parseFloat(data.total_staked_trybe) : 0
        console.log('Get account of eosio: ', result);
        setTimeout(()=>{    //<<<---    using ()=> syntax
          this.userTotal();
        }, 3000);
      });
  }

  userTotal() {
    if (this.liquidUser == "undefined") {
      this.liquidUser = 0
    }
    if (this.stakedUser == "undefined") {
      this.stakedUser = 0
    }

    if (this.userEosInfo == undefined) {
      this.userEosInfo = 0
    }

    let total = parseFloat(this.liquidUser) + parseFloat(this.stakedUser) + parseFloat(this.userEosInfo)
    let allTrybe = this.total + parseFloat(this.offchain)
    this.allUser = (total / allTrybe) * 7000000
    this.totalUser = total / (7000000 / 100);
  }

  getTotal() {
    this.total = parseFloat(this.presale) + parseFloat(this.staked) + parseFloat(this.liquid)
  }

  countDownTimer  () {
    var zone = "America/Los_Angeles";
    var m = moment.tz('2019-01-12T23:59:00',zone).format();

    var localDate = moment(m).local();

    this.countTimer = localDate.format("YYYY-MM-DD HH:mm:ss");

    console.log(this.countTimer)
  }

  claimTokens() {
    let authAccount = this.name
    let key = null
    let code = "trybenetwork"
    let actionName = "claimdrop"
    let params = [
      this.name
    ]
    let comingEos = this.auth.eosConnectionData.eos
    let broadcast = true, _
    let sign = true
    this.eos.eosAction(actionName, key, code, authAccount, params, broadcast, sign, comingEos)
      .then((action: any) => {
        //console.log('$$$$$ action: ', action);
        let text = "SUCCESS";
        let data = action.transaction_id;
        this.openAllertDialog(text, data)
        location.reload()
      })
      .catch(err => {
        const errorRes = err.message ? err.message : err;
        let text = "ERROR"
        this.openAllertDialog(text, err.error.details[0].message)
      });
  }

  public openAllertDialog(data, text): void {
    const dialogRef = this.dialog.open(allertDialog, {
      width: '450px',
      data: {name: data, text: text}
    });

    dialogRef.afterClosed().subscribe(result => {
      //console.log('The dialog was closed');
    });

  }

}
