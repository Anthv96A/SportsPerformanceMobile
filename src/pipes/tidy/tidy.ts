import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
  name: 'tidy',
})
export class TidyPipe implements PipeTransform {

  transform(value: string) {

    if(value !== null){
        value = value.replace(/([A-Z])/g, ' $1').replace(/^./, (value) =>{ return value.toUpperCase()})
    }

    return value;
  }
}
