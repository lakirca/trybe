import { ElementRef, ViewChild, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

declare var $: any;

@Injectable({
  providedIn: 'root'
})


export class ChartService {
  public hover:boolean = false;
  public typeCounter:any = 0;
  public staked:any;
  public resultCopy:any = [];
  public eosStaked:any;
  public deletedName:any = '';
  public deletedValue:any = '';
  public deletedData:any = [];

  public amountData:any = [];
  public showTypeAmount:any = true;
  public amountResult:any = [];
  public amountObj:any = [];
  public delAmount:any = [];
  public delAmountVal:any = '';
  public delAmountData:any = '';
  public isDeleted:boolean = false;

  public showTypeUsd:any = false;
  public usdResult:any = [];
  public usdObj:any = [];
  public delUsd:any = [];
  public delUsdVal:any = '';
  public delUsdData:any = '';
  public isUsdDeleted:boolean = false;

  public showTypeEos:any = false;
  public eosResult:any = [];
  public EosObj:any = [];
  public delEos:any = [];
  public delEosVal:any = '';
  public delEosData:any = '';
  public isEosDeleted:boolean = false;

  public zero:any = 'Hide Zero';
  public zeroValue:any = [];
  public counter:any = 0;
  public count:any = 0;
  public showTable:boolean = false;
  public show:boolean = false;
  public showSearch: boolean = true;
  public tokenName:any = '';  
  public val:any = '';
  public result:any = [];
  public numberArray:any[] = [];
  public tokenSum: any = 0;
  public otherSum: any = 0;
  public gettingData:boolean = true;
  public name: any;
  public searchText : string;
  public chartLabels:any = [];
  public chartData:number[] = [];
  public chartStatus:boolean = false;
  public all:any = 'Hide Tokens';
  public intSearch:any = 0;
  public tokenC:any = [];
  public usdVal:any  = [];
  public eosUsd:any;
  public deletedTokens: any = [];
  public allTokens:any = [];
  public tokens:any[] =[]
  public sliced:any = [];
  public topNames = [];
  public otherTokens = [];
  public tokensData = [];
  public totalTokens = [];
  public account:any = {};
  public totalValue:number = 0;
  public total:any = {};
  public nameArr:any[] = [];
  public allTkns:any = [];
  public price:any = [];
  public someArr:any[] = []
  public x:any = [];
  public allTokensValue:any = 0;
  public sortedTokens:any = [];
  public zeroArray:any = [];
  public tokensVal:any = 0;
  public newToken: any = [];
  public resTotal:any = [];
  public tNames:any = [];
  public eosValues:any = [];
  public url:any = [];
  public placeholder:string = '../../../../assets/img/All_tokens_icon.jpg';
  public eosUrl:string = '../../../../assets/img/eos.png';
  public pipe: any=  "%";
  // public options:any = {
  //   animation: {
  //     easing: 'linear'  
  //   },
  //   title: false,
  //   legend: false,
  //   tooltips: false,
  //   cutoutPercentage: 49,
  //   responsive: true,
  //   showTooltips: true,
  //   labels: true
  // } 
  public accountName:any = '';
  public chartType:any = 'doughnut'
  public lineChartColors;
  public chartPie:any;
  public chartLine:any;
  public chartTypePie:boolean = true;
  public dividend:any = ['DEOS', 'KARMA', 'HORUS', 'EDNA', 'POKER', 'CRASH', 'CHIP', 'MEV', 'BET']
  public divImg:any = '../../../../assets/img/dividend.png';
  public stakedTokens:any = ['DEOS', 'KARMA', 'HORUS', 'EDNA', 'DICE', 'POKER', 'CRASH', 'CHIP', 'BET', 'MEV', 'TRYBE']
  public stakedImg:any = '../../../../assets/img/banking.png';
  public intTokens:any = ['DEOS', 'KARMA', 'HORUS', 'EDNA', 'DICE', 'POKER', 'CRASH', 'CHIP', 'BET', 'MEV']
  public intImg:any = '../../../../assets/img/interesticon.png';
  public chintaiImg:any = '../../../../assets/img/chinati.png';
  public rewardedImg:any = '../../../../assets/img/reward.png';
  public reward:any = ['SEED'];
  public rewardImg:any = '../../../../assets/img/reward.png';
  public util:any = ['EOS', 'TRYBE', 'ZKS'];
  public utilImg:any = '../../../../assets/img/utility.png';
  public stakedObj:any = [
    {
      name: 'DEOS',
      account: 'thedeosgames',
      table: 'daccounts'
    },
    {
      name: 'KARMA',
      account: 'therealkarma',
      table: 'power'
    },
    {
      name: 'TRYBE',
      account: 'trybenetwork',
      table: 'trybestaked'
    },
    {
      name: 'HORUS',
      account: 'horustokenio',
      table: 'stakedhorus'
    },
    {
      name: 'EDNA',
      account: 'ednazztokens',
      table: 'stakes',
      scope: 'ednazztokens'
    },
    {
      name: 'POKER',
      account: 'pokerstaking',
      table: 'stakes'
    }
  ]

  public trybe:any = '';
  public edna:any = '';
  public karma:any = '';
  public horus:any = '';
  public poker:any = '';
  public deos:any ='';
  public isAsk:boolean = false;
  public sortType:boolean = false;
  public sortEosType:boolean = false;
  public sortPriceType:boolean = false;
  public sortUSDType:boolean = false;
  public fstaked:any = 0.0000;
  public ustaked:any = 0.0000;

  public tokensList:any = []

  public ram:any = 0;
  public cpu:any = 0;
  public bw:any = 0;

  public showTokens:boolean = false;

  constructor(private http: HttpClient) { 
  }

  // Get All Tokens
  public getJSON(): Observable<any> {
    return this.http.get("https://raw.githubusercontent.com/eoscafe/eos-airdrops/master/tokens.json")
  }

  public exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }
  private saveAsExcelFile(buffer: any, fileName: string): void {
     const data: Blob = new Blob([buffer], {type: EXCEL_TYPE});
     FileSaver.saveAs(data, fileName + '_export_' + new  Date().getTime() + EXCEL_EXTENSION);
  }

}
