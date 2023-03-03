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
import { PAIR_SEARCH } from '../hooks/usePairInfo'
import { isAddress } from '../utils'

export interface BasePair {
  pairAddress: string
  stakingAddress: string | undefined
  tokens: [Token, Token]
  stakedAmount: TokenAmount | undefined
  tvl: TokenAmount | undefined
  feeRate: number
  feeUSD: TokenAmount | undefined
}

export async function fetchPairs(
  chainId: ChainId,
  pageSize: number,
  currentPage: number,
  searchType: PAIR_SEARCH,
  searchValue: string,
  account = ''
): Promise<{ pairs: BasePair[]; total: number }> {
  try {
    let pairList = []
    console.log('searchType', searchType)
    if (searchType === PAIR_SEARCH.ALL) {
      const allPair = await postQuery(SUBGRAPH, QUERY_ALL_PAIR())
      console.log('allPair', allPair)
      pairList = allPair.data.pairs
    }
    if (searchType === PAIR_SEARCH.USER_LIQUIDITY) {
      const userLiquidity = await postQuery(SUBGRAPH, QUERY_USER_LIQUIDITY(account))
      console.log('userLiquidity', userLiquidity)
      pairList = userLiquidity.data.liquidityPositions.map((item: any) => item.pair)
    }
    if (searchType === PAIR_SEARCH.USER_STAKE) {
      const userStaking = await postQuery(SUBGRAPH, QUERY_USER_STAKING(account))
      console.log('userStaking', userStaking)
      pairList = userStaking.data.stakedPoolPositions.map((item: any) => item.pool.pair)
    }
    console.log('pairList1', pairList)

    pairList = pairList.filter((pair: any) => {
      console.log('pairList', searchValue, pair)
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
        : token0Name.indexOf(searchValue) !== -1 ||
            token1Name.indexOf(searchValue) !== -1 ||
            token0Symbol.indexOf(searchValue) !== -1 ||
            token1Symbol.indexOf(searchValue) !== -1
    })
    console.log('pairs array', pairList, currentPage - 1, pageSize)
    const pairsResult = await postQuery(SUBGRAPH, QUERY_PAIR_LIST(), {
      pairs: pairList.map((item: any) => item.id).slice((currentPage - 1) * pageSize, pageSize * currentPage)
    })
    console.log('pairsResult', pairsResult)
    const allStaking = await postQuery(SUBGRAPH, QUERY_ALL_STAKING())
    const stakings = allStaking.data.poolGombocs
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
              new Token(chainId, item.token0.id, item.token0.decimals, item.token0.symbol) as Token,
              new Token(chainId, item.token1.id, item.token1.decimals, item.token1.symbol) as Token
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
