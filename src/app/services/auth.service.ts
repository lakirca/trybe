import { Injectable } from '@angular/core';
import {ConfigsService} from './configs.service';
import {ChartService} from './chart.service';
import Eos from 'eosjs'
import ScatterJS from 'scatterjs-core';
import ScatterEOS from 'scatterjs-plugin-eosjs';
import {Subject} from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private scatter: any = null;
  public eosConnectionData:any;
  public loggedStatus = false;
  public loggedEvemt: Subject<any> = new Subject();
  public loggedEosEvemt: Subject<any> = new Subject();
  public name: any;

  constructor(private configs: ConfigsService, private chartService: ChartService) {
    ScatterJS.plugins(new ScatterEOS());
    ScatterJS.scatter.connect('mainnet').then(connected => {
      if (!connected) {
        console.error("........................ Scatter connections down ......................");
        return false;
      }
      this.scatter = ScatterJS.scatter;
      this.login(this.scatter)
        .then((connection: any) => {
          // console.log("Scatter connection is complete...")
        });
    });
  }

  public eosLynx () {
    var eoslynx = require('eos-lynx');
    const self = this
    eoslynx.getAccountInfo('W8kH79C7ytXTIC7wGCY2aN1xpOrbF7VrMR9S5LN7c4gHigX', true, false, 'session123')
      .then(response => {
        console.log(response);
        self.loggedEosEvemt.next(response)
        self.loggedStatus = true;
      });
  }

  public login(scatter?) {
    const self = this;
    return new Promise((resolve, reject) => {
      if (scatter) self.scatter = scatter;
      this.scatter.getIdentity({accounts: [self.configs.network]}).then(id => {
        try {
          // console.log('id', id);
          const account = self.scatter.identity.accounts.find(x => x.blockchain === 'eos');

          console.log("auth acc: ", account);
          this.name = account

          // You can pass in any additional options you want into the eosjs reference.
          const eosOptions = {expireInSeconds: 250};

          // Get a proxy reference to eosjs which you can use to sign transactions with a user's Scatter.
          const eos = self.scatter.eos(self.configs.network, Eos, eosOptions);
          self.eosConnectionData = {eos: eos, account: account}
          self.loggedEvemt.next(self.eosConnectionData)
          self.loggedStatus = true;
          resolve({eos: eos, account: account})
        }catch (e) {
          reject(e)
        }
      });
    });
  }

  public logout() {
    this.scatter.forgetIdentity();
    location.reload()
  };
}
