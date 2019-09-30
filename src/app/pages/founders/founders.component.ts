import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {EosioService} from '../../services/eosio.service';
import {BuyRamDialog} from '../../utils/components/buy-ram-dialog/buy-ram-dialog';
import {MatDialog} from '@angular/material';
import { ChartService } from 'src/app/services/chart.service';
import { EosWidgetService } from 'src/app/services/eos-widget';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-portfolio',
  templateUrl: './founders.component.html',
  styleUrls: ['./founders.component.css'],
  // encapsulation: ViewEncapsulation.None
})
export class FoundersComponent implements OnInit {

  minute = 60000;

  name: any;
  account: any;
  staked: any;

  ramPrice: any;

  userRow: any;
  userEosInfo: any;

  selectorWidth: any;
  styleMenu: any;

  fndrupdate: boolean = false;
  addtester: boolean = false;
  testingTransfer: boolean = false;

  public presaleData: any = {
    totalAmountEos: 0,
    totalAmountTrybe: 0,
    totalUniqueAcc: 0,
  };

  public accountsToDisplay = [
    'trybenetwork',
    'trybepresale',
    'trybereserve'
  ];

  complited = [];

  accountsDataObj = {};

  founders: any = [];
  list:any = [];
  listByNames:any  = [];
  propertisListToPrice: any = [];
  propertisListToInfo: any = [];
  propertisListToFounders: any = [];
  constructor (private auth: AuthService,
               private eos: EosioService,
               private tokens: ChartService,
               private widget: EosWidgetService,
               public dialog: MatDialog) {

    const subscribe = this.tokens.getJSON().subscribe((res:any) => {
      this.list.push(...res);
      
      // GET STAKED, DIVIDENT, INTEREST TOKENS
      this.tokens.stakedTokens
      this.tokens.dividend; 
      this.tokens.intTokens;

      subscribe.unsubscribe;
    });

    let sub;
    console.log('founder constructor......... - ', this.auth.eosConnectionData);
   
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

  showToken() {
    this.tokens.showTokens = true;
    // ADD SELECTED TOKENS TO LIST
    this.list.forEach((e:any) => {
      // GET ALL TOKENS 
      this.listByNames.push(e.symbol);
    });
    console.log(this.listByNames);
  }

  initProcess (): any {
    if (!this.name) this.name = this.auth.eosConnectionData.account.name;

    // this.accountsToDisplay.push(this.name);
    this.propertisListToPrice = [this.auth.eosConnectionData.eos, true, 'eosio', 'eosio', 'rammarket', -1, null, null];
    this.propertisListToInfo = [
      this.auth.eosConnectionData.eos, true, 'trybepresale', 'trybepresale', 'trybepresale', -1, null, null
    ];
    this.propertisListToFounders = [
      this.auth.eosConnectionData.eos, true, 'trybenetwork', 'trybenetwork', 'founders', -1, null, null
    ];

    this.getFounders();
    const code = 'eosio.token';
    const symbol = 'EOS';
    this.getBalance(code, this.name, symbol);
    this.getRows();
    for (let acc of this.accountsToDisplay) {
      this.getAccountsData(acc);
    }
    setInterval(() => {
      for (let acc of this.accountsToDisplay) {
        this.getAccountsData(acc);
      }
    }, this.minute*5)
    this.getInfo();
    return;
  }

  ngOnInit () {
    
  } 
    
    getAccountsData (name) {
    this.eos.eosGetAccount(name).then((account: any) => {

      this.accountsDataObj[name] = {
        maxram: account.ram_quota,
        useram: account.ram_usage,
        maxcpu: account.cpu_limit.available,
        usecpu: account.cpu_limit.used,
        maxnet: account.net_limit.available,
        usenet: account.net_limit.used,
        liquid: account.core_liquid_balance,
        ramuse: null,
        cpuuse: null,
        netuse: null,
        freeram: null,
        freecpu: null,
        freenet: null
      };

      this.liquid(name);
    });
  }

  liquid (name) {
    this.accountsDataObj[name].ramuse = this.accountsDataObj[name].useram / (this.accountsDataObj[name].maxram / 100);
    this.accountsDataObj[name].cpuuse = this.accountsDataObj[name].usecpu / (this.accountsDataObj[name].maxcpu / 100);
    this.accountsDataObj[name].netuse = this.accountsDataObj[name].usenet / (this.accountsDataObj[name].maxnet / 100);
    this.accountsDataObj[name].freeram = this.accountsDataObj[name].maxram - this.accountsDataObj[name].useram;
    this.accountsDataObj[name].freecpu = this.accountsDataObj[name].maxcpu - this.accountsDataObj[name].usecpu;
    this.accountsDataObj[name].freenet = this.accountsDataObj[name].maxnet - this.accountsDataObj[name].usenet;
    if (this.complited.indexOf(name) === -1) this.complited.push(name);
  }

  getBalance (code, name, symbol) {
    this.eos.eosGetBalance(code, name, symbol);
  }

  getRows () {
    this.eos.eosGetRows()
      .then((result: any) => {
        console.log('ROWS ', result);
        let data = result.rows;
        this.userRow = data;
        this.getEosInfo(this.name);
      });
  }

  getEosInfo (name) {
    let user = this.userRow.find(x => x.owner === name);
    this.userEosInfo = user ? user.eos_amount : 0;
    console.log('USER INFO', this.userEosInfo);
  }

  getEosStaked (name) {
    this.eos.eosGetStaked(name)
      .then((result: any) => {
        //if (result.rows.length > 0)
        let data;
        data = result.rows.find(x => x.from === name);
        this.staked = result.rows.length > 0 ? parseFloat(data.total_staked_trybe) : 0;
        console.log('Get account of eosio: ', result);
      });
  }

  pay (name, type) {
    const dialogRef = this.dialog.open(BuyRamDialog, {
      height: '400px',
      width: '600px',
      data: {name: name, type: type}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed, result: ', result);
      switch (type) {
        case 'ram':
          return result && result.amount && Number(result.amount) > 0
            ? this.buyRamCalc(name, result.amount)
            : console.log('Dialog closed without valid amount (RAM)');
        case 'cpu':
          return result && result.amount && Number(result.amount) > 0
            ? this.eos.eosDelegate(
              this.name,
              this.auth.eosConnectionData.eos,
              name,
              '0.0000 EOS',
              this.correctAmount(result.amount)
            ).then(res => {
              console.log('Result of CPU pay: ', res);
              this.getAccountsData(name);
            }).catch(err => {
              console.error(err);
            })
            : console.log('Dialog closed without valid amount (CPU)');
        case 'net':
          return result && result.amount && Number(result.amount) > 0
            ? this.eos.eosDelegate(
              this.name,
              this.auth.eosConnectionData.eos,
              name,
              this.correctAmount(result.amount),
              '0.0000 EOS'
            ).then(res => {
              console.log('Result of NET pay: ', res);
              this.getAccountsData(name);
            }).catch(err => {
              console.error(err);
            })
            : console.log('Dialog closed without valid amount (NET)');
        default:
          console.log('Impossible');
      }
    });
  }

  correctAmount (amount) {
    const count = Number(amount);
    return count && count > 0 ? String(count.toFixed(4)) + ' EOS' : '0.0000 EOS';
  }

  getInfo () {
    this.eos.getRows(...this.propertisListToInfo).then(async (res: any) => {
      this.presaleData.totalUniqueAcc = res.rows.length;
      this.presaleData.totalAmountTrybe = 0;
      this.presaleData.totalAmountEos = 0;
      if (res.rows.length > 0)
        res.rows.map((item: any) => {
          this.presaleData.totalAmountTrybe += Number(item.trybe_amount.split(' ')[0]);
          this.presaleData.totalAmountEos += Number(item.eos_amount.split(' ')[0]);
        });
      this.presaleData.totalAmountTrybe = String(this.presaleData.totalAmountTrybe.toFixed(4));
      this.presaleData.totalAmountEos = String(this.presaleData.totalAmountEos.toFixed(4));
      this.getRamPrice();
    }).catch(err => console.log(err));
  }

  getRamPrice () {
    this.eos.getRows(...this.propertisListToPrice).then(async (ramData: any) => {
      const data = {
        quoteBbalance: Number(ramData.rows[0].quote.balance.split(' ')[0]),
        baseBalance: Number(ramData.rows[0].base.balance.split(' ')[0]),
        weight: Number(ramData.rows[0].quote.weight)
      };
      this.ramPrice = data.quoteBbalance / (data.baseBalance * data.weight);
      console.log('RAM price : ', this.ramPrice);
    }).catch(err => console.error(err));
  }

  getFounders () {
    this.eos.getRows(...this.propertisListToFounders).then(async (res: any) => {
      this.founders = [];
      console.log('>>>>>>>>>> founders request res: ', res);
      for (let i = 0; i < res.rows.length; i++) {
        this.founders.push(res.rows[i].account);
      }
      console.log('founders : ', this.founders);
    }).catch(err => console.error(err));
  }

  buyRamCalc (name, amount) {
    this.eos.getRows(...this.propertisListToPrice).then(async (ramData: any) => {
      const data = {
        quoteBbalance: Number(ramData.rows[0].quote.balance.split(' ')[0]),
        baseBalance: Number(ramData.rows[0].base.balance.split(' ')[0]),
        weight: Number(ramData.rows[0].quote.weight)
      };
      this.ramPrice = data.quoteBbalance / (data.baseBalance * data.weight);
      console.log('RAM price : ', this.ramPrice);
      const bytes = Number((Number(amount) / this.ramPrice).toFixed(0));
      this.eos.eosBuyRam(this.name, this.auth.eosConnectionData.eos, name, bytes)
        .then(res => {
          console.log('Result of RAM pay: ', res);
          this.getAccountsData(name);
        }).catch(err => console.error(err));
    }).catch(err => console.error(err));
  }

  selectTesters () {
    this.addtester = true;
    this.fndrupdate = false;
    this.testingTransfer = false;
  }

  selectFaunders () {
    this.addtester = false;
    this.fndrupdate = true;
    this.testingTransfer = false;
  }

  selectTest () {
    this.addtester = false;
    this.fndrupdate = false;
    this.testingTransfer = true;
  }

  selectNone () {
    this.addtester = false;
    this.fndrupdate = false;
    this.testingTransfer = false;
  }

}