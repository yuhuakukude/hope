import { amountFormat } from "./format"

describe("amountFormat test", () => {
  it('', () => {
    expect(amountFormat(100)).toBe('100.00')
    expect(amountFormat(100.1)).toBe('100.10')
    expect(amountFormat(100.10)).toBe('100.10')
    expect(amountFormat(100.01)).toBe('100.01')
    expect(amountFormat(100.11)).toBe('100.11')
    expect(amountFormat(100.000)).toBe('100.00')
    expect(amountFormat(100.001)).toBe('100.00')
  })
})