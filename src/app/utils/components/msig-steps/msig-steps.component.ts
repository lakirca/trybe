import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ConfigsService} from '../../../services/configs.service';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatChipInputEvent, MatDialog} from '@angular/material';
import {EosioService} from '../../../services/eosio.service';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {AuthService} from '../../../services/auth.service';
import * as _ from 'lodash';
import * as Moment from 'moment';
import {allertDialog} from '../allert-dialog/allert-dialog.utils';

@Component({
  selector: 'app-msig-steps',
  templateUrl: './msig-steps.component.html',
  styleUrls: ['./msig-steps.component.css']
})
export class MsigStepsComponent implements OnInit {
  step = 0;
  visible = true;
  selectable = true;
  removable = false;
  removableParams = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  params: Param[] = [];
  confidants: Param[] = [];
  formPropose: FormGroup;
  formApprove: FormGroup;
  formUnapprove: FormGroup;
  formExec: FormGroup;
  formCancel: FormGroup;
  dateOfExpiration: string;

  @Output() end = new EventEmitter<any>();

  @Input() code: string;
  @Input() action: string;
  @Input() proposalName: string;
  @Input() disable: boolean;
  @Input() foundersAsConfidants: string[];

  constructor (private configs: ConfigsService,
               private blockchain: EosioService,
               private fb: FormBuilder,
               public dialog: MatDialog,
               private auth: AuthService) {
    // this.params.push({mane: "test"})
    const date = Moment()
    this.dateOfExpiration = String(date.add(3, 'day'));
    console.log("dateOfExpiration : ", this.dateOfExpiration)
  }

  ngOnInit () {
    // this.params.push({name: 'from'});
    // this.params.push({name: 'to'});
    // this.params.push({name: 'quantity'});
    // this.params.push({name: 'memo'});
    //
    // this.confidants.push({name: 'username'});

    // tests parameters

    if(!this.code || this.code === "eosio.token") {
      this.params.push({name: 'alexandr1122'});
      this.params.push({name: 'mytrybetests'});
      this.params.push({name: '1.5510 EOS'});
      this.params.push({name: 'some comment to transfer'});
    }

    this.removable = !this.disable;

    this.foundersAsConfidants.forEach(name => {
      this.confidants.push({name: name});
    })

    this.formPropose = this.fb.group({
      code: new FormControl({ value: this.code ? this.code : 'eosio.token', disabled: this.disable }),
      action: new FormControl({ value: this.action ? this.action : 'transfer', disabled: this.disable }),
      proposalName: new FormControl({ value: this.proposalName ? this.proposalName : 'test', disabled: this.disable }),
      expirationDate: new FormControl(''),
      expirationTime: new FormControl('')
    });

    this.formApprove = this.fb.group({
      proposalName: new FormControl({ value: this.proposalName ? this.proposalName : 'test', disabled: this.disable }),
    });

    this.formUnapprove = this.fb.group({
      proposalName: new FormControl({ value: this.proposalName ? this.proposalName : 'test', disabled: this.disable }),
    });

    this.formExec = this.fb.group({
      proposalName: new FormControl({ value: this.proposalName ? this.proposalName : 'test', disabled: this.disable }),
      executer: new FormControl('')
    });

    this.formCancel = this.fb.group({
      proposalName: new FormControl({ value: this.proposalName ? this.proposalName : 'test', disabled: this.disable }),
      canceler: new FormControl('')
    });
  }

  setStep (index: number) {
    this.step = index;
  }

  nextStep () {
    this.step++;
  }

  finish () {
    this.step++;
    this.end.emit({})
  }

  prevStep () {
    this.step--;
  }

  addParam (event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our params
    if ((value || '').trim()) {
      this.params.push({name: value.trim()});
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  removeParam (param: Param): void {
    const index = this.params.indexOf(param);

    if (index >= 0) {
      this.params.splice(index, 1);
    }
  }

  addConfidant (event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our params
    if ((value || '').trim()) {
      this.confidants.push({name: value.trim()});
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  removeConfidant (param: Param): void {
    const index = this.confidants.indexOf(param);

    if (index >= 0) {
      this.confidants.splice(index, 1);
    }
  }

  propose () {
    console.log("this.formPropose.value.code : ", this.formPropose.getRawValue())

    const data:any = this.formPropose.getRawValue()

    this.blockchain.msigPropose(
      data.action,
      'propose',
      this.auth.eosConnectionData.eos,
      data.code,
      this.auth.eosConnectionData.account.name,
      _.map(this.confidants, data => {return data.name}),
      data.proposalName,
      _.map(this.params, data => {return data.name}),
      this.dateOfExpiration
    ).then(propose => {
      this.openAllertDialog("Propose completed!", JSON.stringify(propose))
    }).catch(e => {
      console.log("Propose err: ", e)
      this.openAllertDialog("Propose err: ", JSON.stringify(e))
    });
  }

  multisig (commnad, account?) {
    let data:any;
    const params = account
      ? account === 'executer'
        ? this.formExec.value.executer
        : this.formCancel.value.canceler
      : {
        "actor": this.auth.eosConnectionData.account.name,
        "permission": "active"
      }
    switch (commnad) {
      case "approve":
        data = this.formApprove.getRawValue();
        return this.blockchain.eosMultisignature(
          'approve',
          this.auth.eosConnectionData.eos,
          this.auth.eosConnectionData.account.name,
          data.proposalName,
          params
        )
          .then(msig => this.openAllertDialog("Approve completed!", JSON.stringify(msig)))
          .catch(e => this.openAllertDialog("Approve err: ", JSON.stringify(e)))
      case "unapprove":
        data = this.formUnapprove.getRawValue();
        return this.blockchain.eosMultisignature(
          'unapprove',
          this.auth.eosConnectionData.eos,
          this.auth.eosConnectionData.account.name,
          data.proposalName,
          params
        )
          .then(msig => this.openAllertDialog("Unapprove completed!", JSON.stringify(msig)))
          .catch(e => this.openAllertDialog("Unapprove err: ", JSON.stringify(e)))
      case "exec":
        data = this.formExec.getRawValue();
        return this.blockchain.eosMultisignature(
          'exec',
          this.auth.eosConnectionData.eos,
          this.auth.eosConnectionData.account.name,
          data.proposalName,
          params
        )
          .then(msig => this.openAllertDialog("Exec completed!", JSON.stringify(msig)))
          .catch(e => this.openAllertDialog("Exec err: ", JSON.stringify(e)))
      case "cancel":
        data = this.formCancel.getRawValue();
        return this.blockchain.eosMultisignature(
          'cancel',
          this.auth.eosConnectionData.eos,
          this.auth.eosConnectionData.account.name,
          data.proposalName,
          params
        )
          .then(msig => this.openAllertDialog("Cancel completed!", JSON.stringify(msig)))
          .catch(e => this.openAllertDialog("Eancel err: ", JSON.stringify(e)))
      default:
        return this.openAllertDialog("Actions selector error", "This command does not exist")
    }
  }

  onSubmit () {

  }

  public openAllertDialog(header, text): void {
    const dialogRef = this.dialog.open(allertDialog, {
      height: 'auto',
      width: '80%',
      data: {name: header, text: text}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });

  }

}

export interface Param {
  name: string;
}
