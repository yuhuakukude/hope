import { postQuery } from '../utils/graph'
import { SUBGRAPH } from '../constants'
import { QUERY_PAIR_BASE } from './query'
import { ChainId, Token } from '@uniswap/sdk'

export async function fetchPairs(chainId: ChainId): Promise<any> {
  try {
    const response = await postQuery(SUBGRAPH, QUERY_PAIR_BASE())
    const pairs = response.data.pairs
    const stakings = response.data.poolGombocs
    console.log('response', response)
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
