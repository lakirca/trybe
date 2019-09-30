import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'accexist',
  pure: false
})
export class AccountExistPipe implements PipeTransform {

  transform(items: any[], accounts: any[]): any {

    return accounts
      ? items.filter(item => {
        return accounts[item] ? true : false;
      })
      : items;
  }
}
