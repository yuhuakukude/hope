import { useCallback } from 'react'
import { useLtMinterContract, usePoolGomContract, useFeeDisContract, useGomFeeDisContract } from '../useContract'
import { useActiveWeb3React } from '../index'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { calculateGasMargin } from '../../utils'
import { TransactionResponse } from '@ethersproject/providers'
import { Decimal } from 'decimal.js'
import format from '../../utils/format'
import { CurrencyAmount } from '@uniswap/sdk'
import { useSingleCallResult } from '../../state/multicall/hooks'

export function usePortfolio() {
  const { account } = useActiveWeb3React()
  const contract = useFeeDisContract()
  const claimableFees = useSingleCallResult(contract, 'claimableToken', [account ?? undefined])
  return {
    claimableFees: claimableFees?.result ? CurrencyAmount.ether(claimableFees?.result?.[0]) : undefined
  }
}

export function useToClaim() {
  const addTransaction = useTransactionAdder()
  const contract = useLtMinterContract()
  const { account } = useActiveWeb3React()
  const toClaim = useCallback(
    async (address: string | string[]) => {
      if (!account) throw new Error('none account')
      if (!contract) throw new Error('none contract')
      // const args = Array.isArray(address) ? address : [address]
      const method = Array.isArray(address) ? 'mintMany' : 'mint'
      return contract.estimateGas[method](address, { from: account }).then(estimatedGasLimit => {
        return contract[method](address, {
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
    async (amount: string | number) => {
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
            summary: `Fees Withdraw ${amount} stHOPE`
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
    async (address: string, amount: string | number) => {
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
            summary: `Fees Withdraw ${amount} stHOPE`
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
    async (addressArr: any, amount: string | number) => {
      if (!account) throw new Error('none account')
      if (!contract) throw new Error('none contract')
      const args = [addressArr, account]
      const method = 'claimManyGauge'
      return contract.estimateGas[method](...args, { from: account }).then(estimatedGasLimit => {
        return contract[method](...args, {
          gasLimit: calculateGasMargin(estimatedGasLimit),
          // gasLimit: '3500000',
          from: account
        }).then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Fees Withdraw ${amount} stHOPE`
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

export function toUsdPrice(val: any, price: string | number) {
  if (isNaN(val)) {
    return val
  }
  let res = '0.00'
  if (val && price) {
    const pr = new Decimal(val).mul(new Decimal(price)).toNumber()
    res = format.amountFormat(pr, 2)
  }
  return res
}
