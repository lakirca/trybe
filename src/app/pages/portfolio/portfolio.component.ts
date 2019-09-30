import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {

  name:any;

  constructor(private auth: AuthService) {
    let sub
    this.auth.loggedStatus
      ? this.name = this.auth.eosConnectionData.account.name
      : sub = this.auth.loggedEvemt.subscribe((res:any) => {
        this.name = res.account.name;
        sub.unsubscribe();
      })
  }

  ngOnInit() {
  }

}
