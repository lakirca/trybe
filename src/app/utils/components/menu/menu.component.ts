import {Component, OnInit} from '@angular/core';
import {LocalStorageService} from 'ngx-webstorage';
import {AuthService} from '../../../services/auth.service';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import {EosioService} from '../../../services/eosio.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {stakedDialog} from "../staked-dialog/staked-dialog.utils";
import {unstakedDialog} from "../unstaked-dialog/unstaked-dialog.utils";
import {EosWidgetService} from '../../../services/eos-widget'
import {allertDialog} from "../allert-dialog/allert-dialog.utils";

export interface DialogData {
  staked: string;
  name: string;
}

@Component({
  selector: 'menu-component',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  name: any;
  accountName: any;
  closeResult: string;
  staked: any;
  balance: any;
  userEosInfo = 0
  wpinfo: any;
  offchain = 0
  liquid = 0
  total: any;
  refamount: any;
  wpUserName: any;
  refundDate: any;
  refTimer: any;
  delegated: any;
  public userCountry: any;
  constructor (
    private storage: LocalStorageService,
    private auth: AuthService,
    private modalService: NgbModal,
    private eos: EosioService,
    public dialog: MatDialog,
    public widget: EosWidgetService,

  ) {
    const sub = this.auth.loggedEvemt.subscribe(result => {
      this.name = result.account.name;
      this.getEosStaked(result.account.name);
      const code = 'eosio.token';
      const symbol = 'EOS';
      this.getBalance(code, result.account.name, symbol);
      sub.unsubscribe();
      this.getRefunds()
      this.getWpInfo(result.account.name)
      this.getLiquidBalance(this.name)
    });
    const subLynx = this.auth.loggedEosEvemt.subscribe(result => {
      console.log(result)
      this.name = result.account.account_name
      this.getEosStaked(result.account.name);
      const code = 'eosio.token';
      const symbol = 'EOS';
      this.getBalance(code, result.account.name, symbol);
      sub.unsubscribe();
      this.getRefunds()
      this.getWpInfo(result.account.name)
      this.getLiquidBalance(this.name)
      subLynx.unsubscribe();
    });
  }


  loginLynx() {
    this.auth.eosLynx()
  }

  ngOnInit () {
    console.log(this.auth.eosConnectionData);
    const menu: any = document.getElementsByTagName('menu-component');
    menu[0].style.width = '100%';
    menu[0].style.height = '100%';
  }

  login () {
    this.auth.login().then((obj: any) => {
      console.log('name after login : ', obj.account.name);
      this.name = obj.account.name;
    }).catch(e => {
      console.log('login error: ', e);
    });
  }

  getWpInfo(name) {
    this.widget.getWpInfo(name)
      .subscribe(
        data => {
          if (data[0] !== undefined) {
            this.wpinfo = data[0]
            this.wpUserName = this.wpinfo.name
            this.accountName = "Hi " + this.wpUserName
            this.getOffChain(this.wpinfo.id)
          }
        });

  }

  openDialog(): void {
    const dialogRef = this.dialog.open(stakedDialog, {
      width: '450px',
      data: {name: this.name, staked: this.liquid}
    })
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.getEosStaked(this.name)
    });
  }

  getRefunds() {
    this.eos.eosGetRefunds(this.name)
      .then((result: any) => {
        if (result.rows.length > 0) {
          this.refamount= parseFloat(result.rows[0].amount);
          // let date = new Date(result.rows[0].request_time*1000)
          let date = result.rows[0].request_time += 259200
          let newDate = new Date(result.rows[0].request_time * 1000)
          const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
          ];
          this.refTimer = monthNames[newDate.getMonth()] + " " + newDate.getDate() +  ", " + newDate.getFullYear()+  ", " + newDate.getHours() + ":" + newDate.getMinutes()
          console.log(this.refTimer)
        }
      });

  }

  openUnstake(): void {
    const dialogRef = this.dialog.open(unstakedDialog, {
      width: '450px',
      data: {name: this.name, staked: this.staked}
    })
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.getEosStaked(this.name)
      this.getRefunds();
    });
  }

  getLiquidBalance(name) {
    this.eos.eosGetLiquidBalance(name)
      .then((result: any) => {
        console.log('Presale balance: ', result);
        this.liquid = result.rows[0] ? parseFloat(result.rows[0].balance) : 0;
        console.log(this.liquid)
        this.getWpInfo(name);
        this.getTotal();
      });

  }

  getOffChain(id) {
    this.widget.getOffChain(id)
      .subscribe(
        (data: any) => {
          console.log("OFF CHAIN", data);
          this.offchain = parseFloat(data.tokens)
          this.getTotal()
        });
  }

  getEosStaked (name) {
    this.eos.eosGetStaked(name)
      .then((result: any) => {
        //if (result.rows.length > 0)
        let data
        data = result.rows.find(x => x.from === name);
        this.staked = data ? parseFloat(data.total_staked_trybe) : 0
        console.log('Get account of eosio: ', result);
        this.getEosInfo(name);

        var sum = 0;

        let delegatedObjects  =  result.rows.filter(function(user) {
          return user.owner != name
        });


        delegatedObjects.forEach(function(obj){
          sum += parseFloat(obj.total_staked_trybe);
        });

        this.delegated = sum

      });
  }


  getTotal() {
    this.total = this.liquid + this.userEosInfo + this.offchain
  }

  getBalance(code, name, symbol) {
    this.eos.eosGetBalance(code, name, symbol)
    .then((result: any) => {
      this.balance = parseFloat(result)
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
        this.getTotal()
      });
  }


  open (content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  logout() {
    console.log('logout completed');
    this.name = null;
    this.auth.logout();
  }

  private getDismissReason (reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
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

  setRefunds() {
    // let amount = this.refamount.toFixed(4)
    let amount = 4.0000
    let authAccount = this.name
    let key = null
    let code = "trybenetwork"
    let actionName = "refundtrybe"
    let params = [
      this.name,
      0
    ]
    let comingEos = this.auth.eosConnectionData.eos
    let broadcast = true, _
    let sign = true

    this.eos.eosAction(actionName, key, code, authAccount, params, broadcast, sign, comingEos)
      .then((action:any) => {
        console.log('$$$$$ action: ', action);
        let text = "SUCCESS";
        this.openAllertDialog(text, action.transaction_id)
      })
      .catch(err => {
        const errorRes = err.message ? err.message : err;
        console.log('# action error: ', errorRes);
        let text = "ERROR"
        this.openAllertDialog(text, err.message);
      });
  }

}
