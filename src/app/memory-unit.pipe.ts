import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'memoryUnit',
  standalone: true
})
export class MemoryUnitPipe implements PipeTransform {

  transform(value: number, ...args: unknown[]): string {
    if (value == 1) 
      return value + ' bajt';
    else if (0 < value && value < 5) 
      return value + ' bajty';
    else if (value < 1024)
      return value + ' bajtów';
    else if (value < Math.pow(1024, 2)) 
      return Math.round(value / 1024) + ' KB';
    else if (value < Math.pow(1024, 3)) 
      return Math.round(value / Math.pow(1024, 2)) + ' MB';

    return value + '';
  }

}
