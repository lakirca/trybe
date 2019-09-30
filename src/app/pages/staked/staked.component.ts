import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../services/auth.service';
import { EosioService } from '../../services/eosio.service'
@Component({
  selector: 'app-portfolio',
  templateUrl: './staked.component.html',
  styleUrls: ['./staked.component.css']
})
export class StakedComponent implements OnInit {

  name:any;
  account: any;
  staked: any;

  useram: any;
  usecpu: any;
  usenet: any;

  ramuse: any;
  cpuuse: any;
  netuse: any;
  maxram: any;
  maxcpu: any;
  maxnet: any;

  freenet:any;
  freecpu: any;
  freeram: any;

  liquid: any;
  userRow: any;
  userEosInfo: any;
  constructor(private auth: AuthService, private eos: EosioService) {
    let sub
    this.auth.loggedStatus
      ? this.name = this.auth.eosConnectionData.account.name
      : sub = this.auth.loggedEvemt.subscribe((result:any) => {
        this.name = result.account.name;
        const code = 'eosio.token';
        const symbol = 'EOS';
        this.getBalance(code, this.name, symbol);
        this.getRows();
        this.getAccount(this.name);
        this.getEosStaked('mytokentests')
        sub.unsubscribe();
      })
  }

  ngOnInit() {
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
    this.userEosInfo = user.eos_amount;
    console.log('USER INFO', this.userEosInfo);
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
      this.liquid = this.account.core_liquid_balance;
      this.liquidBalance(this.maxram, this.useram, this.maxcpu, this.usecpu, this.maxnet, this.usenet);
    });
  }

  liquidBalance (maxram, useram, maxcpu, usecpu, maxnet, usenet) {
    this.ramuse = useram / (maxram / 100);
    this.cpuuse = usecpu / (maxcpu / 100);
    this.netuse = usenet / (maxnet / 100);
    this.freeram = maxram - useram;
    this.freecpu = maxcpu - usecpu;
    this.freenet = maxnet - usenet;
  }

  getEosStaked (name) {
    this.eos.eosGetStaked(name)
      .then((result: any) => {
        //if (result.rows.length > 0)
        let data
        data = result.rows.find(x => x.from === name);
        this.staked = parseFloat(data.total_staked_trybe)
        console.log('Get account of eosio: ', result);
      });
  }
}
