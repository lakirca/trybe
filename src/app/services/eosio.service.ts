import {Injectable} from '@angular/core';
import * as Moment from 'moment';
import * as _ from 'lodash';
import * as ecc from 'eosjs-ecc';
import * as eosjs from 'eosjs';
import * as eosjsApi from 'eosjs-api';
import * as dJSON from 'dirty-json';
import {ConfigsService} from './configs.service';

// import fs = require('fs')

@Injectable({
  providedIn: 'root'
})
export class EosioService {

  private eos: any;
  private eosApi: any;

  constructor (private configs: ConfigsService) {
    this.eos = this.reconfigureEos();
    this.eosApi = eosjsApi(this.configs.eosConfig);
  }

  public reconfigureEos (_privateKey?) {
    const currentEosConfig = this.configs.eosConfig;
    if (_privateKey) currentEosConfig.keyProvider = _privateKey;
    // console.log('currentEosConfig: ', currentEosConfig)
    return eosjs(currentEosConfig);
  }

  public getInfo () {
    const self = this;
    return new Promise(async function (resolve, reject) {
      self.eos.getInfo((error, result) => {
        if (error) return reject(error);
        return resolve(result);
      });
    });
  }

  public eosCreateAccount (_newAccont, _pubkey, _creator) {
    return new Promise(async function (resolve, reject) {
      if (!_newAccont) return reject({error: 'Name of account was\'t set.'});
      if (!_pubkey) return reject({error: 'Public key to new account was\'t set.'});
      if (!_creator) console.log('Name of owner/creator/producer was\'t set.');
      // const currentEos = this.reconfigureEos(constants.OTHER.PRODUCER_PRIVATE_KEY)
      const currentEos = this.eosApi;
      const restx = await currentEos.transaction(async function (tr) {
        try {
          await tr.newaccount({
            creator: _creator ? _creator : 'eosio',
            name: _newAccont,
            owner: _pubkey,
            active: _pubkey
          });

        } catch (e) {
          reject(e);
        }
      })
        .catch(err => reject(err));
      // resolve('complete')
      resolve(restx);
    });
  }

  public eosGetAccount(_name) {
    const self = this
    return new Promise(function (resolve, reject) {
      if (!_name) return reject({error: 'Name of account was\'t set.'});
      self.eos.getAccount(_name)
        .then(account => {
          //  console.log('Get account of eosio: ', account)
          resolve(account);
        })
        .catch(err => reject(err));
    });
  }

  public eosGetStaked(name) {
    const self = this
    let data = {
      "code": "trybenetwork",
      "json": true,
      "scope": name,
      "table": "trybestaked",
    }
    return new Promise(function (resolve, reject) {
      self.eos.getTableRows(data)
        .then(account => {
          // console.log('Get account of eosio: ', account)
          resolve(account);
        })
        .catch(err => reject(err));
    });
  }

  public eosGetAllStaked(name?) {
    const self = this
    let data = {
      "code": 'trybenetwork',
      "json": true,
      "scope": name,
      "table": "trybestaked",
    }
    return new Promise(function (resolve, reject) {
      self.eos.getTableRows(data)
        .then(account => {
          // console.log('Get account of eosio: ', account)
          resolve(account);
        })
        .catch(err => reject(err));
    });
  }

  public eosPushTransaction(name) {
    const self = this
    let data = { "from": name, "to" : "trybepresale", "quantity" : "1.0000 EOS" ,"memo":  "TRYBE PRESALE" }
    return new Promise(function (resolve, reject) {
      self.eos.pushTransaction(data)
        .then(account => {
          // console.log('Get account of eosio: ', account)
          resolve(account);
        })
        .catch(err => reject(err));
    });
  }

  public eosGetLiquidBalance(name) {
    const self = this
    let data
    data = {
      "code": "trybenetwork",
      "json": true,
      "scope": name,
      "table": "accounts",
    }
    return new Promise(function (resolve, reject) {
      self.eos.getTableRows(data)
        .then(account => {
          // console.log('ROWS ', account)
          resolve(account);
        })
        .catch(err => reject(err));
    });
  }

  public eosGetPresaleBalance(name) {
    const self = this
    let data
    data = {
      "code": "trybepresale",
      "json": true,
      "scope": name,
      "table": "accounts",
    }
    return new Promise(function (resolve, reject) {
      self.eos.getTableRows(data)
        .then(account => {
          // console.log('ROWS ', account)
          resolve(account);
        })
        .catch(err => reject(err));
    });
  }


  public eosGetTrybePrice() {
    const self = this
    let data
    data = {
      "code": "trybenetwork",
      "json": true,
      "scope": "trybenetwork",
      "table": "coinprices",
    }
    return new Promise(function (resolve, reject) {
      self.eos.getTableRows(data)
        .then(account => {
          // console.log('ROWS ', account)
          resolve(account);
        })
        .catch(err => reject(err));
    });
  }

  public eosGetTrybeFounders() {
    const self = this
    let data
    data = {
      "code": "trybenetwork",
      "json": true,
      "scope": "trybenetwork",
      "table": "founders",
    }
    return new Promise(function (resolve, reject) {
      self.eos.getTableRows(data)
        .then(account => {
          // console.log('ROWS founders ', account)
          resolve(account);
        })
        .catch(err => reject(err));
    });
  }

  public eosGetTrybeTesters() {
    const self = this
    let data
    data = {
      "code": "trybenetwork",
      "json": true,
      "scope": "trybenetwork",
      "table": "testers",
    }
    return new Promise(function (resolve, reject) {
      self.eos.getTableRows(data)
        .then(account => {
          // console.log('ROWS testers', account)
          resolve(account);
        })
        .catch(err => reject(err));
    });
  }

  public eosGetRows() {
    const self = this
    let data
    data = {
      "code": "trybepresale", 
      "json": true,
      "scope": "trybepresale",
      "table": "trybepresale",
      "limit": -1
    }
    return new Promise(function (resolve, reject) {
      self.eos.getTableRows(data)
        .then(account => {
          // console.log('ROWS ', account)
          resolve(account);
        })
        .catch(err => reject(err));
    });
  }

  public eosGetTokens(token, username) {
    const self = this
    let data
    data = {
      "code": token, 
      "json": true,
      "scope": username, 
      "table": "accounts", 
    }
    return new Promise(function (resolve, reject) {
      self.eos.getTableRows(data)
        .then(account => {
          // console.log('TOKENS ', account.rows)
          resolve(account.rows);
        })
        .catch(err => reject(err));
    });
  }

  public eosGetStakedRows(account, table, username) {
    const self = this
    let data
    data = {
      "code": account, 
      "json": true,
      "scope": username,
      "table": table
    }
    return new Promise(function (resolve, reject) {
      self.eos.getTableRows(data)
        .then(account => {
          // console.log('ROWS ', account)
          resolve(account);
        })
        .catch(err => reject(err));
    });
  }

  public getSta() {
    const self = this
    let data
    data = {
      "code": 'trybenetwork', 
      "json": true,
      "scope": 'gm2diobtgmge',
      "table": 'trybestaked'
    }
    return new Promise(function (resolve, reject) {
      self.eos.getTableRows(data)
        .then(account => {
          console.log('ROWS ', account)
          resolve(account);
        })
        .catch(err => reject(err));
    });
  }


  public eosGetChintai(user?) {
    const self = this
    let data
    data = {
      "json": true,
      "code": "chintailease", 
      "scope": "fstakes", 
      "table": "fstakes", 
      "limit": -1,
      "key_type": "i64",
      "upper_bound": user
    }

    return new Promise(function (resolve, reject) {
      self.eos.getTableRows(data)
        .then(account => {
          // console.log('TOKENS ', account.rows)
          resolve(account.rows);
        })
        .catch(err => reject(err));
    });
  }

  public eosGetUnstaked(user?) {
    const self = this
    let data
    data = {
      "json": true,
      "code": "chintailease", 
      "scope": "ustakes", 
      "table": "ustakes", 
      "limit": -1,
      // "upper_bound": user
    }

    return new Promise(function (resolve, reject) {
      self.eos.getTableRows(data)
        .then(account => {
          // console.log('TOKENS ', account.rows)
          resolve(account.rows);
        })
        .catch(err => reject(err));
    });
  }

  getCode() {
    const self = this;
    return new Promise(function(resolve, reject) {
      self.eos.getCode('gm2diobtgmge').then(c => resolve(c));
    })
  }

  public eosGetPresaleStats() {
    const self = this
    let data
    data = {
      "code": "trybepresale",
      "json": true,
      "scope": "TRYBE",
      "table": "presalestats",
    }
    return new Promise(function (resolve, reject) {
      self.eos.getTableRows(data)
        .then(account => {
          // console.log('ROWS ', account)
          resolve(account);
        })
        .catch(err => reject(err));
    });
  }


  public eosGetRefunds(name) {
    const self = this
    let data
    data = {
      "code": "trybenetwork",
      "json": true,
      "scope": name,
      "table": "refunds",
    }
    return new Promise(function (resolve, reject) {
      self.eos.getTableRows(data)
        .then(account => {
          // console.log('ROWS ', account)
          resolve(account);
        })
        .catch(err => reject(err));
    });
  }

  public eosGetBalance(_code, _account, _symbol) {
    const self = this
    return new Promise(async function (resolve, reject) {
      try {
        const currentEos = self.reconfigureEos();
        const balance = await currentEos.getCurrencyBalance(_code, _account, _symbol);
        // console.log('Currency Balance', balance);
        return resolve(balance);
      } catch (e) {
        reject(e);
      }
    });
  }

  public eosGenerateKeysPair (_seed) {
    return new Promise(function (resolve, reject) {
      if (_seed) {
        const privateKey = ecc.seedPrivate(_seed);
        // console.log('sed:\t', _seed) // wif
        // console.log('Private Key:\t', privateKey) // wif
        // console.log('Public Key:\t', ecc.privateToPublic(privateKey)) // EOSkey...
        resolve({privateKey: privateKey, publicKey: ecc.privateToPublic(privateKey)});
      } else {
        ecc.randomKey()
          .then(privateKey => {
            // console.log('Private Key:\t', privateKey) // wif
            // console.log('Public Key:\t', ecc.privateToPublic(privateKey)) // EOSkey...
            resolve({privateKey: privateKey, publicKey: ecc.privateToPublic(privateKey)});
          })
          .catch(err => reject(err));
      }
    });
  }

  eosBuyRam (_payer, _eos, _receiver, _amount) {
    return new Promise(async function (resolve, reject) {

      console.log('_payer : ', _payer, ' , _keys : ', null, ' , _receiver : ', _receiver, ' , _amount : ', _amount)

      const currentEos = _eos;
      const restx = await currentEos.transaction(async function (tr) {
        // logger.print("tx obj: ", tr)
        try {
          await tr.buyrambytes({
            payer: _payer,
            receiver: _receiver,
            bytes: _amount,
          })
        } catch (e) {
          reject(e)
        }
      })
        .catch(err => reject(err))
      // resolve('complete')
      resolve(restx)
    })
  }

  getRows (_eos?, _json?, _scope?, _code?, _table?, _limit?, _table_key?, _lower_bound?) {
    return new Promise(function (resolve, reject) {
      const currentEos = _eos
      currentEos.getTableRows({
        'json': _json,
        'scope': _scope,
        'code': _code,
        'table': _table,
        'limit': _limit
        // "table_key": _table_key,
        // "lower_bound": _lower_bound,
      }).then(result => {
        // const filteredRows = result.rows.filter((grade) => grade.schoolfk === school_id)

        if (result.rows.length < 10) console.log('filteredRows : ', result)
        else console.log('result.rows.length : ', result.rows.length)

        resolve(result)
      }).catch((error) => {
        reject(error)
      })
    })
  }

  eosDelegate (_payer, _eos, _receiver, _stake_net, _stake_cpu) {
    return new Promise(async function (resolve, reject) {

      console.log('_payer : ', _payer, ' , _keys : ', null,
        ' , _receiver : ', _receiver, ' , _stake_net : ', _stake_net, ' , _stake_cpu : ', _stake_cpu)

      const currentEos = _eos
      const restx = await currentEos.transaction(async function (tr) {
        // logger.print("tx obj: ", tr)
        try {
          tr.delegatebw({
            from: _payer,
            receiver: _receiver,
            stake_net_quantity: _stake_net, //'1.0000 EOS',
            stake_cpu_quantity: _stake_cpu, //'1.0000 EOS',
            transfer: 0
          })
        } catch (e) {
          reject(e)
        }
      })
        .catch(err => reject(err))
      // resolve('complete')
      resolve(restx)
    })
  }

  public eosAction (_actionName, _key, _code, _authAccount, _actionParams, _broadcast = true, _sign = true, _comingEos) {
    const self = this
    return new Promise(function (resolve, reject) {
      try {
        const currentEos = _comingEos ? _comingEos : self.reconfigureEos(_key);
        currentEos.contract(_code).then(contract => {
          console.log('# _actionName: ', _actionName, ' , _code: ', _code);
          console.log('# _authAccount: ', _authAccount);
          console.log('# _actionParams: ', _actionParams, ' , broadcast : ', _broadcast, ' , _sign : ', _sign, ' | ');

          contract[_actionName](..._actionParams, {
            broadcast: _broadcast, sign: _sign, authorization: _authAccount
          })
            .then(action => {
              console.log('$$$$$ action: ', action);
              return resolve(action);
            }).catch(err => {
              const errorRes = err.message ? err.message : err;
              console.log('# action error: ', errorRes);
              return reject(self.fixerr(err))
            });
        }).catch(e => {
          return reject(self.fixerr(e));
        });
      } catch (e) {
        return reject(self.fixerr(e));
      }
    });
  }

  public msigPropose (
    _actionName,
    _command,
    _eos,
    _code,
    _authAccount,
    _listOfConfidants,
    _proposalName,
    _actionParams,
    _expiration?
  ) {
    const self = this;
    return new Promise(function (resolve, reject) {

      try {
        const currentEos = _eos; // this.reconfigureEos(_keys)
        console.log('MSIG_CONTRACT : ', self.configs.MSIG_CONTRACT);
        // console.log('_keys : ', _keys);
        currentEos.contract(self.configs.MSIG_CONTRACT).then(msig => {
          console.log('# _command: ', _command, ' , _proposalName : ', _proposalName);
          console.log('# _listOfConfidants: ', _listOfConfidants);
          console.log('# _code: ', _code);

          currentEos.contract(_code).then(async token => {
            console.log('# _actionName: ', _actionName, ' , _code: ', _code);
            console.log('# _actionParams: ', _actionParams);

            token[_actionName](..._actionParams, {
              broadcast: false, sign: false, authorization: _authAccount
            })
              .then(async action => {
                action.transaction.transaction.max_net_usage_words = 0;
                console.log('expiration: ', Moment(_expiration));
                if (_expiration) action.transaction.transaction.expiration = String(Moment(_expiration));
                console.log('action.transaction.transaction: ', action.transaction.transaction);
                const condidates = await _.map(_listOfConfidants, name => {
                  return {'actor': name, 'permission': 'active'};
                })
                try {
                  msig[_command](
                    _authAccount,
                    _proposalName,
                    condidates,
                    action.transaction.transaction,
                    {authorization: [{'actor': _authAccount, 'permission': 'active'}]/*_authAccount + '@active'*/}
                  )
                    .then(resmsig => {
                      console.log('msig : ', resmsig);
                      return resolve(resmsig);
                    })
                    .catch(e => {
                      console.log('msig error: ', self.fixerr(e));
                      return reject(self.fixerr(e));
                    });
                } catch (e) {
                  console.log(_command + ' error: ', self.fixerr(e));
                  return reject(self.fixerr(e));
                }
              })
              .catch(e => {
                console.log('# action error: ', self.fixerr(e));
                return reject(self.fixerr(e));
              });
          }).catch(e => {
            return reject(self.fixerr(e));
          });
        }).catch(e => {
          return reject(self.fixerr(e));
        });
      } catch (e) {
        return reject(self.fixerr(e));
      }
    });
  }

  public eosMultisignature (_command, _eos, _authAccount, _proposalName, _actionParams) {
    const self = this;
    return new Promise(function (resolve, reject) {
      try {
        const currentEos = _eos;  // this.reconfigureEos(_keys);
        console.log('MSIG_CONTRACT : ', self.configs.MSIG_CONTRACT);
        // console.log('_keys : ', _keys);
        currentEos.contract(self.configs.MSIG_CONTRACT).then(msig => {
          console.log('# _command: ', _command, ' , _proposalName : ', _proposalName);

          try {
            msig[_command](
              _authAccount,
              _proposalName,
              _actionParams,
              {
                authorization: [
                  {'actor': _authAccount, 'permission': 'active'},
                  _command === 'cancel'
                    ? _command === 'exec'
                    ?
                    [
                      {'actor': _actionParams, 'permission': 'active'},
                      {'actor': _authAccount, 'permission': 'active'}
                    ]
                    : {'actor': _actionParams, 'permission': 'active'}
                    : _actionParams
                ]
              }
            )
              .then(resmsig => {
                console.log('msig : ', resmsig);
                return resolve(resmsig);
              })
              .catch(e => {
                console.log('msig error: ', e);
                return reject(self.fixerr(e));
              });
          } catch (e) {
            console.log(_command + ' error: ', e);
            return reject(self.fixerr(e));
          }
        })
          .catch(e => {
            const errorRes = e.message ? e.message : e;
            console.log('# action error: ', errorRes);
            return reject(self.fixerr(e));
          });
      } catch (e) {
        return reject(self.fixerr(e));
      }
    });
  }

  public setpriv (_auth, _keys, _accountName, _priv) {
    return new Promise(async (resolve, reject) => {
      await this.eos.transaction({
        actions: [
          {
            account: _accountName,
            name: 'setpriv',
            authorization: [{actor: _accountName, permission: 'active'}],
            data: {
              account: _accountName,
              is_priv: Number(_priv)
            }
          }
        ]
      }).then(tx => {
        resolve(tx);
      }).catch(e => {
        reject(this.fixerr(e));
      });
    });
  }

  public fixerr (e) {
    try {
      return typeof e === 'string' ? dJSON.parse(e) : e;
    } catch (err) {
      console.log('fixerr is fold: ', err);
      return e;
    }

  }
}
