import { Decimal } from 'decimal.js'
import moment from 'moment'
import { CONTRACT_ERROR_CODE } from '../constants/config'
// rate
export const rate = (value: string | number | undefined, decimal?: number, isNull?: boolean) => {
  if (value || value === 0) {
    const val = Number(value) * 100
    const de = decimal || 2
    const baseNum = 1 / Math.pow(10, de || 0)
    if (Number(val) > 0 && Number(val) < baseNum) {
      return `< ${baseNum.toFixed(de)}%`
    }
    return `${val
      .toFixed(de)
      .toString()
      .replace(/(?:\.0*|(\.\d+?)0+)$/, '$1')}%`
  }
  return isNull ? '' : '--'
}

// decomal
export const numeral = (context: string | number | undefined, formatString = 2) => {
  // let value = context;
  if (context) {
    let star = ''
    if (`${Number(context)}`.indexOf('e+') > -1) {
      const bigValue = `${context}`
      if (bigValue.indexOf('.') > -1) {
        const int = bigValue.split('.')[0]
        let dec = bigValue.split('.')[1]
        dec = dec.slice(0, formatString)
        return Number(dec) === 0 ? `${int}` : `${int}.${dec}`
      }
      return context.toString()
    }
    let value = Number(context)
    if (value < 0) {
      value = Math.abs(value)
      star = '-'
    }
    const bitLength = formatString > 8 ? 8 : formatString
    let zoom = 1
    for (let i = 0; i < bitLength; i += 1) {
      zoom *= 10
    }
    value = new Decimal(value).mul(new Decimal(zoom)).toNumber()
    value = Math.floor(value) / zoom
    const resVal = value
    const val = resVal.toString()
    if (val.indexOf('e-') > -1) {
      const val2 = value.toFixed(bitLength)
      return `${star}0${String(val2 + 1).substring(1)}`
    }
    return star + resVal.toString()
  }
  if (Number(context) === 0) {
    return 0
  }
  return 0
}

// separate
export const separate = (value: number | string, formatString?: number) => {
  const baseNum = 1 / Math.pow(10, formatString || 0)
  if (Number(value) > 0 && Number(value) < baseNum) {
    return `< ${baseNum.toFixed(formatString)}`
  }
  let decimalPart = ''
  if (formatString) {
    decimalPart = '.'.padEnd(formatString + 1, '0')
  }
  if (value && !Number.isNaN(value)) {
    const val = String(value)
    let integerPart = val
    const integerLen = val.length
    if (val.indexOf('.') >= 0) {
      ;[integerPart] = val.split('.')
      decimalPart = `.${val.split('.')[1]}`
      if (formatString) {
        decimalPart = decimalPart.padEnd(formatString + 1, '0')
      }
    }

    if (integerLen <= 3) {
      return `${integerPart}${decimalPart}`
    }
    return `${integerPart.replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')}${decimalPart}`
  }
  return `0${decimalPart}`
}

// amountFormat
export const amountFormat = (value: number | string | undefined, formatString?: number) => {
  const baseNum = 1 / Math.pow(10, formatString || 0)
  if (Number(value) > 0 && Number(value) < baseNum) {
    return `< ${baseNum.toFixed(formatString)}`
  }
  const result = separate(numeral(value, formatString), formatString)
  return result
}

// date
export const formatDate = (value: any, formatString = 'YYYY-MM-DD HH:mm:ss') => {
  if (value) {
    return moment.unix(value).format(formatString)
  }
  return '--'
}

// date utc
export const formatUTCDate = (value: any, formatString = 'YYYY-MM-DD HH:mm:ss') => {
  if (value) {
    return moment
      .unix(value)
      .utc()
      .format(formatString)
  }
  return '--'
}

// numFormat
export const numFormat = (num: number | string, digits: number, isTvl?: boolean) => {
  if (String(num).indexOf('<') > -1) {
    return num
  }
  num = Number(String(num).replace(/\$\s?|(,*)/g, ''))
  if (isTvl && num <= 100000) {
    return amountFormat(num, digits)
  }
  let si = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'K' },
    { value: 1e4, symbol: 'W' },
    { value: 1e6, symbol: 'M' },
    { value: 1e10, symbol: 'B' }
  ]
  if (isTvl) {
    si = si.filter((e: any) => e.symbol !== 'W')
  }
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/
  let i
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break
    }
  }
  return (
    new Decimal(num)
      .div(new Decimal(si[i].value))
      .toNumber()
      .toFixed(digits)
      .replace(rx, '$1') + si[i].symbol
  )
}

// 地址 脱敏
export const addressDes = (value: string) => {
  if (value) {
    return value.replace(/^(.{6})(?:\w+)(.{4})$/, '$1....$2')
  }
  return value
}

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thurs', 'Fri', 'Sat']
export function getDateForLastOccurence(strDay: 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thurs' | 'Fri' | 'Sat') {
  const date = new Date(
    moment()
      .utc()
      .format('YYYY-MM-DD 00:00:00')
  )
  const index = weekDays.indexOf(strDay)
  let difference = date.getDay() - index
  if (difference < 0) {
    difference = -7 - difference
  } else {
    difference *= -1
  }
  date.setDate(date.getDate() + difference)
  return date
}

export function formatMessage(message: any) {
  if (!message) return undefined
  const code = message?.error?.message?.split(':')[1]?.trim()
  if (!code) return undefined
  return CONTRACT_ERROR_CODE[code] ?? undefined
}

export default {
  rate,
  numeral,
  separate,
  amountFormat,
  formatDate,
  numFormat,
  addressDes,
  formatUTCDate
}
