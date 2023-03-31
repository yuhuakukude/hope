import { Currency, ETHER, Token } from '@uniswap/sdk'

export function currencyId(currency: Currency): string {
  if (currency === ETHER) return 'ETH'
  if (currency instanceof Token) return currency.address
  throw new Error('invalid currency')
}

export function tokenId(weth: Token, token: Token): string {
  // if (weth.address === token.address) return 'ETH' eth disable reset
  if (weth.address === token.address) return token.address
  if (token instanceof Token) return token.address
  throw new Error('invalid currency')
}

export function tokenAddress(weth: Token, token: Currency | undefined): string {
  if (token === ETHER) return weth.address
  if (token instanceof Token) return token.address
  return ''
}

export function tokenSymbol(weth: Token, token: Token | undefined): string {
  if (!token) return ''
  if (weth.address === token?.address) return 'ETH'
  if (token instanceof Token) return token.symbol ?? ''
  throw new Error('invalid currency')
}
