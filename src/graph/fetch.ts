import { postQuery } from '../utils/graph'
import { SUBGRAPH } from '../constants'
import {
  QUERY_ALL_PAIR,
  QUERY_ALL_STAKING,
  QUERY_PAIR_LIST,
  QUERY_TOKENS_PRICE,
  QUERY_USER_LIQUIDITY,
  QUERY_USER_STAKING
} from './query'
import { ChainId, ETHER, Token, TokenAmount } from '@uniswap/sdk'
import { tryParseAmount } from '../state/swap/hooks'
import { isAddress } from '../utils'
import { Field } from '../state/liquidity/actions'

export interface BasePair {
  pairAddress: string
  stakingAddress: string | undefined
  tokens: [Token, Token]
  stakedAmount: TokenAmount | undefined
  tvl: TokenAmount | undefined
  feeRate: number
  feeUSD: TokenAmount | undefined

  baseApr?: number
  maxApr?: number
  feeApr?: number
  ltApr?: number
  ltAmountPerDay?: number
  rewardRate?: number
  last7AvgVolume?: number
  dayVolume?: number
  maxBoost?: number
}

export async function fetchPairs(
  chainId: ChainId,
  pageSize: number,
  currentPage: number,
  searchType: Field,
  searchValue: string,
  account = ''
): Promise<{ pairs: BasePair[]; total: number }> {
  try {
    let pairList = []
    if (searchType === Field.ALL) {
      const allPair = await postQuery(SUBGRAPH, QUERY_ALL_PAIR())
      pairList = allPair.data.pairs
    }
    if (searchType === Field.USER_LIQUIDITY) {
      const userLiquidity = await postQuery(SUBGRAPH, QUERY_USER_LIQUIDITY(account))
      const userStaking = await postQuery(SUBGRAPH, QUERY_USER_STAKING(account))
      pairList = userLiquidity.data.liquidityPositions
        .map((item: any) => item.pair)
        .concat(userStaking.data.stakedPoolPositions.map((item: any) => item.pool.pair))
      const pairMap = new Map()
      pairList = pairList.filter((item: any) => !pairMap.has(item.id) && pairMap.set(item.id, 1))
    }
    if (searchType === Field.USER_STAKING) {
      const userStaking = await postQuery(SUBGRAPH, QUERY_USER_STAKING(account))
      pairList = userStaking.data.stakedPoolPositions.map((item: any) => item.pool.pair)
    }

    pairList = pairList.filter((pair: any) => {
      if (!searchValue) return pair
      const lowSearchValue = searchValue.toLowerCase()
      const pairAddress = pair.id.toLowerCase()
      const token0Address = pair.token0.id.toLowerCase()
      const token1Address = pair.token1.id.toLowerCase()
      const token0Name = pair.token0.name.toLowerCase()
      const token1Name = pair.token1.name.toLowerCase()
      const token0Symbol = pair.token0.symbol.toLowerCase()
      const token1Symbol = pair.token1.symbol.toLowerCase()

      return isAddress(searchValue)
        ? pairAddress === lowSearchValue || token0Address === lowSearchValue || token1Address === lowSearchValue
        : token0Name.toLowerCase().indexOf(lowSearchValue) !== -1 ||
            token1Name.toLowerCase().indexOf(lowSearchValue) !== -1 ||
            token0Symbol.toLowerCase().indexOf(lowSearchValue) !== -1 ||
            token1Symbol.toLowerCase().indexOf(lowSearchValue) !== -1
    })
    const pairsResult = await postQuery(SUBGRAPH, QUERY_PAIR_LIST(), {
      pairs: pairList.map((item: any) => item.id).slice((currentPage - 1) * pageSize, pageSize * currentPage)
    })
    const allStaking = await postQuery(SUBGRAPH, QUERY_ALL_STAKING())
    const stakings = allStaking.data.poolGauges
    const pairs = pairsResult.data.pairs
      ? pairsResult.data.pairs.map((item: any) => {
          return {
            feeRate: item.feeRate,
            feeUSD: tryParseAmount(item.feeUSD, ETHER),
            tvl: tryParseAmount(item.reserveUSD, ETHER),
            pairAddress: item.id,
            stakingAddress: stakings.find((staking: any) => {
              return staking.pair.id === item.id
            })?.id,
            tokens: [
              new Token(chainId, item.token0.id, Number(item.token0.decimals), item.token0.symbol) as Token,
              new Token(chainId, item.token1.id, Number(item.token1.decimals), item.token1.symbol) as Token
            ]
          }
        })
      : []
    return {
      pairs,
      total: pairList.length ?? 0
    }
  } catch (error) {
    return {
      pairs: [],
      total: 0
    }
  }
}

export async function fetchTokensPrice(addresses: string[]): Promise<any> {
  try {
    const response = await postQuery(SUBGRAPH, QUERY_TOKENS_PRICE(), {
      tokens: addresses.map(address => address.toLowerCase())
    })
    const tokens = response.data.tokens
    const hopePrice = response.data.bundles[0].hopePrice
    return tokens.map((item: any) => {
      return {
        address: item.id,
        price: (item.derivedHOPE * hopePrice).toFixed(16)
      }
    })
  } catch (error) {
    return []
  }
}
