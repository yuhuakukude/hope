import useBasePairs from './liquidity/useBasePairs'
import { useMemo } from 'react'
import { toV2LiquidityToken } from '../state/user/hooks'
import { useActiveWeb3React } from './index'
import { JSBI, Percent, TokenAmount } from '@uniswap/sdk'
import { useMultipleContractSingleData, useSingleCallResult } from '../state/multicall/hooks'
import { STAKING_REWARDS_INTERFACE } from '../constants/abis/staking-rewards'
import { useLockerContract } from './useContract'
import { LT } from '../constants'

export enum PAIR_SEARCH {
  ALL,
  USER_LIQUIDITY,
  USER_STAKE
}

export default function usePairsInfo(
  page: number,
  currentPage: number,
  searchType = PAIR_SEARCH.ALL,
  searchValue = ''
) {
  const { account, chainId } = useActiveWeb3React()
  const { result: allPairs, total, loading } = useBasePairs(page, currentPage, searchType, searchValue, account ?? '')
  const veltContract = useLockerContract()
  const veltBalance = useSingleCallResult(
    veltContract,
    'balanceOfAtTime',
    account ? [account, Math.floor(Date.now() / 1000).toString()] : [undefined]
  )?.result?.[0].toString()
  const veltTotal = useSingleCallResult(veltContract, 'totalSupplyAtTime', [
    Math.floor(Date.now() / 1000).toString()
  ])?.result?.[0].toString()

  console.log('velt', veltBalance, veltTotal)
  const liquidityPairs = useMemo(
    () =>
      allPairs.map(pair => ({
        liquidityToken: toV2LiquidityToken(pair.tokens),
        tokens: pair.tokens,
        tvl: pair.tvl,
        feeRate: pair.feeRate
      })),
    [allPairs]
  )

  //const liquidityTokens = useMemo(() => liquidityPairs.map(tpwlt => tpwlt.liquidityToken), [liquidityPairs])

  //const pairBalances = useTokenBalances(account ?? undefined, liquidityTokens)
  const accountArg = useMemo(() => [account ?? undefined], [account])

  const rewardAmounts = useMultipleContractSingleData(
    allPairs.map(pair => {
      return pair.stakingAddress
    }),
    STAKING_REWARDS_INTERFACE,
    'claimableTokens',
    accountArg
  )

  const stakedAmounts = useMultipleContractSingleData(
    allPairs.map(pair => {
      return pair.stakingAddress
    }),
    STAKING_REWARDS_INTERFACE,
    'lpBalanceOf',
    accountArg
  )

  const workAmounts = useMultipleContractSingleData(
    allPairs.map(pair => {
      return pair.stakingAddress
    }),
    STAKING_REWARDS_INTERFACE,
    'workingBalances',
    accountArg
  )

  const totalAmounts = useMultipleContractSingleData(
    allPairs.map(pair => {
      return pair.stakingAddress
    }),
    STAKING_REWARDS_INTERFACE,
    'lpTotalSupply'
  )

  const pairInfos = useMemo(
    () =>
      liquidityPairs.map((pair, index) => {
        const reward = rewardAmounts[index]?.result
        const work = workAmounts[index].result
        const stake = stakedAmounts[index].result
        const total = totalAmounts[index]?.result
        let lim =
          veltTotal && stake
            ? JSBI.divide(JSBI.multiply(JSBI.BigInt(stake), JSBI.BigInt(4)), JSBI.BigInt(10))
            : undefined
        if (lim && veltTotal && total && veltBalance && JSBI.greaterThan(JSBI.BigInt(veltTotal), JSBI.BigInt(0))) {
          lim = JSBI.add(
            JSBI.divide(
              JSBI.multiply(JSBI.multiply(JSBI.BigInt(total), JSBI.BigInt(veltBalance)), JSBI.BigInt(6)),
              JSBI.multiply(JSBI.BigInt(veltTotal), JSBI.BigInt(10))
            ),
            lim
          )
        }
        const bu =
          stake && lim ? (JSBI.greaterThanOrEqual(JSBI.BigInt(stake), lim) ? lim : JSBI.BigInt(stake)) : undefined
        const futureBoots =
          bu && stake && stake.toString() !== '0'
            ? new Percent(
                JSBI.multiply(bu, JSBI.BigInt(10)),
                JSBI.multiply(JSBI.BigInt(stake.toString()), JSBI.BigInt(4))
              )
            : undefined
        const currentBoots =
          work && stake && stake.toString() !== '0'
            ? new Percent(
                JSBI.multiply(JSBI.BigInt(work.toString()), JSBI.BigInt(10)),
                JSBI.multiply(JSBI.BigInt(stake.toString()), JSBI.BigInt(4))
              )
            : undefined
        console.log('lim--->1', pair, work?.toString(), stake?.toString())
        return {
          pair,
          reward: reward ? new TokenAmount(LT[chainId ?? 1], reward?.[0].toString()) : undefined,
          futureBoots,
          currentBoots,
          feeRate: pair.feeRate,
          tvl: pair.tvl,
          stakedAmount: stakedAmounts[index]?.result
            ? new TokenAmount(pair.liquidityToken, stakedAmounts[index].result?.[0])
            : undefined
        }
      }),
    [chainId, liquidityPairs, rewardAmounts, stakedAmounts, totalAmounts, veltBalance, veltTotal, workAmounts]
  )

  return {
    loading,
    total,
    pairInfos
  }
}
