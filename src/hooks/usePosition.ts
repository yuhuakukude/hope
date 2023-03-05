import { JSBI, Pair, TokenAmount } from '@uniswap/sdk'
import { useTokenBalance } from '../state/wallet/hooks'
import { useTotalSupply } from '../data/TotalSupply'
import { useActiveWeb3React } from './index'
import { PoolInfo } from '../state/stake/hooks'

export function usePosition(pair?: Pair) {
  const { account } = useActiveWeb3React()
  const userPoolBalance = useTokenBalance(account ?? undefined, pair?.liquidityToken)
  const totalPoolTokens = useTotalSupply(pair?.liquidityToken)

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? [
          pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
          pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false)
        ]
      : [undefined, undefined]

  return {
    currency0: pair?.token0,
    token0Deposited,
    currency1: pair?.token1,
    token1Deposited,
    balance: userPoolBalance
  }
}

export function useStakePosition(pool?: PoolInfo) {
  const { account } = useActiveWeb3React()
  const totalPoolTokens = useTotalSupply(pool?.stakingToken)
  const stakedAmount = useTokenBalance(account ?? undefined, pool?.stakingToken)
  const totalStakedAmount =
    totalPoolTokens && pool?.pair.liquidityToken
      ? new TokenAmount(pool?.pair.liquidityToken, JSBI.BigInt(totalPoolTokens?.raw.toString()))
      : undefined
  const stakedLpAmount =
    pool?.pair.liquidityToken && stakedAmount?.raw
      ? new TokenAmount(pool?.pair.liquidityToken, JSBI.BigInt(stakedAmount?.raw.toString()))
      : undefined
  const [token0Staked, token1Staked] =
    !!pool?.pair &&
    !!totalStakedAmount &&
    !!stakedLpAmount &&
    stakedLpAmount.greaterThan('0') &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalStakedAmount.raw, stakedLpAmount.raw)
      ? [
          pool.pair.getLiquidityValue(pool.pair.token0, totalStakedAmount, stakedLpAmount, false),
          pool.pair.getLiquidityValue(pool.pair.token1, totalStakedAmount, stakedLpAmount, false)
        ]
      : [undefined, undefined]

  return {
    currency0: pool?.pair?.token0,
    token0Staked,
    currency1: pool?.pair?.token1,
    token1Staked,
    stakedLpAmount
  }
}
