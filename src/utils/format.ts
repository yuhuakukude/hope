// 率
export const rate = (value: string | number, decimal?: 2, isNull?: boolean) => {
  if (value || value === 0) {
    if (decimal) {
      const val = Number(value) * 100
      return `${val
        .toFixed(decimal)
        .toString()
        .replace(/(?:\.0*|(\.\d+?)0+)$/, '$1')}%`
    }
  }
  return isNull ? '' : '-'
}

export default {
  rate
}
