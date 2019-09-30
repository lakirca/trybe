import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numbertransform'
})
export class NumberTransformPipe implements PipeTransform {

  transform(input: any, args?: any): any {
    // const suffixes = ['k', 'M', 'B', 'T', 'P', 'E'];

    if (Number.isNaN(input)) {
      return 0;
    }

    if (input < 1000) {
      return parseFloat(input).toFixed(args);
    }

    const m = parseFloat(input).toFixed(args).split(".");

    return m[0].match(/.{1,3}(?=(.{3})*$)/g).join(",") + '.' + m[1];
  }
}
