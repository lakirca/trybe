import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numPipe'
})
export class ThousandPipe implements PipeTransform {

  transform(input: any): any {
    if (Number.isNaN(input)) {
      return 0;
    }

    if (input < 1000) {
      return parseFloat(input).toFixed(2);
    }

    return input > 999 ? (input/1000).toFixed(1) + 'k' : input;

  }

}
