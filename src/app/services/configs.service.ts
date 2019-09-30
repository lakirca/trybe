import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConfigsService {
  public MSIG_CONTRACT = 'eosio.msig';
  // public MSIG_CONTRACT = 'multiplesign';

  public network2 = {
    blockchain: 'eos',
    chainId: 'e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473',
    host: 'jungle2.cryptolions.io',
    port: 80,
    protocol: 'http',
  };

  public network = {
    blockchain: 'eos',
    chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
    host: 'nodes.get-scatter.com',
    port: 443,
    protocol: 'https',
  };

  // public network = {
  //   blockchain: 'eos',
  //   chainId: 'e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473',
  //   host: 'jungle2.cryptolions.io',
  //   port: 443,
  //   protocol: 'https'
  // }

  public network3 = {
    blockchain: 'eos',
    chainId: 'e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473',
    host: 'jungle2.cryptolions.io',
    port: 80,
    protocol: 'http',
  };

  public eosConfig = {
    chainId: null, // 32 byte (64 char) hex string
    keyProvider: [], // WIF string or array of keys..
    httpEndpoint: null,
    expireInSeconds: 300,
    broadcast: true,
    verbose: false, // API activity
    sign: true,
  };

  constructor() {
    this.eosConfig.chainId = this.network.chainId;
    // this.eosConfig.keyProvider = this.network.chainId;
    this.eosConfig.httpEndpoint =
      this.network.protocol +
      '://' +
      this.network.host +
      ':' +
      this.network.port;
  }
}
