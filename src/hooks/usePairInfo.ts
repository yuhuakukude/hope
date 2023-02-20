import useBasePairs from './liquidity/useBasePairs'
import { useMemo } from 'react'
import { toV2LiquidityToken } from '../state/user/hooks'
import { useTokenBalances } from '../state/wallet/hooks'
import { useActiveWeb3React } from './index'
import { TokenAmount } from '@uniswap/sdk'
import { useMultipleContractSingleData } from '../state/multicall/hooks'
import { STAKING_REWARDS_INTERFACE } from '../constants/abis/staking-rewards'

export default function usePairsInfo() {
  const { account } = useActiveWeb3React()
  const allPairs = useBasePairs()

  const liquidityPairs = useMemo(
    () => allPairs.result.map(pair => ({ liquidityToken: toV2LiquidityToken(pair.tokens), tokens: pair.tokens })),
    [allPairs]
  )

  const liquidityTokens = useMemo(() => liquidityPairs.map(tpwlt => tpwlt.liquidityToken), [liquidityPairs])

  const pairBalances = useTokenBalances(account ?? undefined, liquidityTokens)
  const accountArg = useMemo(() => [account ?? undefined], [account])

  const stakedAmounts = useMultipleContractSingleData(
    allPairs.result.map(pair => {
      return pair.stakingAddress
    }),
    STAKING_REWARDS_INTERFACE,
    'lpBalanceOf',
    accountArg
  )

  const pairInfos = useMemo(
    () =>
      liquidityPairs
        .map((pair, index) => {
          return {
            pair,
            stakedAmount: stakedAmounts[index]?.result
              ? new TokenAmount(pair.liquidityToken, stakedAmounts[index].result?.[0])
              : undefined
          }
        })
        .filter(pairInfo => pairBalances[pairInfo.pair.liquidityToken.address]?.greaterThan('0')),
    [liquidityPairs, pairBalances, stakedAmounts]
  )

  return {
    loading: allPairs.loading,
    pairInfos
  }
}
