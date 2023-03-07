import { CurrencyAmount  , formatInF, Rounding } from "@uniswap/sdk";

const toFixed = CurrencyAmount.prototype.toFixed

CurrencyAmount.prototype.toFixed = function (decimalPlaces?: number | undefined, format?: formatInF | undefined, rounding?: Rounding | undefined): string {
  const baseNum =  1 / Math.pow(10 , decimalPlaces || 0)
  const num = Number(this.toExact()) 
  if(num > 0 && (num < baseNum) && format) {
    return `<${baseNum}`
  }
  
  return toFixed.call(this, decimalPlaces, format, rounding)
}
