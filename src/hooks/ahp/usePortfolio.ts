import { useCallback } from 'react'
import { useLtMinterContract, usePoolGomContract, useFeeDisContract, useGomFeeDisContract } from '../useContract'
import { useActiveWeb3React } from '../index'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { calculateGasMargin } from '../../utils'
import { TransactionResponse } from '@ethersproject/providers'
import { Decimal } from 'decimal.js'
import format from 'utils/format'

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

export function useFeeClaim() {
  const addTransaction = useTransactionAdder()
  const contract = useFeeDisContract()
  const { account } = useActiveWeb3React()
  const toFeeClaim = useCallback(
    async (amount: string) => {
      if (!account) throw new Error('none account')
      if (!contract) throw new Error('none contract')
      const args = [account]
      const method = 'claim'
      return contract.estimateGas[method](...args, { from: account }).then(estimatedGasLimit => {
        return contract[method](...args, {
          gasLimit: calculateGasMargin(estimatedGasLimit),
          // gasLimit: '3500000',
          from: account
        }).then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Fees Withdraw ${format.amountFormat(amount, 2)} stHOPE`
          })
          return response.hash
        })
      })
    },
    [account, addTransaction, contract]
  )
  return {
    toFeeClaim
  }
}

export function useGomFeeClaim() {
  const addTransaction = useTransactionAdder()
  const contract = useGomFeeDisContract()
  const { account } = useActiveWeb3React()
  const toGomFeeClaim = useCallback(
    async (address: string, amount: string) => {
      if (!account) throw new Error('none account')
      if (!contract) throw new Error('none contract')
      const args = [address, account]
      const method = 'claim'
      return contract.estimateGas[method](...args, { from: account }).then(estimatedGasLimit => {
        return contract[method](...args, {
          gasLimit: calculateGasMargin(estimatedGasLimit),
          // gasLimit: '3500000',
          from: account
        }).then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Fees Withdraw ${format.amountFormat(amount, 2)} stHOPE`
          })
          return response.hash
        })
      })
    },
    [account, addTransaction, contract]
  )
  return {
    toGomFeeClaim
  }
}

export function useGomFeeManyClaim() {
  const addTransaction = useTransactionAdder()
  const contract = useGomFeeDisContract()
  const { account } = useActiveWeb3React()
  const toGomFeeManyClaim = useCallback(
    async (addressArr: any, amount: string) => {
      if (!account) throw new Error('none account')
      if (!contract) throw new Error('none contract')
      const args = [addressArr, account]
      const method = 'claimManyGomboc'
      return contract.estimateGas[method](...args, { from: account }).then(estimatedGasLimit => {
        return contract[method](...args, {
          gasLimit: calculateGasMargin(estimatedGasLimit),
          // gasLimit: '3500000',
          from: account
        }).then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Fees Withdraw ${format.amountFormat(amount, 2)} stHOPE`
          })
          return response.hash
        })
      })
    },
    [account, addTransaction, contract]
  )
  return {
    toGomFeeManyClaim
  }
}

export function toUsdPrice(val: any, price: string) {
  let res = ''
  if (val && price) {
    const pr = new Decimal(val).mul(new Decimal(price)).toNumber()
    res = pr.toFixed(2)
  }
  return res
}
