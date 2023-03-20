import { ChainId, CurrencyAmount, FACTORY_ADDRESS, JSBI, Pair, Token, TokenAmount, WETH } from '@uniswap/sdk'
import { useMemo } from 'react'
import { BLOCK_SUBGRAPH, DAI, HOPE, SUBGRAPH, UNI, USDC, USDT, WBTC } from '../../constants'
import { STAKING_REWARDS_INTERFACE } from '../../constants/abis/staking-rewards'
import { useActiveWeb3React } from '../../hooks'
import { useMultipleContractSingleData } from '../multicall/hooks'
import { tryParseAmount } from '../swap/hooks'
import { postQuery } from '../../utils/graph'
import GaugeApi from '../../api/gauge.api'
import dayjs from 'dayjs'

export const STAKING_GENESIS = 1600387200

export const REWARDS_DURATION_DAYS = 60

// TODO add staking rewards addresses here
export const STAKING_REWARDS_INFO: {
  [chainId in ChainId]?: {
    tokens: [Token, Token]
    stakingRewardAddress: string
  }[]
} = {
  [ChainId.MAINNET]: [
    {
      tokens: [WETH[ChainId.MAINNET], DAI],
      stakingRewardAddress: '0xa1484C3aa22a66C62b77E0AE78E15258bd0cB711'
    },
    {
      tokens: [WETH[ChainId.MAINNET], USDC[ChainId.MAINNET]],
      stakingRewardAddress: '0x7FBa4B8Dc5E7616e59622806932DBea72537A56b'
    },
    {
      tokens: [WETH[ChainId.MAINNET], USDT[ChainId.MAINNET]],
      stakingRewardAddress: '0x6C3e4cb2E96B01F4b866965A91ed4437839A121a'
    },
    {
      tokens: [WETH[ChainId.MAINNET], WBTC],
      stakingRewardAddress: '0xCA35e32e7926b96A9988f61d510E038108d8068e'
    }
  ],
  [ChainId.SEPOLIA]: [
    {
      tokens: [HOPE[ChainId.SEPOLIA], USDT[ChainId.SEPOLIA]],
      stakingRewardAddress: '0x4C190d74706FB64E3865808Eefd5Cbb1d6B3a9c1'
    }
  ]
}

export interface StakingInfo {
  // the address of the reward contract
  stakingRewardAddress: string
  // the tokens involved in this pair
  tokens: [Token, Token]
  // the amount of token currently staked, or undefined if no account
  stakedAmount: TokenAmount
  // the amount of reward token earned by the active account, or undefined if no account
  earnedAmount: TokenAmount
  // the total amount of token staked in the contract
  totalStakedAmount: TokenAmount
  // the amount of token distributed per second to all LPs, constant
  totalRewardRate: TokenAmount
  // the current amount of token distributed to the active account per second.
  // equivalent to percent of total supply * reward rate
  rewardRate: TokenAmount
  // when the period ends
  periodFinish: Date | undefined
  // if pool is active
  active: boolean
  // calculates a hypothetical amount of token distributed to the active account per second.
  getHypotheticalRewardRate: (
    stakedAmount: TokenAmount,
    totalStakedAmount: TokenAmount,
    totalRewardRate: TokenAmount
  ) => TokenAmount
}

// gets the staking info from the network for the active chain id
export function useStakingInfo(pairToFilterBy?: Pair | null): StakingInfo[] {
  const { chainId, account } = useActiveWeb3React()

  // detect if staking is ended
  //const currentBlockTimestamp = useCurrentBlockTimestamp()

  const info = useMemo(
    () =>
      chainId
        ? STAKING_REWARDS_INFO[chainId]?.filter(stakingRewardInfo =>
            pairToFilterBy === undefined
              ? true
              : pairToFilterBy === null
              ? false
              : pairToFilterBy.involvesToken(stakingRewardInfo.tokens[0]) &&
                pairToFilterBy.involvesToken(stakingRewardInfo.tokens[1])
          ) ?? []
        : [],
    [chainId, pairToFilterBy]
  )

  const uni = chainId ? UNI[chainId] : undefined

  const rewardsAddresses = useMemo(() => info.map(({ stakingRewardAddress }) => stakingRewardAddress), [info])

  const accountArg = useMemo(() => [account ?? undefined], [account])

  // get all the info from the staking rewards contracts
  const balances = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'lpBalanceOf', accountArg)
  const earnedAmounts = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'integrateFraction',
    accountArg
  )

  const totalSupplies = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'lpTotalSupply')

  //const rewardDataList = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'rewardData')

  // // tokens per second, constants
  // const rewardRates = useMultipleContractSingleData(
  //   rewardsAddresses,
  //   STAKING_REWARDS_INTERFACE,
  //   'rewardRate',
  //   undefined,
  //   NEVER_RELOAD
  // )
  // const periodFinishes = useMultipleContractSingleData(
  //   rewardsAddresses,
  //   STAKING_REWARDS_INTERFACE,
  //   'periodFinish',
  //   undefined,
  //   NEVER_RELOAD
  // )

  return useMemo(() => {
    if (!chainId || !uni) return []

    return rewardsAddresses.reduce<StakingInfo[]>((memo, rewardsAddress, index) => {
      // these two are dependent on account
      const balanceState = balances[index]
      const earnedAmountState = earnedAmounts[index]

      // these get fetched regardless of account
      const totalSupplyState = totalSupplies[index]
      //const rewardRateState = rewardRates[index]
      //const rewardDataState = rewardDataList[index]

      if (
        // these may be undefined if not logged in
        !balanceState?.loading &&
        !earnedAmountState?.loading
        // always need these
      ) {
        if (balanceState?.error || earnedAmountState?.error) {
          console.error('Failed to load staking rewards info')
          return memo
        }

        // get the LP token
        const tokens = info[index].tokens
        const dummyPair = new Pair(new TokenAmount(tokens[0], '0'), new TokenAmount(tokens[1], '0'))

        // check for account, if no account set to 0

        const stakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(balanceState?.result?.[0] ?? 0))
        const totalStakedAmount = new TokenAmount(
          dummyPair.liquidityToken,
          JSBI.BigInt(totalSupplyState.result?.[0] ?? 0)
        )
        //const totalRewardRate = new TokenAmount(uni, JSBI.BigInt(rewardDataState.result?.rate))

        const getHypotheticalRewardRate = (
          stakedAmount: TokenAmount,
          totalStakedAmount: TokenAmount,
          totalRewardRate: TokenAmount
        ): TokenAmount => {
          return new TokenAmount(
            uni,
            JSBI.greaterThan(totalStakedAmount.raw, JSBI.BigInt(0))
              ? JSBI.divide(JSBI.multiply(totalRewardRate.raw, stakedAmount.raw), totalStakedAmount.raw)
              : JSBI.BigInt(0)
          )
        }

        // const individualRewardRate = getHypotheticalRewardRate(stakedAmount, totalStakedAmount, totalRewardRate)

        //const periodFinishSeconds = rewardDataState.result?.periodFinish?.toNumber()
        //const periodFinishMs = periodFinishSeconds * 1000

        // compare period end timestamp vs current block timestamp (in seconds)
        // const active =
        //   periodFinishSeconds && currentBlockTimestamp ? periodFinishSeconds > currentBlockTimestamp.toNumber() : true

        memo.push({
          stakingRewardAddress: rewardsAddress,
          tokens: info[index].tokens,
          periodFinish: undefined,
          earnedAmount: new TokenAmount(uni, JSBI.BigInt(earnedAmountState?.result?.[0] ?? 0)),
          rewardRate: new TokenAmount(uni, JSBI.BigInt(earnedAmountState?.result?.[0] ?? 0)),
          totalRewardRate: new TokenAmount(uni, JSBI.BigInt(earnedAmountState?.result?.[0] ?? 0)),
          stakedAmount: stakedAmount,
          totalStakedAmount,
          getHypotheticalRewardRate,
          active: false
        })
      }
      return memo
    }, [])
  }, [balances, chainId, earnedAmounts, info, rewardsAddresses, totalSupplies, uni])
}

export function useTotalUniEarned(): TokenAmount | undefined {
  const { chainId } = useActiveWeb3React()
  const uni = chainId ? UNI[chainId] : undefined
  const stakingInfos = useStakingInfo()

  return useMemo(() => {
    if (!uni) return undefined
    return (
      stakingInfos?.reduce(
        (accumulator, stakingInfo) => accumulator.add(stakingInfo.earnedAmount),
        new TokenAmount(uni, '0')
      ) ?? new TokenAmount(uni, '0')
    )
  }, [stakingInfos, uni])
}

// based on typed value
export function useDerivedStakeInfo(
  typedValue: string,
  stakingToken: Token | undefined,
  userLiquidityUnstaked: TokenAmount | undefined
): {
  parsedAmount?: CurrencyAmount
  error?: string
} {
  const { account } = useActiveWeb3React()

  const parsedInput: CurrencyAmount | undefined = tryParseAmount(typedValue, stakingToken)

  const parsedAmount =
    parsedInput && userLiquidityUnstaked && JSBI.lessThanOrEqual(parsedInput.raw, userLiquidityUnstaked.raw)
      ? parsedInput
      : undefined

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }
  if (!typedValue) {
    error = 'Enter Amount'
  }
  if (!parsedAmount) {
    error = error ?? 'Insufficient Liquidity'
  }

  return {
    parsedAmount,
    error
  }
}

// based on typed value
export function useDerivedUnstakeInfo(
  typedValue: string,
  stakingAmount: TokenAmount
): {
  parsedAmount?: CurrencyAmount
  error?: string
} {
  const { account } = useActiveWeb3React()

  const parsedInput: CurrencyAmount | undefined = tryParseAmount(typedValue, stakingAmount.token)

  const parsedAmount = parsedInput && JSBI.lessThanOrEqual(parsedInput.raw, stakingAmount.raw) ? parsedInput : undefined

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }
  if (!parsedAmount) {
    error = error ?? 'Enter an amount'
  }

  return {
    parsedAmount,
    error
  }
}

export interface StakeInfo {
  id: string
  totalStakedBalance: string
  pair: {
    id: boolean
    reserveUSD: string
    volumeUSD: string
    reserve0: string
    reserve1: string
    volumeToken0: string
    volumeToken1: string
    totalSupply: string
    token0: {
      decimals: string
      id: string
      symbol: string
    }
    token1: {
      decimals: string
      id: string
      symbol: string
    }
  }
}

export interface PairInfo {
  id: string
  reserveUSD: string
  volumeUSD: string
  reserve0: string
  reserve1: string
  volumeToken0: string
  volumeToken1: string
  token0: {
    decimals: string
    id: string
    symbol: string
  }
  token1: {
    decimals: string
    id: string
    symbol: string
  }
}

export interface PoolInfo {
  token0Price?: string
  token1Price?: string
  // the address of the reward contract
  stakingRewardAddress: string
  // the tokens involved in this pair
  tokens: Token[]

  lpToken: Token

  stakingToken: Token | undefined

  totalLiquidity: TokenAmount

  pair: Pair

  volumeAmount: TokenAmount

  token0Amount: TokenAmount

  token1Amount: TokenAmount

  volume0Amount: TokenAmount

  volume1Amount: TokenAmount

  totalSupply?: TokenAmount

  id: string
  baseApr?: string | undefined
  feeApr?: string | undefined
  ltAmountPerDay?: string | undefined
  ltApr?: string | undefined
  maxApr?: string | undefined
  rewardRate?: string | undefined
  searchString?: string | undefined

  // the amount of token currently staked, or undefined if no account
  //stakedAmount: TokenAmount
  // the amount of reward token earned by the active account, or undefined if no account
  //earnedAmount: TokenAmount
  // the total amount of token staked in the contract
  totalStakedAmount: TokenAmount
  // the amount of token distributed per second to all LPs, constant
  //totalRewardRate: TokenAmount
  // the current amount of token distributed to the active account per second.
  // equivalent to percent of total supply * reward rate
  //rewardRate: TokenAmount
  // when the period ends
  //periodFinish: Date | undefined
  // if pool is active
  //active: boolean
  // calculates a hypothetical amount of token distributed to the active account per second.
}

export interface PairDetail extends PoolInfo {
  feeRate: number
  tvl: number
  createAt: number
  txCount: number
  token0Value: number
  token1Value: number
}

export interface PairMore {
  tvlChangeUSD: number
  volumeChangeUSD: number
  weeklyVolumeChange: number
  totalVolume: number

  oneDayTVLUSD: number
  oneWeekTVLUSD: number
  oneDayVolumeUSD: number
  oneWeekVolume: number
}

export async function fetchTotalAmount(): Promise<any> {
  const query = `{  
    gaugeFactories{    
      totalValueLockedUSD
    }
  }
  `
  try {
    const response = await postQuery(SUBGRAPH, query)
    const tInfo = response.data
    return tInfo
  } catch (error) {
    return ''
  }
}

export async function fetchStakeList(
  chainId: any,
  account: string,
  sort: 'asc' | 'desc',
  isMyVote: boolean
): Promise<PoolInfo[]> {
  const query = `{
    poolGauges(first: 500, orderDirection: ${sort}) {
    id
    totalStakedBalance
    pair{
      id
      totalSupply
      reserveUSD
      volumeUSD
      reserve0
      reserve1
      volumeToken0
      volumeToken1
      token0{
        id
        symbol
        decimals
      }
      token1{
        id
        symbol
        decimals
      }
    }
  }
}`
  const isMyVoteQuery = `{
    stakedPoolPositions(first: 500, orderDirection: ${sort}, ${
    isMyVote ? `where: {user_: {id: "${account.toLocaleLowerCase()}"}, stakedPoolBalance_gt: "0"}` : ''
  }) {
      pool{
        id
        totalStakedBalance
        pair{
          id
          totalSupply
          reserveUSD
          volumeUSD
          reserve0
          reserve1
          volumeToken0
          volumeToken1
          token0{
            id
            symbol
            decimals
          }
          token1{
            id
            symbol
            decimals
          }
        }
      }
    }
  }`

  try {
    const response = await postQuery(SUBGRAPH, isMyVote ? isMyVoteQuery : query)
    const pools = isMyVote
      ? response.data.stakedPoolPositions.map((e: any) => ({ ...e.pool }))
      : response.data.poolGauges
    const poolInfos = pools.map((pool: StakeInfo) => {
      const stakingRewardAddress = pool.id
      const token0 = new Token(chainId, pool.pair.token0.id, Number(pool.pair.token0.decimals), pool.pair.token0.symbol)
      const token1 = new Token(chainId, pool.pair.token1.id, Number(pool.pair.token1.decimals), pool.pair.token1.symbol)
      const tokens = [token0, token1]
      const token0Amount = tryParseAmount(pool.pair.reserve0, tokens[0])
      const token1Amount = tryParseAmount(pool.pair.reserve1, tokens[1])
      const volume0Amount = tryParseAmount(pool.pair.volumeToken0, tokens[0])
      const volume1Amount = tryParseAmount(pool.pair.volumeToken1, tokens[1])
      const dummyPair = new Pair(
        token0Amount ? (token0Amount as TokenAmount) : new TokenAmount(tokens[0], '0'),
        token1Amount ? (token1Amount as TokenAmount) : new TokenAmount(tokens[1], '0')
      )
      const totalStakedAmount = tryParseAmount(pool.totalStakedBalance, dummyPair.liquidityToken)
      const stakingToken = new Token(11155111, pool.id, 18, '')
      return {
        searchString: `${
          pool.pair.id
        }${pool.pair.token0.symbol.toLocaleLowerCase()}${pool.pair.token1.symbol.toLocaleLowerCase()}`,
        stakingRewardAddress,
        id: pool.pair.id,
        tokens,
        pair: dummyPair,
        lpToken: dummyPair.liquidityToken,
        token0Amount,
        token1Amount,
        volume0Amount,
        volume1Amount,
        totalStakedAmount,
        stakingToken,
        totalLiquidity: tryParseAmount(pool.pair.reserveUSD, dummyPair.liquidityToken),
        volumeAmount: tryParseAmount(pool.pair.volumeUSD, dummyPair.liquidityToken),
        totalSupply: tryParseAmount(pool.pair.totalSupply, dummyPair.liquidityToken)
      }
    }, [])
    return poolInfos
  } catch (error) {
    return []
  }
}

export async function fetchStakingPool(stakingAddress: string, chainId: any): Promise<PoolInfo | undefined> {
  const query = `{
    poolGauges(where: {id:"${stakingAddress}"}) {
    id
    totalStakedBalance
    pair{
      id
      reserveUSD
      volumeUSD
      reserve0
      reserve1
      volumeToken0
      volumeToken1
      token0{
        id
        symbol
        decimals
      }
      token1{
        id
        symbol
        decimals
      }
    }
  }
}`
  try {
    const response = await postQuery(SUBGRAPH, query)
    const pool = response.data.poolGauges[0]
    const token0 = new Token(chainId, pool.pair.token0.id, Number(pool.pair.token0.decimals), pool.pair.token0.symbol)
    const token1 = new Token(chainId, pool.pair.token1.id, Number(pool.pair.token1.decimals), pool.pair.token1.symbol)
    const tokens = [token0, token1]
    const token0Amount = tryParseAmount(pool.pair.reserve0, tokens[0]) as TokenAmount
    const token1Amount = tryParseAmount(pool.pair.reserve1, tokens[1]) as TokenAmount
    const volume0Amount = tryParseAmount(pool.pair.volumeToken0, tokens[0]) as TokenAmount
    const volume1Amount = tryParseAmount(pool.pair.volumeToken1, tokens[1]) as TokenAmount
    const dummyPair = new Pair(
      token0Amount ? (token0Amount as TokenAmount) : new TokenAmount(tokens[0], '0'),
      token1Amount ? (token1Amount as TokenAmount) : new TokenAmount(tokens[1], '0')
    )
    const totalStakedAmount = tryParseAmount(pool.totalStakedBalance, dummyPair.liquidityToken) as TokenAmount
    const stakingToken = new Token(11155111, stakingAddress, 18, '')
    return {
      id: pool.id,
      stakingRewardAddress: stakingAddress,
      pair: dummyPair,
      tokens,
      lpToken: dummyPair.liquidityToken,
      token0Amount,
      token1Amount,
      volume0Amount,
      volume1Amount,
      totalStakedAmount,
      stakingToken,
      totalLiquidity: tryParseAmount(pool.pair.reserveUSD, dummyPair.liquidityToken) as TokenAmount,
      volumeAmount: tryParseAmount(pool.pair.volumeUSD, dummyPair.liquidityToken) as TokenAmount
    }
  } catch (error) {
    return undefined
  }
}

export const GET_BLOCKS = (timestamps: number[]) => {
  let queryString = 'query blocks {'
  queryString += timestamps.map(timestamp => {
    return `t${timestamp}:blocks(first: 1, orderBy: timestamp, orderDirection: desc, where: { timestamp_gt: ${timestamp}, timestamp_lt: ${timestamp +
      600} }) {
      number
      __typename
    }`
  })
  queryString += '}'
  return queryString
}

export async function getBlocksFromTimestamps(timestamps: number[]) {
  if (timestamps?.length === 0) {
    return []
  }

  const fetchedData = await postQuery(BLOCK_SUBGRAPH, GET_BLOCKS(timestamps))
  const blocks = Object.keys(fetchedData?.data)
    .filter(block => {
      return fetchedData?.data[block].length > 0
    })
    .map(block => {
      return { timestamp: block.split('t')[1], number: fetchedData?.data[block][0]['number'] }
    })
  return blocks
}

export const get2DayPercentChange = (valueNow: string, value24HoursAgo: string, value48HoursAgo: string) => {
  // get volume info for both 24 hour periods
  const currentChange = parseFloat(valueNow) - parseFloat(value24HoursAgo)
  const previousChange = parseFloat(value24HoursAgo) - parseFloat(value48HoursAgo)
  const adjustedPercentChange =
    (parseFloat((currentChange - previousChange).toString()) / parseFloat(previousChange.toString())) * 100

  if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
    return [currentChange, 0]
  }
  return [currentChange, adjustedPercentChange]
}

function GLOBAL_QUERY(block?: number[]) {
  return `{
      lightswapFactories(
       ${block ? `block: { number: ${block}}` : ``} 
       where: { id: "${FACTORY_ADDRESS}" }) {
        id
        totalVolumeUSD
        totalVolumeETH
        untrackedVolumeUSD
        totalLiquidityUSD
        totalLiquidityETH
        txCount
        pairCount
      }
    }`
}

function PAIR_QUERY({ block, stakingAddress }: { block?: number[]; stakingAddress: string }) {
  return `{
    pairs(${block ? `block: { number: ${block}}` : ``}, where: {id:"${stakingAddress}"}) {
      id
      reserve0
      reserve1
      reserveUSD
      volumeToken0
      volumeToken1
      volumeUSD
      token0Price
      token1Price
      txCount
      totalSupply
      createdAtTimestamp
      feeRate
      token0 {
        id
        symbol
        name
        decimals
        __typename
      }
      token1 {
        id
        symbol
        name
        decimals
        __typename
      }
      __typename
    }
  }`
}

function PAIR_LIST_QUERY(account: string, sort: 'asc' | 'desc', orderBy: string, block?: number[]) {
  return `{
    pairs(${block ? `block: { number: ${block}}` : ``},first: 500, orderBy: ${orderBy}, orderDirection: ${sort}) {
      id
      reserve0
      reserve1
      reserveUSD
      volumeToken0
      volumeToken1
      volumeUSD
      volumeToken0
      volumeToken1
      token0Price
      token1Price
      token0 {
        id
        symbol
        name
        decimals
        __typename
      }
      token1 {
        id
        symbol
        name
        decimals
        __typename
      }
      __typename
    }
  }`
}

function PAIR_TIME_INFO_QUERY(block?: number[]) {
  return `query pairs($pairs: [Bytes]!){
    pairs(where: {id_in: $pairs} ${block ? `,block: { number: ${block}}` : ``}) {
      id
      volumeUSD
    }
  }`
}

export interface GraphPairInfo {
  address: string
  oneDayTVLUSD: number
  tvlChangeUSD: number
  oneDayVolumeUSD: number
  volumeChangeUSD: number
  oneWeekVolume: number
  weeklyVolumeChange: number
  totalVolume: number
  totalSupply: number
  token0: Token
  token1: Token
  volume0: number
  volume1: number
  reserve0: number
  reserve1: number
  baseApr?: string | undefined
  feeApr?: string | undefined
  ltAmountPerDay?: string | undefined
  ltApr?: string | undefined
  maxApr?: string | undefined
  rewardRate?: string | undefined
  searchString?: string | undefined
}

export interface TimeInfo {
  pairAddress: string
  dayVolume: number
  dayVolumeChange: number
}

export async function fetchPairsList(
  chainId: any,
  account: string,
  sort: 'asc' | 'desc',
  orderBy: string
): Promise<GraphPairInfo[]> {
  try {
    const utcCurrentTime = dayjs()
    const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix()
    const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix()
    const utcOneWeekBack = utcCurrentTime.subtract(1, 'week').unix()
    const utcTwoWeeksBack = utcCurrentTime.subtract(2, 'week').unix()
    const [oneDayBlock, twoDayBlock, oneWeekBlock, twoWeekBlock] = await getBlocksFromTimestamps([
      utcOneDayBack,
      utcTwoDaysBack,
      utcOneWeekBack,
      utcTwoWeeksBack
    ])
    const curRes = await postQuery(SUBGRAPH, PAIR_LIST_QUERY(account, sort, orderBy))
    const d1Res = await postQuery(SUBGRAPH, PAIR_LIST_QUERY(account, sort, orderBy, oneDayBlock.number))
    const d2Res = await postQuery(SUBGRAPH, PAIR_LIST_QUERY(account, sort, orderBy, twoDayBlock.number))

    const w1Res = await postQuery(SUBGRAPH, PAIR_LIST_QUERY(account, sort, orderBy, oneWeekBlock.number))

    const w2Res = await postQuery(SUBGRAPH, PAIR_LIST_QUERY(account, sort, orderBy, twoWeekBlock?.number))
    const curPairs = curRes?.data.pairs
    const d1Pairs = d1Res?.data.pairs
    const d2Pairs = d2Res?.data.pairs
    const w1Pairs = w1Res?.data.pairs
    const w2Pairs = w2Res?.data.pairs
    return curPairs.map((pair: any) => {
      const d1Pair = d1Pairs.find((d1pair: any) => {
        return d1pair.id === pair.id
      })
      const d2Pair = d2Pairs.find((d2pair: any) => {
        return d2pair.id === pair.id
      })
      const w1Pair = w1Pairs.find((w1pair: any) => {
        return w1pair.id === pair.id
      })
      const w2Pair = w2Pairs.find((w2pair: any) => {
        return w2pair.id === pair.id
      })
      const [oneDayTVLUSD, tvlChangeUSD] = get2DayPercentChange(
        pair?.reserveUSD,
        d1Pair?.reserveUSD,
        d2Pair?.reserveUSD
      )
      const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
        pair?.volumeUSD,
        d1Pair?.volumeUSD,
        d2Pair?.volumeUSD
      )

      const [oneWeekVolume, weeklyVolumeChange] = get2DayPercentChange(
        pair.totalVolumeUSD,
        w1Pair?.volumeUSD,
        w2Pair?.volumeUSD
      )
      return {
        searchString: `${pair.id}${pair.token0.symbol.toLocaleLowerCase()}${pair.token1.symbol.toLocaleLowerCase()}`,
        address: pair.id,
        oneDayTVLUSD: Number(oneDayTVLUSD),
        tvlChangeUSD: Number(tvlChangeUSD),
        oneDayVolumeUSD:
          oneDayVolumeUSD && oneDayVolumeUSD.toString() !== '0' ? Number(oneDayVolumeUSD) : Number(pair.reserveUSD),
        volumeChangeUSD: Number(volumeChangeUSD),
        oneWeekVolume: Number(oneWeekVolume),
        weeklyVolumeChange: Number(weeklyVolumeChange),
        totalVolume: Number(pair.reserveUSD),
        token0: new Token(chainId, pair.token0.id, Number(pair.token0.decimals), pair.token0.symbol),
        token1: new Token(chainId, pair.token1.id, Number(pair.token1.decimals), pair.token1.symbol),
        volume0: Number(pair.volumeToken0),
        volume1: Number(pair.volumeToken1),
        reserve0: Number(pair.reserve0),
        reserve1: Number(pair.reserve1)
      }
    })
  } catch (error) {
    console.error(`error${error}`)
    return []
  }
}

export async function fetchPairPool(stakingAddress: string, chainId: any): Promise<PairDetail | undefined> {
  try {
    const res = await postQuery(SUBGRAPH, PAIR_QUERY({ stakingAddress }))
    const pair = res?.data.pairs[0]

    const gaugeAddress = await GaugeApi.getGaugeAddress({ pairAddress: pair.id })
    const token0 = new Token(chainId, pair.token0.id, Number(pair.token0.decimals), pair.token0.symbol)
    const token1 = new Token(chainId, pair.token1.id, Number(pair.token1.decimals), pair.token1.symbol)
    const tokens = [token0, token1]
    const token0Amount = tryParseAmount(pair.reserve0, tokens[0]) as TokenAmount
    const token1Amount = tryParseAmount(pair.reserve1, tokens[1]) as TokenAmount
    const volume0Amount = tryParseAmount(pair.volumeToken0, tokens[0]) as TokenAmount
    const volume1Amount = tryParseAmount(pair.volumeToken1, tokens[1]) as TokenAmount
    const dummyPair = new Pair(
      token0Amount ? (token0Amount as TokenAmount) : new TokenAmount(tokens[0], '0'),
      token1Amount ? (token1Amount as TokenAmount) : new TokenAmount(tokens[1], '0')
    )
    const totalStakedAmount = tryParseAmount(pair.totalStakedBalance, dummyPair.liquidityToken) as TokenAmount
    const stakingToken = gaugeAddress.result ? new Token(11155111, gaugeAddress.result, 18, '') : undefined
    const token0Price = pair.token0Price
    const token1Price = pair.token1Price
    return {
      id: pair.id,
      feeRate: Number(pair.feeRate),
      tvl: Number(pair?.reserveUSD),
      createAt: pair?.createdAtTimestamp,
      txCount: pair?.txCount,
      stakingRewardAddress: gaugeAddress.result,
      token0Price: token0Price || '0.00',
      token1Price: token1Price || '0.00',
      pair: dummyPair,
      tokens,
      lpToken: dummyPair.liquidityToken,
      token0Amount,
      token0Value: Number(pair.reserve0),
      token1Value: Number(pair.reserve1),
      token1Amount,
      volume0Amount,
      volume1Amount,
      totalStakedAmount,
      stakingToken,
      totalLiquidity: tryParseAmount(pair.reserveUSD, dummyPair.liquidityToken) as TokenAmount,
      totalSupply: tryParseAmount(pair.totalSupply, dummyPair.liquidityToken) as TokenAmount,
      volumeAmount: tryParseAmount(pair.volumeUSD, dummyPair.liquidityToken) as TokenAmount
    }
  } catch (error) {
    console.log('error', error)
    return undefined
  }
}

export async function fetchPairMore(stakingAddress: string): Promise<PairMore | undefined> {
  try {
    const utcCurrentTime = dayjs()
    const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix()
    const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix()
    const utcOneWeekBack = utcCurrentTime.subtract(1, 'week').unix()
    const utcTwoWeeksBack = utcCurrentTime.subtract(2, 'week').unix()
    const [oneDayBlock, twoDayBlock, oneWeekBlock, twoWeekBlock] = await getBlocksFromTimestamps([
      utcOneDayBack,
      utcTwoDaysBack,
      utcOneWeekBack,
      utcTwoWeeksBack
    ])
    const res = await postQuery(SUBGRAPH, PAIR_QUERY({ stakingAddress }))
    const d1Res = await postQuery(SUBGRAPH, PAIR_QUERY({ block: oneDayBlock.number, stakingAddress }))
    const d2Res = await postQuery(SUBGRAPH, PAIR_QUERY({ block: twoDayBlock.number, stakingAddress }))
    const w1Res = await postQuery(SUBGRAPH, PAIR_QUERY({ block: oneWeekBlock.number, stakingAddress }))
    const w2Res = await postQuery(SUBGRAPH, PAIR_QUERY({ block: twoWeekBlock?.number, stakingAddress }))
    const pair = res?.data.pairs[0]
    const d1Pair = d1Res?.data.pairs[0]
    const d2Pair = d2Res?.data.pairs[0]
    const w1Pair = w1Res?.data.pairs[0]
    const w2Pair = w2Res?.data.pairs[0]

    const [oneDayTVLUSD, tvlChangeUSD] = get2DayPercentChange(
      pair?.reserveUSD,
      d1Pair?.reserveUSD ?? pair?.reserveUSD,
      d2Pair?.reserveUSD ?? '0'
    )

    const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
      pair?.volumeUSD,
      d1Pair?.volumeUSD ?? '0',
      d2Pair?.volumeUSD ?? '0'
    )

    const [oneWeekTVLUSD] = get2DayPercentChange(pair?.reserveUSD, w1Pair?.reserveUSD ?? '0', w2Pair?.reserveUSD ?? '0')
    const [oneWeekVolume, weeklyVolumeChange] = get2DayPercentChange(
      pair?.volumeUSD,
      w1Pair?.volumeUSD ?? pair?.volumeUSD,
      w2Pair?.volumeUSD ?? '0'
    )

    return {
      tvlChangeUSD: Number(tvlChangeUSD),
      volumeChangeUSD: Number(volumeChangeUSD),
      weeklyVolumeChange: Number(weeklyVolumeChange),
      totalVolume: Number(pair.volumeUSD),

      oneDayTVLUSD: Number(oneDayTVLUSD),
      oneWeekTVLUSD: Number(oneWeekTVLUSD),

      oneDayVolumeUSD: Number(oneDayVolumeUSD),
      oneWeekVolume: Number(oneWeekVolume)
    }
  } catch (error) {
    console.log('error', error)
    return undefined
  }
}

export async function fetchGlobalData() {
  try {
    const utcCurrentTime = dayjs()
    const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix()
    const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix()
    const utcOneWeekBack = utcCurrentTime.subtract(1, 'week').unix()
    const utcTwoWeeksBack = utcCurrentTime.subtract(2, 'week').unix()
    const [oneDayBlock, twoDayBlock, oneWeekBlock, twoWeekBlock] = await getBlocksFromTimestamps([
      utcOneDayBack,
      utcTwoDaysBack,
      utcOneWeekBack,
      utcTwoWeeksBack
    ])
    const totalRes = await postQuery(SUBGRAPH, GLOBAL_QUERY())
    const d1Res = await postQuery(SUBGRAPH, GLOBAL_QUERY(oneDayBlock.number))
    const d2Res = await postQuery(SUBGRAPH, GLOBAL_QUERY(twoDayBlock.number))

    const w1Res = await postQuery(SUBGRAPH, GLOBAL_QUERY(oneWeekBlock.number))

    const w2Res = await postQuery(SUBGRAPH, GLOBAL_QUERY(twoWeekBlock?.number))

    const [oneDayTVLUSD, tvlChangeUSD] = get2DayPercentChange(
      totalRes?.data.lightswapFactories[0]?.totalLiquidityUSD,
      d1Res?.data.lightswapFactories[0]?.totalLiquidityUSD,
      d2Res?.data.lightswapFactories[0]?.totalLiquidityUSD
    )

    const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
      totalRes.data.lightswapFactories[0]?.totalVolumeUSD,
      d1Res.data.lightswapFactories[0]?.totalVolumeUSD,
      d2Res.data.lightswapFactories[0]?.totalVolumeUSD
    )

    const [oneWeekVolume, weeklyVolumeChange] = get2DayPercentChange(
      totalRes.data.lightswapFactories[0]?.totalVolumeUSD,
      w1Res.data.lightswapFactories[0]?.totalVolumeUSD,
      w2Res.data.lightswapFactories[0]?.totalVolumeUSD
    )

    const [oneWeekTVLUSD] = get2DayPercentChange(
      totalRes.data.lightswapFactories[0]?.totalLiquidityUSD,
      w1Res.data.lightswapFactories[0]?.totalLiquidityUSD,
      w2Res.data.lightswapFactories[0]?.totalLiquidityUSD
    )
    return {
      tvl: totalRes.data.lightswapFactories[0]?.totalLiquidityUSD,
      tvlChangeUSD,
      oneDayTVLUSD,
      oneWeekTVLUSD,
      totalVolume: totalRes.data.lightswapFactories[0]?.totalVolumeUSD,
      oneDayVolumeUSD,
      volumeChangeUSD,
      dayFees: oneDayVolumeUSD * 0.003,
      weekFees: oneWeekVolume * 0.003,
      weeklyVolumeChange
    }
  } catch (error) {
    console.error('fetchGlobalData', error)
    return undefined
  }
}

const Mints = `
 mints(first: 20, where: { pair_in: $allPairs }) {
      transaction {
        id
        timestamp
      }
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      sender
      liquidity
      amount0
      amount1
      amountUSD
    }
`

const Burns = `
 burns(first: 20, where: { pair_in: $allPairs }, orderBy: timestamp, orderDirection: desc) {
      transaction {
        id
        timestamp
      }
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      sender
      liquidity
      amount0
      amount1
      amountUSD
    }
`

const Swaps = `
 swaps(first: 30, where: { pair_in: $allPairs }, orderBy: timestamp, orderDirection: desc) {
      transaction {
        id
        timestamp
      }
      id
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      sender
      amount0In
      amount0Out
      amount1In
      amount1Out
      amountUSD
      to
    }
`

function QUERY_TXS_QUERY(type?: string | undefined) {
  let sql
  switch (type) {
    case 'All':
      sql = `
         ${Mints}
         ${Burns}
         ${Swaps} 
      `
      break
    case 'Swap':
      sql = `
         ${Swaps} 
      `
      break
    case 'Deposit':
      sql = `
         ${Mints}
      `
      break
    case 'Withdraw':
      sql = `
         ${Burns}
      `
      break
    case undefined:
      sql = `
         ${Mints}
         ${Burns}
         ${Swaps} 
      `
      break
  }
  return `
  query ($allPairs: [Bytes]!) {
    ${sql}
  }
`
}

export interface TX {
  mints: {
    transaction: { id: string; timestamp: string }
    pair: {
      token0: {
        id: string
        symbol: string
      }
      token1: {
        id: string
        symbol: string
      }
    }
    sender: string
    amount0: string
    amount1: string
  }[]
  burns: {
    transaction: { id: string; timestamp: string }
    pair: {
      token0: {
        id: string
        symbol: string
      }
      token1: {
        id: string
        symbol: string
      }
    }
    sender: string
    amount0: string
    amount1: string
  }[]
  swaps: {
    transaction: { id: string; timestamp: string }
    pair: {
      token0: {
        id: string
        symbol: string
      }
      token1: {
        id: string
        symbol: string
      }
    }
    sender: string
    amount0In: string
    amount0Out: string
    amount1In: string
    amount1Out: string
  }[]
}

export interface TxResponse {
  title: string
  transaction: { id: string; timestamp: string }
  pair: {
    token0: {
      id: string
      symbol: string
    }
    token1: {
      id: string
      symbol: string
    }
  }
  sender: string
  amount0: number
  amount1: number
  amountUSD: number
}

export async function fetchPairTxs(pairAddress: string, type?: string): Promise<TxResponse[]> {
  try {
    const response = await postQuery(SUBGRAPH, QUERY_TXS_QUERY(type), { allPairs: [pairAddress.toLowerCase()] })
    let result: TxResponse[] = []
    if (response?.data.mints) {
      result = response?.data.mints
        .map((item: any) => {
          return { ...item, title: `Add ${item.pair.token0.symbol}-${item.pair.token1.symbol}` }
        })
        .concat(result)
    }
    if (response?.data.burns) {
      result = response?.data.burns
        .map((item: any) => {
          return { ...item, title: `Remove ${item.pair.token0.symbol}-${item.pair.token1.symbol}` }
        })
        .concat(result)
    }
    if (response?.data.swaps) {
      result = result.concat(
        response?.data.swaps.map((swap: any) => {
          const swapItem = swap
          const symbolIn = swap.amount0In === '0' ? swap.pair.token1.symbol : swap.pair.token0.symbol
          const symbolOut = swap.amount0In === '0' ? swap.pair.token0.symbol : swap.pair.token1.symbol
          swap.amount0 = swap.amount0In === '0' ? swap.amount0Out : swap.amount0In
          swap.amount1 = swap.amount1In === '0' ? swap.amount1Out : swap.amount1In
          return { ...swapItem, title: `Swap ${symbolIn} to ${symbolOut}` }
        })
      )
    }
    return result
  } catch (error) {
    return []
  }
}

export async function fetchPairsTimeInfo(pairs: string[]): Promise<TimeInfo[]> {
  try {
    const utcCurrentTime = dayjs()
    const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix()
    const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix()
    const [oneDayBlock, twoDayBlock] = await getBlocksFromTimestamps([utcOneDayBack, utcTwoDaysBack])
    const curRes = await postQuery(SUBGRAPH, PAIR_TIME_INFO_QUERY(), { pairs })
    const d1Res = await postQuery(SUBGRAPH, PAIR_TIME_INFO_QUERY(oneDayBlock.number), { pairs })
    const d2Res = await postQuery(SUBGRAPH, PAIR_TIME_INFO_QUERY(twoDayBlock.number), { pairs })

    const curPairs = curRes?.data.pairs
    const d1Pairs = d1Res?.data.pairs
    const d2Pairs = d2Res?.data.pairs
    return curPairs.map((pair: any) => {
      const d1Pair = d1Pairs.find((d1pair: any) => {
        return d1pair.id === pair.id
      })
      const d2Pair = d2Pairs.find((d2pair: any) => {
        return d2pair.id === pair.id
      })
      const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
        pair?.volumeUSD,
        d1Pair?.volumeUSD,
        d2Pair?.volumeUSD
      )

      return {
        pairAddress: pair.id,
        dayVolume: oneDayVolumeUSD && oneDayVolumeUSD.toString() !== '0' ? Number(oneDayVolumeUSD) : '0.00',
        dayVolumeChange: Number(volumeChangeUSD),
        totalVolume: Number(pair.reserveUSD)
      }
    })
  } catch (error) {
    console.error(`error${error}`)
    return []
  }
}
