import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  TemplateRef,
  SkipSelf,
  HostListener,
} from '@angular/core';
import { ChartService } from '../../../services/chart.service';
import { EosioService } from '../../../services/eosio.service';
import { AuthService } from 'src/app/services/auth.service';
import { EosWidgetService } from 'src/app/services/eos-widget';
import * as sortAlph from 'alphanumeric-sort';
import * as _ from 'lodash';
import { ActivatedRoute } from '@angular/router';
import { MenuComponent } from '../menu/menu.component';
import { TopMenuComponent } from '../top-menu/top-menu.component';
import { Angular5Csv } from 'angular5-csv/Angular5-csv';
import { Chart } from 'chart.js';
import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

declare var $: any;

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css'],
})
export class ChartComponent implements OnInit {
  // @ViewChild("myCanvas") public canvas: ElementRef;
  @ViewChild('myCanvasPie') canvasPie: ElementRef;
  @ViewChild('myCanvasLine') canvasLine: ElementRef;
  @HostListener('window:resize', ['$event'])
  chartSwithClass: string = 'amount';
  public innerWidth: any;

  constructor(
    private eos: EosioService,
    private tMenu: TopMenuComponent,
    private auth: AuthService,
    private widget: EosWidgetService,
    private route: ActivatedRoute,
    private menu: MenuComponent,
    private chart: ChartService,
    private spinner: NgxSpinnerService
  ) {
    this.innerWidth = window.innerWidth;
  }

  ngOnInit() {
    this.chart.counter++;
    this.showPie();

    if (this.chart.counter < 2 && !this.chart.show) {
      this.login();
      this.spinner.show();
    }
    this.getTokenOjb();
    this.chart.getJSON().subscribe(data => {
      let x: any = [];
      x.push(...data);
      this.chart.tokenC.push(...data);
      this.chart.tokens = _.uniq(x, function(p) {
        return p.account;
      });
    });

    this.widget.getData().subscribe(e => {
      this.chart.eosUsd = e.data[1765].quotes.USD.price; // Get EOS in USD

      let o = Object.entries(e.data);
      o.forEach(element => {
        this.chart.allTkns.push(element[1]);
      });
    });

    const sub = this.auth.loggedEvemt.subscribe(result => {
      this.eos
        .eosGetAccount(result.account.name) //'gm2diobtgmge
        .then((e: any) => {
          if (e.self_delegated_bandwidth != null) {
            let x = parseFloat(e.self_delegated_bandwidth.net_weight);
            let y = parseFloat(e.self_delegated_bandwidth.cpu_weight);
            this.chart.eosStaked = x + y;
          }

          this.eosStaked(result.account.name);

          if (this.chart.counter < 2 && !this.chart.show) {
            this.chart.totalTokens.push(e.core_liquid_balance);
            this.chart.sortedTokens = this.chart.totalTokens.sort(sortAlph.compare);

            this.getBalance(result.account.name); //result.account.name
            this.getFstakes(result.account.name);
            this.getEosUnstaked(result.account.name);
          }
        })
        .then(() => {
          setTimeout(() => {
            if (this.chart.counter < 2 && !this.chart.show) {
              this.getValues();
            }
          }, 5000);
        })
        .catch((err:any) => console.error(err));
      sub.unsubscribe();
    });
  }

  
  onHover() {
    const self = this;
    if (self.innerWidth < 768) {
      $('.hiddenCol').hover(
        function() {
          $(this)
            .find('.hovered')
            .show();
        },
        function() {
          $(this)
            .find('.hovered')
            .hide();
        }
      );
    }
  }

  public tokenClick(e): void {
    const self = this;
    $('.tokenRow').click(function() {
      $('.tokenRow').removeClass('current');
      $(this).addClass('current');
    });
    if (self.chart.pipe == '%') {
      self.chart.val = self.chart.amountResult[e].amount;
      self.chart.tokenName = self.chart.amountResult[e].name;
    }
    if (self.chart.pipe == 'EOS') {
      self.chart.val = self.chart.eosResult[e].eosVal;
      self.chart.tokenName = self.chart.eosResult[e].name;
    }
    if (self.chart.pipe == '$') {
      self.chart.val = self.chart.usdResult[e].totalPrice;
      self.chart.tokenName = self.chart.usdResult[e].name;
    }
  }

  exportToExcel() {
    let name = this.menu.name + 'Excel';
    this.chart.exportAsExcelFile(this.chart.total, name);
  }

  exportToCsv() {
    let name = this.menu.name + 'TrybeCSV';
    let value = this.chart.total;
    new Angular5Csv(value, name);
  }

  sortUsd() {
    this.chart.usdResult = _.sortBy(this.chart.usdResult, o => o.totalPrice);
    this.chart.usdResult.reverse();
    return this.chart.usdResult;
  }

  sortEos() {
    this.chart.eosResult = _.sortBy(this.chart.eosResult, o => o.eosVal);
    this.chart.eosResult.reverse();
    return this.chart.eosResult;
  }

  sortAmount() {
    this.chart.amountResult = _.sortBy(this.chart.amountResult, o => o.value);
    this.chart.amountResult.reverse();
    return this.chart.amountResult;
  }

  restore(object) {
    const self = this;

    if (self.chart.pipe == '%') {
      self.chart.tokenSum = self.chart.tokenSum + object.value; // delete that name from sum

      self.chart.numberArray = [];
      self.chart.chartLabels = [];
      self.chart.chartData = [];

      self.chart.amountResult.push(object);

      this.sortAmount();

      self.chart.amountResult.forEach(el => {
        self.chart.chartLabels.push(el.name);
        self.chart.chartData.push(el.value);
        let x = (el.value / self.chart.tokenSum) * 100;
        self.chart.numberArray.push(x);
      });

      self.chart.amountResult = _.zip(
        self.chart.chartLabels,
        self.chart.chartData,
        self.chart.numberArray
      ).map(function(pair) {
        return _.object(['name', 'value', 'amount'], pair);
      });

      self.chart.deletedTokens.shift();
      if (self.chart.deletedTokens.length == 0) self.chart.isDeleted = false;

      if (self.chart.chartType === 'doughnut') {
        self.chart.val = self.chart.amountResult[0].amount;
        self.chart.tokenName = self.chart.amountResult[0].name;
        self.showPie();
      } else {
        self.showGraph();
      }
    }
    if (this.chart.pipe == '$') {
      this.chart.delUsd.shift();
      if (this.chart.delUsd.length == 0) this.chart.isUsdDeleted = false;
      this.chart.usdResult.push(object);

      this.chart.chartData.push(object.totalPrice);
      this.chart.chartLabels.push(object.name);

      this.chart.usdResult = _.uniq(this.chart.usdResult, function(p) {
        return p.name;
      });

      this.sortUsd();

      if (this.chart.chartType === 'doughnut') {
        self.chart.val = self.chart.usdResult[0].totalPrice;
        self.chart.tokenName = self.chart.usdResult[0].name;

        this.showPie();
      } else {
        this.showGraph();
      }
    }
    if (this.chart.pipe == 'EOS') {
      this.chart.delEos.shift();
      if (this.chart.delEos.length == 0) this.chart.isEosDeleted = false;
      this.chart.eosResult.push(object);

      this.chart.chartData.push(object.eosVal);
      this.chart.chartLabels.push(object.name);

      this.chart.eosResult = _.uniq(this.chart.eosResult, function(p) {
        return p.name;
      });

      this.sortEos();

      if (this.chart.chartType === 'doughnut') {
        self.chart.val = self.chart.eosResult[0].eosVal;
        self.chart.tokenName = self.chart.eosResult[0].name;

        this.showPie();
      } else {
        this.showGraph();
      }
    }
  }

  public delete(index) {
    const self = this;
    this.chart.val = '';
    this.chart.tokenName = '';

    if (self.chart.pipe == '%') {
      // get del object
      if (self.chart.amountResult.length > 1) {
        let delArray = _.remove(self.chart.amountResult, function(n) {
          return n == self.chart.amountResult[index];
        });
        self.chart.tokenSum = self.chart.tokenSum - delArray[0].value; // delete that name from sum

        self.chart.deletedTokens.push(...delArray);
        self.chart.deletedData = self.chart.chartData[index];

        self.chart.numberArray = [];
        self.chart.chartLabels = [];
        self.chart.chartData = [];

        this.sortAmount();

        self.chart.amountResult.forEach(el => {
          self.chart.chartLabels.push(el.name);
          self.chart.chartData.push(el.value);
          let x = (el.value / self.chart.tokenSum) * 100;
          self.chart.numberArray.push(x);
        });

        self.chart.amountResult = _.zip(
          self.chart.chartLabels,
          self.chart.chartData,
          self.chart.numberArray
        ).map(function(pair) {
          return _.object(['name', 'value', 'amount'], pair);
        });

        // self.chart.amountResult = _.filter(self.chart.amountResult, item => {
        //   return item.value > 0;
        // });

        self.chart.isDeleted = true;

        if (this.chart.chartType === 'doughnut') {
          self.chart.val = self.chart.amountResult[0].amount;
          self.chart.tokenName = self.chart.amountResult[0].name;
          this.showPie();
        } else {
          this.showGraph();
        }
      }
    }

    if (self.chart.pipe == '$') {
      if (self.chart.usdResult.length > 1) {
        var delUSDArray = _.remove(self.chart.usdResult, n => {
          return n == self.chart.usdResult[index];
        });

        self.chart.delUsd.push(...delUSDArray);

        self.chart.chartData = [];
        self.chart.chartLabels = [];

        this.sortUsd();

        self.chart.usdResult.forEach(e => {
          self.chart.chartData.push(e.totalPrice);
          self.chart.chartLabels.push(e.name);
        });

        self.chart.isUsdDeleted = true;

        if (self.chart.chartType === 'doughnut') {
          self.chart.val = self.chart.usdResult[0].totalPrice;
          self.chart.tokenName = self.chart.usdResult[0].name;

          self.showPie();
        } else {
          self.showGraph();
        }
      }
    }

    if (self.chart.pipe == 'EOS') {
      if (self.chart.eosResult.length > 1) {
        var delEosArray = _.remove(this.chart.eosResult, x => {
          return x == this.chart.eosResult[index];
        });

        self.chart.delEos.push(...delEosArray);

        self.chart.chartData = [];
        self.chart.chartLabels = [];

        this.sortEos();

        self.chart.eosResult.forEach(e => {
          self.chart.chartData.push(e.totalPrice);
          self.chart.chartLabels.push(e.name);
        });

        self.chart.isEosDeleted = true;

        if (self.chart.chartType === 'doughnut') {
          self.chart.val = self.chart.eosResult[0].eosVal;
          self.chart.tokenName = self.chart.eosResult[0].name;

          self.showPie();
        } else {
          self.showGraph();
        }
      }
    }
  }

  public tokenType(type?) {
    const self = this;
    self.chart.tokenName = '';
    self.chart.val = '';
    // $('.typeButton').click(function() {
    // $('.typeButton').removeClass('selected');
    // this.addClass('selected');
    if (type == 'eos') {
      self.chartSwithClass = 'eos';
      self.chart.pipe = 'EOS';

      self.chart.showTypeEos = true;
      self.chart.showTypeAmount = false;
      self.chart.showTypeUsd = false;

      self.chart.chartLabels = [];
      self.chart.chartData = [];

      self.chart.eosResult = _.filter(self.chart.eosResult, item => {
        return item.eosVal > 0;
      });

      this.sortEos();

      self.chart.eosResult.forEach(e => {
        self.chart.chartLabels.push(e.name);
        self.chart.chartData.push(e.eosVal);
      });

      if (self.chart.chartType === 'doughnut') {
        self.chart.val = self.chart.eosResult[0].eosVal;
        self.chart.tokenName = self.chart.eosResult[0].name;

        self.showPie();
      } else {
        self.showGraph();
      }
    }
    if (type == 'amount') {
      self.chartSwithClass = 'amount';
      self.chart.pipe = '%';
      // change chart data and labels to that type

      self.chart.showTypeAmount = true;
      self.chart.showTypeUsd = false;
      self.chart.showTypeEos = false;

      self.chart.chartLabels = [];
      self.chart.chartData = [];

      this.sortAmount();

      self.chart.amountResult.forEach(e => {
        self.chart.chartLabels.push(e.name);
        self.chart.chartData.push(e.value);
      });

      if (self.chart.chartType === 'doughnut') {
        self.chart.val = self.chart.amountResult[0].amount;
        self.chart.tokenName = self.chart.amountResult[0].name;

        self.showPie();
      } else {
        self.showGraph();
      }
    }
    if (type == 'usd') {
      self.chartSwithClass = 'usd';
      self.chart.pipe = '$';

      self.chart.amountData;
      self.chart.showTypeUsd = true;
      self.chart.showTypeEos = false;
      self.chart.showTypeAmount = false;

      self.chart.chartLabels = [];
      self.chart.chartData = [];

      self.chart.usdResult = _.filter(self.chart.usdResult, item => {
        return item.totalPrice > 0;
      });

      this.sortUsd();

      self.chart.usdResult.forEach(e => {
        self.chart.chartLabels.push(e.name);
        self.chart.chartData.push(e.totalPrice);
      });

      if (self.chart.chartType === 'doughnut') {
        self.chart.val = self.chart.usdResult[0].totalPrice;
        self.chart.tokenName = self.chart.usdResult[0].name;

        self.showPie();
      } else {
        self.showGraph();
      }
    }
  }

  public toggleDiv() {
    if (this.chart.all == 'Show Tokens') {
      this.chart.all = 'Hide Tokens';
      $('.title2').toggle('slow');
      this.chart.showSearch = true;
      $('.title2').toggleClass('line');
    } else if (this.chart.all == 'Hide Tokens') {
      this.chart.all = 'Show Tokens';
      $('.title2').toggle('slow');
      this.chart.showSearch = false;
    }
  }

  public toggleZero() {
    if (this.chart.zero == 'Show Zero') {
      this.chart.total = this.chart.zeroArray;
      this.chart.zero = 'Hide Zero';
    } else if (this.chart.zero == 'Hide Zero') {
      this.chart.zero = 'Show Zero';
      this.chart.total = _.filter(this.chart.total, item => {
        if (item.value == 0) {
          this.chart.zeroValue.push(item);
        }
        return item.value > 0;
      });
    }
  }

  public showPie() {
    this.chart.chartTypePie = true;

    if (this.chart.chartPie != undefined) {
      this.chart.chartPie.destroy();
    }

    this.chart.chartPie = new Chart('canvas', {
      type: 'doughnut',
      options: {
        animation: {
          easing: 'linear',
        },
        title: false,
        legend: false,
        tooltips: false,
        cutoutPercentage: 49,
        responsive: true,
        showTooltips: true,
        labels: true,
      },
      data: {
        labels: this.chart.chartLabels,
        datasets: [
          {
            data: this.chart.chartData,
            fill: true,
            backgroundColor: [
              '#586cb4',
              '#9a87ff',
              '#879dff',
              '#87cbff',
              '#87e7ff',
              '#dc87ff',
            ],
            borderColor: [
              '#586cb4',
              '#9a87ff',
              '#879dff',
              '#87cbff',
              '#87e7ff',
              '#dc87ff',
            ],
            borderWidth: 0,
          },
        ],
      },
    });

    $('.titleDiv').show();
    this.chart.chartType = 'doughnut';
  }

  public chartEntered(evt: any) {
    let activePoints = this.chart.chartPie.getElementAtEvent(evt);

    let chartData = activePoints[0]['_chart'].config.data;
    let idx = activePoints[0]['_index'];

    let label = chartData.labels[idx];
    let value = chartData.datasets[0].data[idx];
    if (this.chart.pipe == '%') {
      let valuesSum = chartData.datasets[0].data.reduce((a, b) => a + b, 0);
      let valuePercent = (100 / valuesSum) * value;
      this.chart.val = valuePercent;
    } else {
      this.chart.val = value;
    }

    this.chart.tokenName = label;
    //highlight the pie piece
    if (activePoints.length > 0) {
      let defaultBgColor = this.chart.chartPie.backgroundColor;
      let addRadiusMargin = 10;
      let currentSelectedPieceLabel = '';
      //get the internal index of slice in pie chart
      let clickedElementindex = activePoints[0]['_index'];

      //get specific label by index
      let clickedLabel = this.chart.chartPie.data.labels[clickedElementindex];

      if (currentSelectedPieceLabel.toUpperCase() == '') {
        // no piece selected yet, save piece label
        currentSelectedPieceLabel = clickedLabel.toUpperCase();
        $('.tokenRow').removeClass('current');
        $('.tokenRow.' + currentSelectedPieceLabel).addClass('current');
      }
      this.chart.chartPie.render(500, false);
    }
  }

  public showGraph() {
    this.chart.chartTypePie = false;
    if (this.chart.chartLine != undefined) {
      this.chart.chartLine.destroy();
    }

    this.chart.chartType = 'bar';
    let gradient = this.canvasLine.nativeElement.getContext('2d');
    let gradientOrange = gradient.createLinearGradient(0, 0, 0, 450);

    gradientOrange.addColorStop(0, 'rgba(77, 212, 182, 0.16)');
    gradientOrange.addColorStop(1, 'rgba(77, 212, 182, 0)');

    this.chart.chartLine = new Chart('canvas2', {
      type: 'bar',
      options: {
        title: false,
        legend: false,
        tooltips: false,
        responsive: true,
        lineTension: 0,
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
                // max: 300,
                // min: 0,
                padding: 15,
                // stepSize: 100,
                fontColor: '#a7a7a7',
              },
              gridLines: {
                drawBorder: false,
                color: 'rgba(255,255,255, 0.2)',
                zeroLineColor: 'rgba(255,255,255, 0.2)',
                tickMarkLength: 0,
              },
              stacked: false,
            },
          ],
          xAxes: [
            {
              ticks: {
                padding: 10,
                beginAtZero: false,
                fontColor: '#a7a7a7',
              },
              gridLines: {
                display: false,
                tickMarkLength: 0,
              },
              stacked: false,
            },
          ],
        },
        elements: {
          // point: {
          //   radius: 0,
          //   intersect: false,
          //   hitRadius: 25,
          //   hoverRadius: 4.5,
          // },
          line: {
            borderWidth: 1,
          },
        },
        datalabels: {
          display: true,
          font: {
            style: ' bold',
          },
        },
        // hover: {
        //   mode: 'x',
        //   axis: 'x',
        //   intersect: false,
        //   animationDuration: 300,
        // },
      },
      data: {
        labels: this.chart.chartLabels,
        datasets: [
          {
            data: this.chart.chartData,
            fill: true,
            borderColor: '#4dd4b6',
            backgroundColor: gradientOrange,
          },
        ],
      },
    });
    $('.titleDiv').hide();
  }

  public getFstakes(name) {
    this.eos.eosGetChintai(name).then((e: any) => {
      e.forEach(x => {
        if (x.user == name) {
          this.chart.fstaked += parseFloat(x.quantity.replace(/[^0-9.,]+/, ''));
        }
      });
    });
  }

  public getTokenOjb() {
    this.widget.getToken().subscribe((res: any) => {
      this.chart.tNames.push(...res.data);
    });
  }

  toggleEosUSD() {
    this.chart.total = _.filter(this.chart.total, function(item) {
      return this.total.value / this.eosUsd;
    });
  }

  getBalance(name) {
    this.chart.tokens.forEach(element => {
      this.eos
        .eosGetTokens(element.account, name)
        .then((result: any) => {
          if (
            result.length != 0 &&
            result[0].balance != undefined &&
            result[0].balance != 0
          ) {
            for (let i = 0; i < result.length; i++) {
              this.chart.totalTokens.push(result[i].balance);
              this.chart.sortedTokens = this.chart.totalTokens.sort(
                sortAlph.compare
              );
              this.chart.sortedTokens.reverse();
            }
          }
        })
        .catch((err:any) => console.error(err));        
    });
  }

  getValues() {
    this.chart.newToken = this.chart.sortedTokens.map(parseFloat);

    if (this.chart.sortedTokens.length > 5) {
      this.chart.someArr = this.chart.sortedTokens.map(parseFloat);
      this.chart.otherTokens = this.chart.someArr.slice(
        5,
        this.chart.tokens.length
      );
      this.getSumOfOther(this.chart.otherTokens); // Get Other tokens

      this.chart.someArr.splice(5, 0, this.chart.otherSum);
      this.chart.chartData = this.chart.someArr.slice(0, 6);
    } else {
      this.chart.chartData = this.chart.newToken.slice(
        0,
        this.chart.newToken.length
      );
    }
    this.chart.allTokensValue = this.chart.sortedTokens.slice(
      0,
      this.chart.sortedTokens.length
    );

    let namesArray = this.chart.allTokensValue;
    namesArray.forEach(element => {
      let y = element.replace(/[^a-zA-Z]/g, '');
      this.chart.nameArr.push(y);
      this.chart.chartLabels.push(y);
    });
    if (this.chart.chartLabels.length > 5) {
      this.chart.chartLabels.splice(5, 0, 'Other Tokens');
    }

    this.sumAll(this.chart.newToken);

    this.getSum(this.chart.chartData);
    this.chart.chartData.forEach(e => {
      let x = (e / this.chart.tokenSum) * 100;
      this.chart.numberArray.push(x);
    });

    this.chart.amountData = this.chart.chartData;
    this.chart.chartLabels = this.chart.chartLabels.slice(0, 6);

    this.chart.result = _.zip(
      this.chart.chartLabels,
      this.chart.numberArray,
      this.chart.amountData
    ).map(function(pair) {
      return _.object(['name', 'amount', 'value'], pair);
    });

    this.chart.result = _.filter(this.chart.result, item => {
      return item.value > 0;
    });

    this.chart.amountResult = this.chart.result;
    this.sortAmount();

    this.chart.val = this.chart.result[0].amount;
    this.chart.tokenName = this.chart.result[0].name;

    this.chart.resultCopy = this.chart.result;
    this.showPie();
    this.spinner.hide();
    this.chart.chartStatus = true;
    this.chart.gettingData = false;

    this.chart.allTokensValue.unshift(this.chart.totalValue);
    this.chart.nameArr.unshift('All Tokens');

    this.chart.allTokensValue.forEach(element => {
      this.chart.resTotal.push(parseFloat(element));
    });

    this.chart.total = _.zip(
      this.chart.nameArr,
      this.chart.resTotal,
    ).map(function(pair) {
      return _.object(['name', 'value', 'total', 'isUtil','isRewarded', 'dividend', 'isStaked'], pair);
    });

    this.chart.zeroArray = this.chart.total;

    setTimeout(() => {
      const self = this;
      for (let i = 0; i < this.chart.tokenC.length; i++) {
        this.getUrl(this.chart.tokenC[i].symbol, this.chart.tokenC[i].logo);
      }

      this.getUsdPrice();
      
      this.chart.total = _.map(this.chart.total, function(item) {
        if (item.name == 'TRYBE' && item.value != 0) {
          item['staked'] = self.chart.trybe;
          return item;
        } else if (item.name == 'EOS') {
          item['staked'] = self.chart.eosStaked;
          item['url'] = self.chart.eosUrl;
          return item;
        } else if (item.name == 'HORUS') {
          item['staked'] = self.chart.horus;
          return item;
        } else if (item.name == 'POKER') {
          item['staked'] = self.chart.poker;
          return item;
        } else if (item.name == 'DEOS') {
          item['staked'] = self.chart.deos;
          return item;
        } else if (item.name == 'EDNA') {
          item['staked'] = self.chart.edna;
          return item;
        } else if (item.name == 'KARMA') {
          item['staked'] = self.chart.karma;
          return item;
        } else {
          return item;
        }
      });

      this.chart.total = _.map(this.chart.total, function(item) {
        item['dividend'] = false;
        item['isUtil'] = false;
        item['isStaked'] = false;
        item['isRewarded'] = false;
        if (item.name == 'EOS') {
          item['isInt'] = true;
        } else if (item.name == 'SEED') {
          item['isRewarded'] = true;
        } else {
          item['isInt'] = false;
        }
        return item;
      });

      if (this.chart.total.length > 6) {
        this.chart.eosResult = this.chart.total.slice(1, 6);
        this.chart.usdResult = this.chart.total.slice(1, 6);
      } else {
        let x = this.chart.total.length;
        this.chart.eosResult = this.chart.total.slice(1, x);
        this.chart.usdResult = this.chart.total.slice(1, x);
      }

      for (let y = 0; y < this.chart.total.length; y++) {
        for (let i = 0; i < this.chart.dividend.length; i++) {
          if (this.chart.total[y].name == this.chart.dividend[i]) {
            this.chart.total[y].dividend = true;
          }
        }
        for (let z = 0; z < this.chart.stakedTokens.length; z++) {
          if (this.chart.total[y].name == this.chart.stakedTokens[z]) {
            this.chart.total[y].isStaked = true;
          }
        }
        for (let d = 0; d < this.chart.util.length; d++) {
          if (this.chart.total[y].name == this.chart.util[d]) {
            this.chart.total[y].isUtil = true;
          }
        }
      }
      
      this.chart.total = _.map(this.chart.total, (item) => {
        if(item.name == "DEOS") {
          item.total = parseFloat(item.value);
          return item;
        } else if (item.staked == undefined) {
          item.total = parseFloat(item.value);
          return item;
        } else {  
           item.total = parseFloat(item.value) + parseFloat(item.staked)
           return item;
          }
      })

      this.chart.total = _.map(this.chart.total, function(item) {
        const x = parseFloat(item.price) * parseFloat(item.total);
        self.chart.count += x;
        item['totalPrice'] = x;
        return item;
      });
      this.chart.total[0].totalPrice = this.chart.count;

      let lTotal = self.chart.eosUsd * self.chart.fstaked;
      let uTotal = self.chart.eosUsd * self.chart.ustaked;

      if(self.chart.fstaked != 0) {
        this.chart.total.push({
          name: "Chintai Leased (EOS)", 
          value: self.chart.fstaked, 
          eosVal: 0.0000,
          dividend: false,
          isStaked: false,
          total: self.chart.fstaked,
          price: self.chart.eosUsd,
          totalPrice: lTotal,
          isInt: true,
          url: self.chart.chintaiImg
        })
      }
      if(self.chart.ustaked != 0) {
        this.chart.total.push({ 
          name: "Chintai Staked (EOS)", 
          value: self.chart.ustaked, 
          eosVal: 0.0000,
          dividend: false,
          isStaked: false,
          total: self.chart.ustaked, 
          price: self.chart.eosUsd,
          totalPrice: uTotal,
          isInt: true,
          url: self.chart.chintaiImg
        })
      }

      this.chart.total = _.map(this.chart.total, function(item) {
        let x = parseFloat(item.totalPrice) / parseFloat(self.chart.eosUsd);
        item['eosVal'] = x;
        return item;
      });     

      this.sortTotal();

      this.chart.show = true;
      this.chart.showTable = true;
    }, 5000);
  }

  getEosUnstaked(name) {
    this.eos.eosGetUnstaked().then((e: any) => {
      e.forEach(el => {
        if (el.user == name) {
          this.chart.ustaked = parseFloat(this.chart.ustaked) + parseFloat(el.quantity.replace(/[^0-9.,]+/, ''));
        }
      });
    });
  }

  // getEosStaked(name) {
  //   this.eos.eosGetStaked(name).then((result: any) => {
  //     if (result.rows.length > 0) {
  //       let data;
  //       data = result.rows.find(x => x.from === name);
  //       this.chart.trybe = parseFloat(data.total_staked_trybe);
  //     }
  //   });
  // }

  login() {
    this.auth
      .login()
      .then((obj: any) => {
        this.chart.name = obj.account.name;
      })
      .catch(e => {
        console.log('login error: ', e);
      });
  }

  getUrl(name, url) {
    const self = this;
    return _.find(this.chart.total, function(obj) {
      if (obj.name == name) {
        return (obj['url'] = url);
      }
    });
  }

  getTokenUrl(arr, res) {
    arr.forEach(x => {
      this.getToken(x);
    });
  }

  // Get Tokens and Prices Functions
  getToken(name) {
    return _.find(this.chart.allTkns, function(obj) {
      return obj.name == name;
    });
  }

  getUsdPrice(name?) {
    for (let y = 0; y < this.chart.tNames.length; y++) {
      for (let i = 0; i < this.chart.total.length; i++) {
        if (this.chart.total[i].name == 'EOS') {
          this.chart.total[i].price = this.chart.eosUsd;
        }
        if (this.chart.tNames[y].currency == this.chart.total[i].name) {
          this.chart.total[i].price =
            this.chart.tNames[y].last * this.chart.eosUsd;
        } else if (
          this.chart.total[i].name != 'EOS' &&
          this.chart.total[i].price == undefined
        ) {
          this.chart.total[i].price = 0.0000;
        }
      }
    }
  }

  getPrice(arr, res) {
    arr.forEach(x => {
      let d = this.getToken(x);
      x += d;
      if (d != undefined) {
        res.push(d.quotes.USD.price.toFixed(2));
      }
    });
  }

  eosStaked(name) {
    this.chart.stakedObj.forEach(el => {
      if (el.name == 'EDNA') {
        this.eos
          .eosGetStakedRows(el.account, el.table, el.account)
          .then((x: any) => {
            // loop for accounts in x
            if (x.rows.length != 0) {
              x.rows.forEach(el => {
                if (el.stake_account == name) {
                  this.chart.edna = el.staked.replace(/[^0-9.,]+/, '');
                } else {
                  this.chart.edna = '0.000';
                }
              });
            }
          });
      }
      if (el.name == 'HORUS') {
        this.eos.eosGetStakedRows(el.account, el.table, name).then((e: any) => {
          if (e.rows.length != 0) {
            this.chart.horus = e.rows[0].horus_weight.replace(/[^0-9.,]+/, '');
          }
        });
      }
      if (el.name == 'POKER') {
        this.eos.eosGetStakedRows(el.account, el.table, name).then((e: any) => {
          if (e.rows.length != 0) {
            this.chart.poker = 'N/A';
          }
        });
      }
      if (el.name == 'KARMA') {
        this.eos.eosGetStakedRows(el.account, el.table, name).then((e: any) => {
          if (e.rows.length != 0) {
            this.chart.karma = e.rows[0].weight.replace(/[^0-9.,]+/, '');
          }
        });
      }
      if (el.name == 'DEOS') {
        this.eos.eosGetStakedRows(el.account, el.table, name).then((e: any) => {
          if (e.rows.length != 0) {
            this.chart.deos = e.rows[0].balance.replace(/[^0-9.,]+/, '');
          }
        });
      }
      if (el.name == "TRYBE") {
        this.eos.eosGetStakedRows(el.account, el.table, name).then((e: any) => {
          console.log(e);
          if (e.rows.length != 0) {
            this.chart.trybe = e.rows[0].total_staked_trybe.replace(/[^0-9.,]+/, '');
          }
        })
      }
    });
  }

  // HELPERS FUNCTIONS
  sortTotal() {
    this.chart.total = _.sortBy(this.chart.total, o => o.value);
    if (!this.chart.sortType) {
      this.chart.total.reverse();
      this.chart.sortType = true;
    } else {
      this.chart.sortType = false;
    }
    return this.chart.total;
  }

  sortPrice() {
    this.chart.total = _.sortBy(this.chart.total, o => o.price);
    if (!this.chart.sortPriceType) {
      this.chart.total.reverse();
      this.chart.sortPriceType = true;
    } else {
      this.chart.sortPriceType = false;
    }
    return this.chart.total;
  }

  sortTotalEos() {
    this.chart.total = _.sortBy(this.chart.total, o => o.eosVal);
    if (!this.chart.sortEosType) {
      this.chart.total.reverse();
      this.chart.sortEosType = true;
    } else {
      this.chart.sortEosType = false;
    }
    return this.chart.total;
  }

  sortTotalUSD() {
    this.chart.total = _.sortBy(this.chart.total, o => o.totalPrice);
    if (!this.chart.sortUSDType) {
      this.chart.total.reverse();
      this.chart.sortUSDType = true;
    } else {
      this.chart.sortUSDType = false;
    }
    return this.chart.total;
  }

  getSum(sumArr) {
    sumArr.forEach(element => {
      this.chart.tokenSum += parseFloat(element);
    });
  }

  getSumOfOther(sumArr) {
    sumArr.forEach(element => {
      this.chart.otherSum += parseFloat(element);
    });
  }

  sumAll(sumArr) {
    sumArr.forEach(element => {
      this.chart.totalValue += parseFloat(element);
    });
  }
}