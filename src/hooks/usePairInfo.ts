import useBasePairs from './liquidity/useBasePairs'
import { useMemo } from 'react'
import { toV2LiquidityToken } from '../state/user/hooks'
import { useActiveWeb3React } from './index'
import { JSBI, Percent, TokenAmount } from '@uniswap/sdk'
import { useMultipleContractSingleData, useSingleCallResult } from '../state/multicall/hooks'
import { STAKING_REWARDS_INTERFACE } from '../constants/abis/staking-rewards'
import { useLockerContract, useStakingContract } from './useContract'
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

  const liquidityPairs = useMemo(
    () =>
      allPairs.map(pair => ({
        ...pair,
        liquidityToken: toV2LiquidityToken(pair.tokens),
        tokens: pair.tokens,
        tvl: pair.tvl,
        feeRate: pair.feeRate,
        stakingAddress: pair.stakingAddress
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
        const work = workAmounts[index]?.result
        const stake = stakedAmounts[index]?.result
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
                JSBI.multiply(JSBI.BigInt(stake.toString()), JSBI.BigInt(400))
              )
            : undefined
        const currentBoots =
          work && stake && stake.toString() !== '0'
            ? new Percent(
                JSBI.multiply(JSBI.BigInt(work.toString()), JSBI.BigInt(10)),
                JSBI.multiply(JSBI.BigInt(stake.toString()), JSBI.BigInt(400))
              )
            : undefined

        return {
          ...pair,
          pair,
          stakingAddress: pair.stakingAddress,
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

export function usePairStakeInfo(stakingAddress?: string) {
  const veltContract = useLockerContract()
  const { account, chainId } = useActiveWeb3React()
  const stakingContract = useStakingContract(stakingAddress)

  const veltBalance = useSingleCallResult(
    veltContract,
    'balanceOfAtTime',
    account ? [account, Math.floor(Date.now() / 1000).toString()] : [undefined]
  )?.result?.[0].toString()
  const veltTotal = useSingleCallResult(veltContract, 'totalSupplyAtTime', [
    Math.floor(Date.now() / 1000).toString()
  ])?.result?.[0].toString()
  const claimAbleRewards = useSingleCallResult(stakingContract, 'claimableTokens', [account ?? undefined])?.result
  const balance = useSingleCallResult(stakingContract, 'lpBalanceOf', [account ?? undefined])?.result?.[0].toString()
  const workingBalance = useSingleCallResult(stakingContract, 'workingBalances', [
    account ?? undefined
  ])?.result?.[0].toString()
  const totalSupply = useSingleCallResult(stakingContract, 'lpTotalSupply')?.result?.[0].toString()

  let lim =
    veltTotal && balance ? JSBI.divide(JSBI.multiply(JSBI.BigInt(balance), JSBI.BigInt(4)), JSBI.BigInt(10)) : undefined
  if (lim && veltTotal && totalSupply && veltBalance && JSBI.greaterThan(JSBI.BigInt(veltTotal), JSBI.BigInt(0))) {
    lim = JSBI.add(
      JSBI.divide(
        JSBI.multiply(JSBI.multiply(JSBI.BigInt(totalSupply), JSBI.BigInt(veltBalance)), JSBI.BigInt(6)),
        JSBI.multiply(JSBI.BigInt(veltTotal), JSBI.BigInt(10))
      ),
      lim
    )
  }
  const bu =
    balance && lim ? (JSBI.greaterThanOrEqual(JSBI.BigInt(balance), lim) ? lim : JSBI.BigInt(balance)) : undefined

  const futureBoots = useMemo(() => {
    return bu && balance && balance.toString() !== '0'
      ? new Percent(
          JSBI.multiply(bu, JSBI.BigInt(10)),
          JSBI.multiply(JSBI.BigInt(balance.toString()), JSBI.BigInt(400))
        )
      : undefined
  }, [balance, bu])

  const currentBoots = useMemo(() => {
    return workingBalance && balance && balance.toString() !== '0'
      ? new Percent(
          JSBI.multiply(JSBI.BigInt(workingBalance), JSBI.BigInt(10)),
          JSBI.multiply(JSBI.BigInt(balance), JSBI.BigInt(400))
        )
      : undefined
  }, [balance, workingBalance])

  return {
    currentBoots,
    futureBoots,
    claimAbleRewards: claimAbleRewards?.[0]
      ? new TokenAmount(LT[chainId ?? 1], claimAbleRewards?.[0].toString())
      : undefined
  }
}
