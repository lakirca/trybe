import {Component, HostListener } from '@angular/core';


declare var $: any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  host: {
    '(window:resize)': 'onResize($event)'
  }
})
@HostListener('window:resize', ['$event'])
export class AppComponent {
  allCols = 100;
  baseHight = 10;

  leftMenuCols = 15;
  leftMenuRows = 0;
  leftMenuHeight = 0;

  topMenuCols = 85;
  topMenuRows = 15;

  baseContainerCols = 85;
  baseContainerRows = 0;

  sidebarOpened: boolean = true;
  constructor () {
  }

  // getBaseContentHeight () {
  //   const base = document.getElementById('baseContent');
  //   this.baseContainerRows = base.offsetHeight / this.baseHight ^ 0;
  //   // console.log('this.baseContainerRows : ', this.baseContainerRows);
  // }

  ngOnInit () {
    // this.getBaseContentHeight();
    // this.leftMenuRows = 50;
    // const base = document.getElementById('baseContent');
    // const top = document.getElementById('topMenu');
    // this.leftMenuHeight = base.offsetHeight + top.offsetHeight;
    // console.log('this.leftMenuRows : ', this.leftMenuRows);
    if($(window).width() <= 1024) {
      this.sidebarOpened = false;
    }
  }
  onResize(event) {
    if(event.target.innerWidth <= 1024) {
      this.sidebarOpened = false;
    } else {
      this.sidebarOpened = true;
    }
  }

  
  sidebarToggle () {
    this.sidebarOpened = !this.sidebarOpened;       
  }
}
