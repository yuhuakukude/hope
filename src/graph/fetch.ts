import { postQuery } from '../utils/graph'
import { SUBGRAPH } from '../constants'
import { QUERY_PAIR_BASE, QUERY_TOKENS_PRICE } from './query'
import { ChainId, Token } from '@uniswap/sdk'

export async function fetchPairs(chainId: ChainId): Promise<any> {
  try {
    const response = await postQuery(SUBGRAPH, QUERY_PAIR_BASE())
    const pairs = response.data.pairs
    const stakings = response.data.poolGombocs
    return pairs.map((item: any) => {
      return {
        pairAddress: item.id,
        stakingAddress: stakings.find((staking: any) => {
          return staking.pair.id === item.id
        })?.id,
        tokens: [
          new Token(chainId, item.token0.id, item.token0.decimals, item.token0.symbol) as Token,
          new Token(chainId, item.token1.id, item.token1.decimals, item.token1.symbol) as Token
        ]
      }
    })
  } catch (error) {
    return []
  }
}

export async function fetchTokensPrice(addresses: string[]): Promise<any> {
  try {
    const response = await postQuery(SUBGRAPH, QUERY_TOKENS_PRICE(), {
      tokens: addresses.map(address => address.toLowerCase())
    })
    const tokens = response.data.tokens
    const ethPrice = response.data.bundles[0].ethPrice
    return tokens.map((item: any) => {
      return {
        address: item.id,
        price: (item.derivedETH * ethPrice).toFixed(16)
      }
    })
  } catch (error) {
    return []
  }
}
