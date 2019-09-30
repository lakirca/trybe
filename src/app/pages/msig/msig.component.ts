import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-msig',
  templateUrl: './msig.component.html',
  styleUrls: ['./msig.component.css']
})
export class MsigComponent implements OnInit {

  public name: string;

  constructor (private auth: AuthService) {

  }

  ngOnInit () {
    if(this.auth.loggedStatus)
      this.name = this.auth.eosConnectionData.account.name;
    else {
      const sub = this.auth.loggedEvemt.subscribe(
        obj => {
          console.log("name of account: ", obj.account.name)
          this.name = obj.account.name;
          sub.unsubscribe()
        });
    }
  }

  logout () {
    console.log('logout completed');
    this.name = null;
    this.auth.logout();
  }

  login() {
    this.auth.login().then((obj: any) => {
      console.log("name after login : ", obj.account.name)
      this.name = obj.account.name;
    }).catch(e => {
      console.log("login error: ", e)
    })
  }
}
