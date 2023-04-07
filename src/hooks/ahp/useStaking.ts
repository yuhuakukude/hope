import { useCallback } from 'react'
import { useSingleCallResult } from '../../state/multicall/hooks'
import { useStakingHopeGaugeContract, useLtMinterContract } from '../useContract'
import { useActiveWeb3React } from '../index'
import JSBI from 'jsbi'
import { CurrencyAmount } from '@uniswap/sdk'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { calculateGasMargin } from '../../utils'
import { TransactionResponse } from '@ethersproject/providers'
import { useBlockNumber } from '../../state/application/hooks'
import { useTimestampFromBlock } from 'hooks/useTimestampFromBlock'
import { useGomConContract } from '../useContract'
import { getStakingHopeGaugeAddress } from 'utils/addressHelpers'

export enum stakingFnNameEnum {
  Mint = 'mint',
  RedeemAll = 'redeemAll'
}

export function useStaking() {
  const { account, chainId } = useActiveWeb3React()
  const shgContract = useStakingHopeGaugeContract()
  const ltMinterContract = useLtMinterContract()
  const gomContract = useGomConContract()
  const blockNumber = useBlockNumber()
  const time = useTimestampFromBlock(blockNumber)
  const stakedVal = useSingleCallResult(shgContract, 'lpBalanceOf', [account ?? undefined])
  const unstakedVal = useSingleCallResult(shgContract, 'unstakedBalanceOf', [account ?? undefined])
  const unstakingVal = useSingleCallResult(shgContract, 'unstakingBalanceOf', [account ?? undefined])
  const lpTotalSupply = useSingleCallResult(shgContract, 'lpTotalSupply')
  const claRewards = useSingleCallResult(shgContract, 'claimableTokens', [account ?? undefined])
  const mintedVal = useSingleCallResult(ltMinterContract, 'minted', [
    account ?? undefined,
    getStakingHopeGaugeAddress(chainId)
  ])
  const gomRelativeWeigh = useSingleCallResult(gomContract, 'gaugeRelativeWeight', [
    getStakingHopeGaugeAddress(chainId),
    time
  ])

  return {
    stakedVal: stakedVal?.result ? CurrencyAmount.ether(stakedVal?.result?.[0]) : undefined,
    lpTotalSupply: lpTotalSupply?.result ? CurrencyAmount.ether(lpTotalSupply?.result?.[0]) : undefined,
    unstakedVal: unstakedVal?.result ? CurrencyAmount.ether(unstakedVal?.result?.[0]) : undefined,
    unstakingVal: unstakingVal?.result ? CurrencyAmount.ether(unstakingVal?.result?.[0]) : undefined,
    claRewards: claRewards?.result ? CurrencyAmount.ether(claRewards?.result?.[0]) : undefined,
    mintedVal: mintedVal?.result ? CurrencyAmount.ether(mintedVal?.result?.[0]) : undefined,
    gomRelativeWeigh: gomRelativeWeigh?.result ? CurrencyAmount.ether(gomRelativeWeigh?.result?.[0]) : undefined,
    lpTotalSupplyLoading: lpTotalSupply.loading,
    gomRelativeWeighLoading: gomRelativeWeigh.loading,
    claRewardsLoading: claRewards.loading,
    unstakedValLoading: unstakedVal.loading,
    unstakingValLoading: unstakingVal.loading
  }
}

export function useToStaked() {
  const addTransaction = useTransactionAdder()
  const contract = useStakingHopeGaugeContract()
  const { account } = useActiveWeb3React()
  const toStaked = useCallback(
    async (amount: CurrencyAmount, NONCE, DEADLINE, sigVal) => {
      if (!account) throw new Error('none account')
      if (!contract) throw new Error('none contract')
      if (amount.equalTo(JSBI.BigInt('0'))) throw new Error('amount is un support')
      const args = [amount.raw.toString(), NONCE, DEADLINE, sigVal]
      const method = 'staking'
      return contract.estimateGas[method](...args, { from: account }).then(estimatedGasLimit => {
        return contract[method](...args, {
          gasLimit: calculateGasMargin(estimatedGasLimit),
          // gasLimit: '3500000',
          from: account
        }).then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Stake ${amount.toFixed(2, { groupSeparator: ',' }).toString()}  HOPE`
          })
          return response.hash
        })
      })
    },
    [account, addTransaction, contract]
  )
  return {
    toStaked
  }
}

export function useToUnStaked() {
  const addTransaction = useTransactionAdder()
  const contract = useStakingHopeGaugeContract()
  const { account } = useActiveWeb3React()
  const toUnStaked = useCallback(
    async (amount: CurrencyAmount) => {
      if (!account) throw new Error('none account')
      if (!contract) throw new Error('none contract')
      if (amount.equalTo(JSBI.BigInt('0'))) throw new Error('amount is un support')
      const args = [amount.raw.toString()]
      const method = 'unstaking'
      return contract.estimateGas[method](...args, { from: account }).then(estimatedGasLimit => {
        return contract[method](...args, {
          gasLimit: calculateGasMargin(estimatedGasLimit),
          // gasLimit: '3500000',
          from: account
        }).then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Unstake ${amount.toFixed(2)} stHOPE`
          })
          return response.hash
        })
      })
    },
    [account, addTransaction, contract]
  )
  return {
    toUnStaked
  }
}

export function useToWithdraw() {
  const addTransaction = useTransactionAdder()
  const contract = useStakingHopeGaugeContract()
  const { account } = useActiveWeb3React()
  const toWithdraw = useCallback(async () => {
    if (!account) throw new Error('none account')
    if (!contract) throw new Error('none contract')
    const args: any = []
    const method = 'redeemAll'
    return contract.estimateGas[method](...args, { from: account }).then(estimatedGasLimit => {
      return contract[method](...args, {
        gasLimit: calculateGasMargin(estimatedGasLimit),
        // gasLimit: '3500000',
        from: account
      }).then((response: TransactionResponse) => {
        addTransaction(response, {
          summary: `Withdraw`
        })
        return response.hash
      })
    })
  }, [account, addTransaction, contract])
  return {
    toWithdraw
  }
}

export function useToClaim() {
  const addTransaction = useTransactionAdder()
  const contract = useLtMinterContract()
  const { account } = useActiveWeb3React()
  const toClaim = useCallback(
    async (address: string, claRewards) => {
      if (!account) throw new Error('none account')
      if (!contract) throw new Error('none contract')
      const args = [address]
      const method = stakingFnNameEnum.Mint
      return contract.estimateGas[method](...args, { from: account }).then(estimatedGasLimit => {
        return contract[method](...args, {
          gasLimit: calculateGasMargin(estimatedGasLimit),
          // gasLimit: '3500000',
          from: account
        }).then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Claim To Reward`,
            actionTag: {
              recipient: `${account}-${stakingFnNameEnum.Mint}`
            }
          })
          return response.hash
        })
      })
    },
    [account, addTransaction, contract]
  )
  return {
    toClaim
  }
}
