import { JSBI, Pair, TokenAmount } from '@uniswap/sdk'
import { useTokenBalance } from '../state/wallet/hooks'
import { useTotalSupply } from '../data/TotalSupply'
import { useActiveWeb3React } from './index'
import { PoolInfo } from '../state/stake/hooks'
import { useStakingContract } from './useContract'
import { useSingleCallResult } from '../state/multicall/hooks'

export function usePosition(pair?: Pair) {
  const { account } = useActiveWeb3React()
  const userPoolBalance = useTokenBalance(account ?? undefined, pair?.liquidityToken)
  const totalPoolTokens = useTotalSupply(pair?.liquidityToken)

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw) &&
    totalPoolTokens.greaterThan(JSBI.BigInt(0))
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
  const totalPoolTokens = useTotalSupply(pool?.lpToken)
  const contract = useStakingContract(pool?.stakingRewardAddress)
  const stakedRes = useSingleCallResult(contract, 'lpBalanceOf', [account ?? undefined])?.result?.[0]
  const stakedAmount =
    stakedRes && pool?.pair.liquidityToken
      ? new TokenAmount(pool?.pair.liquidityToken, JSBI.BigInt(stakedRes))
      : undefined
  const totalAmount =
    totalPoolTokens && pool?.pair.liquidityToken
      ? new TokenAmount(pool?.pair.liquidityToken, JSBI.BigInt(totalPoolTokens?.raw.toString()))
      : undefined
  const [token0Staked, token1Staked] =
    !!pool?.pair &&
    !!totalAmount &&
    !!stakedAmount &&
    stakedAmount.greaterThan('0') &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalAmount.raw, stakedAmount.raw) &&
    totalAmount.greaterThan(JSBI.BigInt(0))
      ? [
          pool.pair.getLiquidityValue(pool.pair.token0, totalAmount, stakedAmount, false),
          pool.pair.getLiquidityValue(pool.pair.token1, totalAmount, stakedAmount, false)
        ]
      : [undefined, undefined]

  return {
    currency0: pool?.pair?.token0,
    token0Staked,
    currency1: pool?.pair?.token1,
    token1Staked,
    stakedAmount
  }
}
