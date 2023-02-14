import { useCallback } from 'react'
import { useLtMinterContract, usePoolGomContract } from '../useContract'
import { useActiveWeb3React } from '../index'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { calculateGasMargin } from '../../utils'
import { TransactionResponse } from '@ethersproject/providers'

export function useToClaim() {
  const addTransaction = useTransactionAdder()
  const contract = useLtMinterContract()
  const { account } = useActiveWeb3React()
  const toClaim = useCallback(
    async (address: string) => {
      if (!account) throw new Error('none account')
      if (!contract) throw new Error('none contract')
      const args = [address]
      const method = 'mint'
      return contract.estimateGas[method](...args, { from: account }).then(estimatedGasLimit => {
        return contract[method](...args, {
          gasLimit: calculateGasMargin(estimatedGasLimit),
          // gasLimit: '3500000',
          from: account
        }).then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Claim To Reward`
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

export function useClaimRewards(address: string) {
  const addTransaction = useTransactionAdder()
  const contract = usePoolGomContract(address)
  const { account } = useActiveWeb3React()
  const toClaimRewards = useCallback(async () => {
    if (!account) throw new Error('none account')
    if (!contract) throw new Error('none contract')
    const args: any = []
    const method = 'claimRewards'
    return contract.estimateGas[method](...args, { from: account }).then(estimatedGasLimit => {
      return contract[method](...args, {
        gasLimit: calculateGasMargin(estimatedGasLimit),
        // gasLimit: '3500000',
        from: account
      }).then((response: TransactionResponse) => {
        addTransaction(response, {
          summary: `Claim To Reward`
        })
        return response.hash
      })
    })
  }, [account, addTransaction, contract])
  return {
    toClaimRewards
  }
}
