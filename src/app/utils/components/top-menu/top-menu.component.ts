import {DeviceDetectorService} from 'ngx-device-detector';

import { Component, OnInit, EventEmitter } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { AuthService } from '../../../services/auth.service';
import { EosWidgetService } from '../../../services/eos-widget';
import { ChartService } from 'src/app/services/chart.service';

import { EosioService } from '../../../services/eosio.service';
declare var $: any;

@Component({
  selector: 'top-menu-component',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.css'],
})
export class TopMenuComponent implements OnInit {
  deviceInfo = null;
  isLogin: any;
  accountName: any;
  public name: string;
  public country: any;
  wpinfo: any;
  wpUserName: any;
  menuToggled: boolean = false;
  founder = false;
  tester = false;
  isMobile: any;

  constructor (
    private storage: LocalStorageService,
    private auth: AuthService,
    private widget: EosWidgetService,
    private eos: EosioService,
    private deviceService: DeviceDetectorService
  ) {
    this.epicFunction();
    const sub = this.auth.loggedEvemt.subscribe(result => {
      this.name = result.account.name;
      console.log(this.accountName);
      sub.unsubscribe();
      this.getWpInfo(this.name);
      this.checkFounder(this.name);
      this.checkTester(this.name);
    });
    const subLynx = this.auth.loggedEosEvemt.subscribe(result => {
      this.name = result.account.account_name;
      console.log(this.accountName);
      subLynx.unsubscribe();
      this.getWpInfo(this.name);
      this.checkFounder(this.name);
      this.checkTester(this.name);
    });
  }

  ngOnInit() {
    const home: any = document.getElementsByTagName('top-menu-component');
    home[0].style.width = '100%';
    this.epicFunction();
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

  redirect (name) {
    window.location.href = name;
  }

  loginLynx() {
    this.auth.eosLynx()
  }

  getMongo() {
    this.widget.getMongDb()
      .subscribe(
        data => {
          console.log('MONGO', data);
        });
  }


  getWpInfo (name) {
    this.widget.getWpInfo(name)
      .subscribe(
        data => {
          if (data[0] !== undefined) {
            this.wpinfo = data[0];
            this.wpUserName = this.wpinfo.name;
            console.log('SALEM', this.wpinfo);
            this.getOffChain(this.wpinfo.id);
          }
        });
  }

  checkFounder (name) {
    this.eos.eosGetTrybeFounders()
      .then((result: any) => {
        if (result.rows.find(x => x.account === name))
          this.founder = true;

      });
  }

  checkTester (name) {
    this.eos.eosGetTrybeTesters()
      .then((result: any) => {
        if (result.rows.find(x => x.account === name))
          this.tester = true;

      });
  }

  getOffChain (id) {
    this.widget.getOffChain(id)
      .subscribe(
        data => {
          console.log('OFF CHAIN', data);
        });
  }

  logout () {
    console.log('logout completed');
    this.name = null;
    this.auth.logout();
  }

  login () {
    this.auth.login().then((obj: any) => {
      console.log('name after login : ', obj.account.name);
      this.name = obj.account.name;
    }).catch(e => {
      console.log('login error: ', e);
    });
  }

  menuToggle () {
    this.menuToggled = !this.menuToggled;
  }
}
