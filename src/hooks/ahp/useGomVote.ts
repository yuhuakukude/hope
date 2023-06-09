import { useCallback } from 'react'
// import { useSingleCallResult } from '../../state/multicall/hooks'
import { useGomConContract } from '../useContract'
import { useActiveWeb3React } from '../index'
// import JSBI from 'jsbi'
// import { CurrencyAmount } from '@uniswap/sdk'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { calculateGasMargin } from '../../utils'
import { TransactionResponse } from '@ethersproject/providers'

export enum conFnNameEnum {
  VoteForGaugeWeights = 'voteForGaugeWeights',
  BatchVoteForGaugeWeights = 'batchVoteForGaugeWeights'
}

export function useToVote() {
  const addTransaction = useTransactionAdder()
  const contract = useGomConContract()
  const { account } = useActiveWeb3React()
  const toVote = useCallback(
    async (address: string, amount: any) => {
      if (!account) throw new Error('none account')
      if (!contract) throw new Error('none contract')
      const args = [address, amount]
      const method = conFnNameEnum.VoteForGaugeWeights
      return contract.estimateGas[method](...args, { from: account }).then(estimatedGasLimit => {
        return contract[method](...args, {
          gasLimit: calculateGasMargin(estimatedGasLimit),
          // gasLimit: '3500000',
          from: account
        }).then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Vote to gauge`,
            actionTag: {
              recipient: `${account}-${conFnNameEnum.VoteForGaugeWeights}`
            }
          })
          return response.hash
        })
      })
    },
    [account, addTransaction, contract]
  )
  return {
    toVote
  }
}

export function useToVoteAll() {
  const addTransaction = useTransactionAdder()
  const contract = useGomConContract()
  const { account } = useActiveWeb3React()
  const toVoteAll = useCallback(
    async (addressList: any, amountList: any) => {
      if (!account) throw new Error('none account')
      if (!contract) throw new Error('none contract')
      const args = [addressList, amountList]
      const method = conFnNameEnum.BatchVoteForGaugeWeights
      return contract.estimateGas[method](...args, { from: account }).then(estimatedGasLimit => {
        return contract[method](...args, {
          gasLimit: calculateGasMargin(estimatedGasLimit),
          // gasLimit: '3500000',
          from: account
        }).then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Refresh All`,
            actionTag: {
              recipient: `${account}-${conFnNameEnum.BatchVoteForGaugeWeights}`
            }
          })
          return response.hash
        })
      })
    },
    [account, addTransaction, contract]
  )
  return {
    toVoteAll
  }
}
