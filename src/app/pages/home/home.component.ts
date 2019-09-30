import {Component, OnInit, AfterViewInit} from '@angular/core';
import {EosWidgetService} from '../../services/eos-widget';
import {LocalStorageService} from 'ngx-webstorage';
import {EosioService} from '../../services/eosio.service';
import {AuthService} from '../../services/auth.service';
import {P} from '@angular/cdk/keycodes';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { usaDialog } from '../../utils/components/usa-dialog/usa-dialog.utils';
import {allertDialog} from "../../utils/components/allert-dialog/allert-dialog.utils";
import {interval} from "rxjs";
import { Routes, RouterModule, Router, ActivatedRoute,Params} from '@angular/router';
import {MenuComponent} from '../../utils/components/menu/menu.component'
import {DeviceDetectorService} from 'ngx-device-detector';
import * as _ from 'lodash';

export interface DialogData {
  text: string;
  name: string;
}
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  deviceInfo = null;
  stats: any;
  statsReady = false;
  name: any;
  account: any;
  buyAmount: any;
  useram: any;
  usecpu: any;
  usenet: any;
  country: any;
  ramuse: any;
  cpuuse: any;
  netuse: any;
  maxram: any;
  maxcpu: any;
  maxnet: any;
  isActiveButton = false
  liquid: any;
  userRow: any;
  userEosInfo: any;
  topone = true;
  toptwo = false;
  price: any;
  priceWidget: any;
  refLink: any;
  showRef = false;
  presalestats: any;
  presaleTotal: any;
  presaleSold: any;
  presaleRemaining: any;
  presaleprecent: any;
  referName: any;
  showReferer = false;
  top: any;
  priceTrybeEos: any;
  href: any;
  winners = false;
  isMobile: any;
  dataMongo: any;

  text:any = {
    Year: 'Year',
    Month: 'Months',
    Weeks: "Weeks",
    Days: "Days",
    Hours: "Hours",
    Minutes: "Minutes",
    Seconds: "Seconds",
    MilliSeconds: "MilliSeconds"
  };
  chaince: any;
  newdex: any;
  showNewdex = false
  constructor (
    public widget: EosWidgetService,
    public storage: LocalStorageService,
    public eos: EosioService,
    public auth: AuthService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    public menu: MenuComponent,
    private deviceService: DeviceDetectorService
  ) {
    this.epicFunction();
    this.route.queryParams.subscribe(params => {
      console.log(this.route)
      this.href = window.location.href.split('?')[0];
      console.log(this.href)
      this.referName = decodeURIComponent(params['r']);
      if (this.referName != "undefined") {
        this.showReferer = true
      } else {
        this.showReferer = false
      }
    });
  }

  ngOnInit () {
    if (this.menu.userCountry == "US") {
      this.isActiveButton = true
    } else {
      this.getIp()
    }



    this.login();
    this.getStats();
    this.getMongoData();
    this.getTrybePrice()
    // this.getAcc();
    const top: any = document.getElementsByTagName('app-home');
    top[0].style.height = '100%';
    this.getPresaleStats();
    this.auth.loggedEvemt
      .subscribe(result => {
        this.name = result.account.name;
        this.getAccount(result.account.name);
        const code = 'eosio.token';
        const symbol = 'EOS';
        this.getBalance(code, result.account.name, symbol);
        this.getProgress()
        this.getPrice()
        this.getEosInfo(this.name);
        this.getNewdex()
      });

    const subLynx = this.auth.loggedEosEvemt.subscribe(result => {
      console.log(result)
      this.name = result.account.account_name
      this.liquid = parseFloat(result.account.core_liquid_balance)
      subLynx.unsubscribe();
    });
  }

  epicFunction () {
    console.log('hello `Home` component');
    this.deviceInfo = this.deviceService.getDeviceInfo();
    this.isMobile = this.deviceService.isMobile();
    const isTablet = this.deviceService.isTablet();
    const isDesktopDevice = this.deviceService.isDesktop();
    console.log(this.deviceInfo);
    console.log(this.isMobile);  // returns if the device is a mobile device (android / iPhone / windows-phone etc)
    console.log(isTablet);  // returns if the device us a tablet (iPad etc)
    console.log(isDesktopDevice); // returns if the app is running on a Desktop browser.
  }

  getNewdex() {
    this.widget.getNewdex()
      .subscribe(
        data => {
          let objects = data.data
          let object  =  objects.filter(function(obj) {
            return obj.currency === "TRYBE"
          });
          this.newdex = object[0]
          this.showNewdex = true
        });
    this.widget.getChaince()
      .subscribe(
        data => {
          console.log(data)
          this.chaince = data
        });
  }

  getMongoData() {
    this.widget.getMongDb()
      .subscribe(
        data => {
          this.dataMongo = data
          this.getRows()
        });
  }

  getPrice() {
    this.widget.getPrice()
      .subscribe(
        data => {
          console.log(data);
          this.priceWidget = data
        });
  }

  createLink() {
    this.refLink = this.href + "?r=" + this.name
    this.showRef = true
  }

  getBalance (code, name, symbol) {
    this.eos.eosGetBalance(code, name, symbol);
  }

  getTrybePrice() {
    this.eos.eosGetTrybePrice()
      .then((result: any) => {
        this.priceTrybeEos = result && result.rows.length > 0 ? parseFloat(result.rows[0].price) / 0.01 : 0
      });
  }

  getProgress(): void{
    const subscription = interval(30000)
      .subscribe(()=>{
        //Get progress status from the service every 5 seconds
        this.eos.eosGetTrybePrice()
          .then((result: any) => {
            this.price = result && result.rows.length > 0 ? parseFloat(result.rows[0].price) : 0
          });
      });
  }

  getPresaleStats () {
    this.eos.eosGetPresaleStats()
      .then((result: any) => {
        console.log('ROWS ', result);
        let data = result.rows.find(x => x.issuer === 'trybepresale');
        this.presalestats = data;

        this.presaleTotal = parseFloat(this.presalestats.totalavailable);
        this.presaleSold = parseFloat(this.presalestats.totalsold);
        this.presaleRemaining = this.presaleTotal - this.presaleSold;
        this.presaleprecent = this.presaleSold / (this.presaleTotal / 100);
        console.log('STATS', data);
      });
  }
  topOneChange() {
    this.toptwo = false;
    this.topone = true;
    this.winners = false;
  }

  topTwoChange() {
    this.topone = false;
    this.toptwo = true;
    this.winners = false;
  }

  openWinners() {
    this.topone = false;
    this.toptwo = false;
    this.winners = true;
  }

  getRows () {
    this.eos.eosGetRows()
      .then((result: any) => {
        console.log('ROWS ', result);
        let data = result.rows;
        data.sort(function(a, b) {
          return (parseFloat(b.trybe_amount) - parseFloat(a.trybe_amount));
        });
        var sum = 0;
        this.userRow = data;
        let date = new Date();
        let mounth = date.getMonth()
        console.log("DATE", mounth)
        console.log(this.userRow );
        let mounthTop  =  this.userRow.filter(function(user) {
          return new Date(user.purchase_date*1000).getMonth() == mounth
        });

        mounthTop.forEach((poll) => {
          poll.answerList = [];
          this.dataMongo.forEach((pollAnswer) => {
            if(pollAnswer.owner === poll.owner){
              poll.trybe_amount = parseFloat(poll.trybe_amount) - parseFloat(pollAnswer.trybe_amount)
              poll.eos_amount = parseFloat(poll.eos_amount) - parseFloat(pollAnswer.eos_amount)
            }
          });
        });
        mounthTop.sort(function(a, b) {
          return (parseFloat(b.trybe_amount) - parseFloat(a.trybe_amount));
        });
        this.top = mounthTop.slice(0,10)
        this.top.forEach(function(obj){
          sum += parseFloat(obj.trybe_amount);
        });
        this.top.forEach(function(obj){
          return obj.eos_amount = parseFloat(obj.eos_amount);
        });

        this.top.forEach(function(obj){
          return obj.trybe_amount = parseFloat(obj.trybe_amount);
        });
        this.top.map(v => v.mobile_trybe = parseFloat(v.trybe_amount))
        this.top.map(v => v.mobile_eos = parseFloat(v.eos_amount))
        console.log("PARSE", this.top)
        this.top.map(v => v.bonus = (parseFloat(v.trybe_amount) / sum) * 1000000)
        console.log("SUMMA", sum)
      })
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(usaDialog, {
      width: '450px',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  getEosInfo (name) {
    this.eos.eosGetRows()
      .then((result: any) => {
        let data = result.rows
        let user = data.find(x => x.owner === name);
        console.log(user);
        if (user && user.trybe_amount != "undefined")
          this.userEosInfo = parseFloat(user.trybe_amount);
        console.log('USER INFO', this.userEosInfo);
      });
  }

  buyTokens() {
    let amount = this.buyAmount.toFixed(4)
    console.log(amount)
    let authAccount = this.name
    let memo = "TRYBE PRESALE"
    let key = null
      if (amount >= 50 && this.referName != "undefined") {
        memo = "TRYBE PRESALE|" + this.referName
      } else {
        memo = "TRYBE PRESALE"
      }
    let code = "eosio.token"
    let actionName = "transfer"
    let params = [
      this.name,
      "trybepresale",
      amount += " EOS",
      memo
    ]
    let comingEos = this.auth.eosConnectionData.eos
    let broadcast = true
    let sign = true

    this.eos.eosAction(actionName, key, code, authAccount, params, broadcast, sign, comingEos)
      .then((action: any) => {
        console.log('$$$$$ action: ', action);
        let text = "SUCCESS";
        let data = action.transaction_id;
        this.openAllertDialog(text, data)
        location.reload()
      })
      .catch(err => {
        const errorRes = err.message ? err.message : err;
        console.log('# action error: ', errorRes);
        let text = "ERROR"
        this.openAllertDialog(text, err.message)
      });
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

  stakeTokens() {
    let amount = this.buyAmount.toFixed(4)
    let authAccount = this.name
    let key = null
    let code = "eosio.token"
    let actionName = "transfer"
    let params = [
      this.name,
      "trybepresale",
      amount += " EOS",
      "TRYBE PRESALE",
    ]
    let comingEos = this.auth.eosConnectionData.eos
    let broadcast = true, _
    let sign = true

    // this.eos.eosAction(actionName, key, code, authAccount, params, broadcast, sign, comingEos)
  }

  getStats () {
    this.widget.getJSON()
      .subscribe(
        data => {
          this.stats = data;
          console.log(this.stats);
          if (data.data.symbol == 'EOS')
            this.statsReady = true;
        });
  }

  getCountry(ip) {
    this.widget.getCountry(ip)
      .subscribe(
        data => {
          if ( data.country == "US") {
            this.isActiveButton = true
            this.openDialog();
            this.menu.userCountry = data.country
          }
          console.log(data);
        });
  }

  login() {
    this.auth.login().then((obj: any) => {
      this.name = obj.account.name;
    }).catch(e => {
    })
  }

  getIp() {
    this.widget.GetIp()
      .subscribe(
        data => {
          let ip = data.ip
          this.getCountry(ip)
        });
  }

  getAccount (name) {
    this.eos.eosGetAccount(name).then(account => {
      this.account = account;
      console.log(this.account);
      this.maxram = this.account.ram_quota;
      this.useram = this.account.ram_usage;
      this.maxcpu = this.account.cpu_limit.available;
      this.usecpu = this.account.cpu_limit.used;
      this.maxnet = this.account.net_limit.available;
      this.usenet = this.account.net_limit.used;
      this.liquid = parseFloat(this.account.core_liquid_balance)
      this.liquidBalance(this.maxram, this.useram, this.maxcpu, this.usecpu, this.maxnet, this.usenet);
    });
  }

  liquidBalance (maxram, useram, maxcpu, usecpu, maxnet, usenet) {
    this.ramuse = useram / (maxram / 100);
    this.cpuuse = usecpu / (maxcpu / 100);
    this.netuse = usenet / (maxnet / 100);
  }

  check() {
    this.eos.eosPushTransaction(this.name)
  }

  // getAcc() {
  //   let name
  //   name = this.storage.retrieve('userName')
  //   this.widget.getAcc(name)
  //     .subscribe(
  //       data => {
  //         console.log(data)
  //       })
  // }

}
