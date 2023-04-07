import useBasePairs from './liquidity/useBasePairs'
import { useMemo, useState } from 'react'
import { toV2LiquidityToken } from '../state/user/hooks'
import { useActiveWeb3React } from './index'
import { CurrencyAmount, JSBI, Percent, TokenAmount } from '@uniswap/sdk'
import { useMultipleContractSingleData, useSingleCallResult } from '../state/multicall/hooks'
import { STAKING_REWARDS_INTERFACE } from '../constants/abis/staking-rewards'
import { useGomConContract, useLockerContract, useStakingContract } from './useContract'
import useCurrentBlockTimestamp from './useCurrentBlockTimestamp'
import { Field } from '../state/liquidity/actions'
import { getLTToken, getLTTokenAddress, getStakingHopeGaugeAddress } from 'utils/addressHelpers'

export enum PAIR_SEARCH {
  ALL,
  USER_LIQUIDITY,
  USER_STAKE
}

export default function usePairsInfo(
  page: number,
  currentPage: number,
  searchType = Field.ALL,
  searchValue = '',
  reload: number
) {
  const { account, chainId } = useActiveWeb3React()
  const [isError, setIsError] = useState(false)
  const { result: allPairs, total, loading } = useBasePairs(
    page,
    currentPage,
    searchType,
    searchValue,
    account ?? '',
    reload
  )
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

  const ltRewardsArg = useMemo(() => [account ?? undefined, getLTTokenAddress(chainId)], [account, chainId])

  const ltRewardAmounts = useMultipleContractSingleData(
    allPairs.map(pair => {
      return pair.stakingAddress
    }),
    STAKING_REWARDS_INTERFACE,
    'claimableReward',
    ltRewardsArg
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
  const pairInfos = useMemo(() => {
    try {
      return liquidityPairs.map((pair, index) => {
        const reward = rewardAmounts[index]?.result
        const ltReward = ltRewardAmounts[index]?.result
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
          reward: new TokenAmount(
            getLTToken(chainId),
            reward && ltReward
              ? JSBI.add(JSBI.BigInt(reward?.[0].toString()), JSBI.BigInt(ltReward?.[0].toString()))
              : reward
              ? reward?.[0].toString()
              : ltReward
              ? ltReward?.[0].toString()
              : '0'
          ),
          miningRewards: new TokenAmount(getLTToken(chainId), reward ? reward?.[0].toString() : '0'),
          futureBoots,
          currentBoots,
          feeRate: pair.feeRate,
          tvl: pair.tvl,
          stakedAmount: stakedAmounts[index]?.result
            ? new TokenAmount(pair.liquidityToken, stakedAmounts[index].result?.[0])
            : undefined
        }
      })
    } catch (error) {
      console.log(error)
      setIsError(true)
      return []
    }
  }, [
    chainId,
    liquidityPairs,
    ltRewardAmounts,
    rewardAmounts,
    stakedAmounts,
    totalAmounts,
    veltBalance,
    veltTotal,
    workAmounts
  ])

  return {
    loading,
    total,
    pairInfos,
    isError
  }
}

export function usePairStakeInfo(stakingAddress?: string) {
  const veltContract = useLockerContract()
  const timestamp = useCurrentBlockTimestamp()
  const { account, chainId } = useActiveWeb3React()
  const stakingContract = useStakingContract(stakingAddress)
  const gomContract = useGomConContract()

  const relativeWeight = useSingleCallResult(gomContract, 'gaugeRelativeWeight', [
    stakingAddress,
    timestamp?.toString()
  ])?.result?.[0].toString()

  const veltBalanceRes = useSingleCallResult(
    veltContract,
    'balanceOfAtTime',
    account ? [account, timestamp?.toString()] : [undefined]
  )

  const veltBalance = useMemo(() => {
    return veltBalanceRes?.result?.[0].toString()
  }, [veltBalanceRes])

  const veltTotalRes = useSingleCallResult(veltContract, 'totalSupplyAtTime', [timestamp?.toString()])

  const veltTotal = useMemo(() => {
    return veltTotalRes?.result?.[0].toString()
  }, [veltTotalRes])

  const claimAbleRewards = useSingleCallResult(stakingContract, 'claimableTokens', [account ?? undefined])?.result

  const isSHAddr = useMemo(() => {
    let res = false
    const addr = `${getStakingHopeGaugeAddress(chainId)}`.toLocaleLowerCase()
    if (addr === stakingAddress) {
      res = true
    }
    return res
  }, [chainId, stakingAddress])

  const ltRewards = useSingleCallResult(
    stakingContract,
    'claimableReward',
    isSHAddr ? [undefined] : [account ?? undefined, getLTTokenAddress(chainId)]
  ).result

  const balanceRes = useSingleCallResult(stakingContract, 'lpBalanceOf', [account ?? undefined])
  const workingBalanceRes = useSingleCallResult(stakingContract, 'workingBalances', [account ?? undefined])
  const balance = useMemo(() => {
    return balanceRes?.result?.[0].toString()
  }, [balanceRes])
  const workingBalance = useMemo(() => {
    return workingBalanceRes?.result?.[0].toString()
  }, [workingBalanceRes])
  const totalSupplyRes = useSingleCallResult(stakingContract, 'lpTotalSupply')
  const totalSupply = useMemo(() => {
    return totalSupplyRes?.result?.[0].toString()
  }, [totalSupplyRes])

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
    currentBootsLoading: workingBalanceRes.loading || balanceRes.loading,
    futureBootsLoading: veltTotalRes.loading || balanceRes.loading || totalSupplyRes.loading || veltBalanceRes.loading,
    relativeWeight: relativeWeight
      ? CurrencyAmount.ether(JSBI.multiply(JSBI.BigInt(relativeWeight), JSBI.BigInt(100)))
      : undefined,
    claimAbleRewards:
      !claimAbleRewards?.[0] && !ltRewards?.[0]
        ? undefined
        : new TokenAmount(
            getLTToken(chainId),
            claimAbleRewards?.[0] && ltRewards?.[0]
              ? JSBI.add(JSBI.BigInt(claimAbleRewards?.[0].toString()), JSBI.BigInt(ltRewards?.[0].toString()))
              : claimAbleRewards?.[0]
              ? claimAbleRewards?.[0]
              : ltRewards?.[0]
          )
  }
}
