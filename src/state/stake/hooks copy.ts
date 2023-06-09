import { ChainId, JSBI, Pair, Token, TokenAmount, WETH } from '@uniswap/sdk'
import { useMemo } from 'react'
import { DAI, SUBGRAPH, UNI, WBTC } from '../../constants'
import { USDC, USDT, HOPE } from 'constants/constract'
import { STAKING_REWARDS_INTERFACE } from '../../constants/abis/staking-rewards'
import { useActiveWeb3React } from '../../hooks'
import { useMultipleContractSingleData } from '../multicall/hooks'
import { tryParseAmount } from '../swap/hooks'
import { postQuery } from '../../utils/graph'

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

export interface StakeInfo {
  id: string
  totalStakedBalance: string
  totalStakedBalanceUSD: string
  pair: {
    id: boolean
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
}

export interface PoolInfo {
  // the address of the reward contract
  stakingRewardAddress: string
  // the tokens involved in this pair
  tokens: Token[]

  lpToken: Token

  stakingToken: Token

  tvl: TokenAmount

  pair: Pair

  volumeAmount: TokenAmount

  token0Amount: TokenAmount

  token1Amount: TokenAmount

  volume0Amount: TokenAmount

  volume1Amount: TokenAmount

  totalStakedAmount: TokenAmount
}

export async function fetchStakeList(
  account: string,
  searchContent: string | undefined,
  sort: 'asc' | 'desc',
  orderBy: 'apr',
  skip = 0,
  size = 10
): Promise<PoolInfo[]> {
  const query = `{
    poolGauges {
    id
    totalStakedBalanceUSD
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
    stakedPoolPositions {
      pool {
        totalStakedBalance
        totalStakedBalanceUSD
        stakedPoolPositions(where: {user: "${account}"}) {
          id
          stakedPoolBalanceUSD
          stakedPoolBalance
        }
      }
    }
  }
}`
  try {
    const response = await postQuery(SUBGRAPH, query)
    const pools = response.data.poolGauges
    const poolInfos = pools.map((pool: StakeInfo) => {
      const stakingRewardAddress = pool.id
      const token0 = new Token(
        ChainId.SEPOLIA,
        pool.pair.token0.id,
        Number(pool.pair.token0.decimals),
        pool.pair.token0.symbol
      )
      const token1 = new Token(
        ChainId.SEPOLIA,
        pool.pair.token1.id,
        Number(pool.pair.token1.decimals),
        pool.pair.token1.symbol
      )
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
        stakingRewardAddress,
        tokens,
        pair: dummyPair,
        lpToken: dummyPair.liquidityToken,
        token0Amount,
        token1Amount,
        volume0Amount,
        volume1Amount,
        totalStakedAmount,
        stakingToken,
        tvl: tryParseAmount(pool.pair.reserveUSD, dummyPair.liquidityToken),
        volumeAmount: tryParseAmount(pool.pair.volumeUSD, dummyPair.liquidityToken)
      }
    }, [])
    return poolInfos
  } catch (error) {
    return []
  }
}

export async function fetchStakingPool(stakingAddress: string): Promise<PoolInfo | undefined> {
  const query = `{
    poolGauges(where: {id:"${stakingAddress}"}) {
    id
    totalStakedBalanceUSD
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
    const token0 = new Token(
      ChainId.SEPOLIA,
      pool.pair.token0.id,
      Number(pool.pair.token0.decimals),
      pool.pair.token0.symbol
    )
    const token1 = new Token(
      ChainId.SEPOLIA,
      pool.pair.token1.id,
      Number(pool.pair.token1.decimals),
      pool.pair.token1.symbol
    )
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
    const stakingToken = new Token(11155111, pool.id, 18, '')
    return {
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
      tvl: tryParseAmount(pool.pair.reserveUSD, dummyPair.liquidityToken) as TokenAmount,
      volumeAmount: tryParseAmount(pool.pair.volumeUSD, dummyPair.liquidityToken) as TokenAmount
    }
  } catch (error) {
    return undefined
  }
}
