import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EosWidgetService {


  constructor(private http: HttpClient) {
  }

  // Get All Tokens
  public getJSON(): Observable<any> {
    return this.http.get("https://api.coinmarketcap.com/v2/ticker/1765/")
  }

  public GetIp(): Observable<any> {
    return this.http.get("https://get.geojs.io/v1/ip.json")
  }


  public getCountry(ip): Observable<any> {
    return this.http.get("https://get.geojs.io/v1/ip/country/" + ip + ".json")
  }
  
  public getData(): Observable<any> {
    return this.http.get('https://api.coinmarketcap.com/v2/ticker/');
  }

  getWpInfo(name) {
    return this.http.get("https://trybe.one/wp-json/wp/v2/users/?eos="+ name)
  }

  public getToken(): Observable<any> {
    return this.http.get('https://api.newdex.io/v1/ticker/all');
  }

  getPairs(): Observable<any> {
    return this.http.get('https://api.chaince.com/market/pairs');
  }

  getAllTokens(): Observable<any> {
    return this.http.get('https://api.newdex.io/v1/ticker/all');
  }

  getOffChain(id) {
    return this.http.get("https://trybe.one/wp-json/wallet/v1/?id="+ id)
  }

  getPrice() {
    return this.http.get("https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD,EUR")
  }

  getChaince() {
    let url = "api.chaince.com/tickers/trybeeos";
    return this.http.get("https://cors-anywhere.herokuapp.com/" + url)
  }

  getNewdex(): Observable<any>  {
    return this.http.get("https://api.newdex.io/v1/ticker/all")
  }

  getMongDb() {
    const port = 3000;
      return this.http.get(  'https://' + window.location.host + ":8443" + "/api/users/")
  }
  
  getMongPresale() {
    const port = 3000;
    return this.http.get(  'https://' + window.location.host + ":8443" + "/api/presale/presale/")
    // return this.http.get(  "http://localhost:3000/api/presale/presale/")
}

  getMongStaked() {
    const port = 3000;
    return this.http.get(  'https://' + window.location.host + ":8443" + "/api/presale/staked/")
    // return this.http.get(  "http://localhost:3000/api/presale/staked/")
  }

  getMongLiquid() {
    const port = 3000;
    return this.http.get(  'https://' + window.location.host + ":8443" + "/api/presale/liquid/")
    // return this.http.get(  "http://localhost:3000/api/presale/liquid/")
  }

  getMongOffChain() {
    const port = 3000;
    return this.http.get(  'https://' + window.location.host + ":8443" + "/api/presale/offchain/")
    // return this.http.get(  "http://localhost:3000/api/presale/offchain/")
  }
}

