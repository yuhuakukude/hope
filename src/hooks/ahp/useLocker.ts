import { useCallback } from 'react'
import { useSingleCallResult } from '../../state/multicall/hooks'
import { useLockerContract, useLTContract } from '../useContract'
import { useActiveWeb3React } from '../index'
import { JSBI, TokenAmount } from '@uniswap/sdk'
import moment from 'moment'
import { LT, VELT } from '../../constants'
import { CurrencyAmount } from '@uniswap/sdk'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { calculateGasMargin } from '../../utils'
import { TransactionResponse } from '@ethersproject/providers'
import { tryParseAmount } from '../../state/swap/hooks'
import format from '../../utils/format'

export function useLocker() {
  const { account } = useActiveWeb3React()
  const lockerContract = useLockerContract()
  const ltContract = useLTContract()
  const lockerRes = useSingleCallResult(lockerContract, 'locked', [account ?? undefined])
  const ltTotalAmounnt = useSingleCallResult(ltContract, 'totalSupply', [])
  const veltTotalAmounnt = useSingleCallResult(lockerContract, 'totalSupply', [])
  return {
    lockerRes: lockerRes?.result
      ? {
          amount: lockerRes?.result?.amount ? CurrencyAmount.ether(lockerRes?.result?.amount) : undefined,
          end: `${lockerRes?.result?.end}` === '0' ? '--' : `${lockerRes?.result?.end}`
        }
      : undefined,
    ltTotalAmounnt: ltTotalAmounnt?.result ? CurrencyAmount.ether(ltTotalAmounnt?.result?.[0]) : undefined,
    veltTotalAmounnt: veltTotalAmounnt?.result ? CurrencyAmount.ether(veltTotalAmounnt?.result?.[0]) : undefined
  }
}

export function useToLocker() {
  const addTransaction = useTransactionAdder()
  const contract = useLockerContract()
  const { account } = useActiveWeb3React()
  const toLocker = useCallback(
    async (amount: CurrencyAmount, date: any, NONCE, DEADLINE, sigVal, veLtAmount) => {
      if (!account) throw new Error('none account')
      if (!contract) throw new Error('none contract')
      if (amount.equalTo(JSBI.BigInt('0'))) throw new Error('amount is un support')
      if (!date) throw new Error('none date')
      const args = [amount.raw.toString(), date, NONCE, DEADLINE, sigVal]
      console.log(args)
      const method = 'createLock'
      return contract.estimateGas[method](...args, { from: account }).then(estimatedGasLimit => {
        return contract[method](...args, {
          gasLimit: calculateGasMargin(estimatedGasLimit),
          // gasLimit: '3500000',
          from: account
        }).then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Locker ${veLtAmount
              ?.toFixed(2, { groupSeparator: ',' })
              .toString()} VELT with ${amount.toSignificant()} LT`
          })
          return response.hash
        })
      })
    },
    [account, addTransaction, contract]
  )
  const toAddAmountLocker = useCallback(
    async (amount: CurrencyAmount, NONCE, DEADLINE, sigVal, getVeLtArg) => {
      if (!account) throw new Error('none account')
      if (!contract) throw new Error('none contract')
      if (amount.equalTo(JSBI.BigInt('0'))) throw new Error('amount is un support')
      const args = [amount.raw.toString(), NONCE, DEADLINE, sigVal]
      const method = 'increaseAmount'
      console.log('args', args)
      return contract.estimateGas[method](...args, { from: account }).then(estimatedGasLimit => {
        return contract[method](...args, {
          gasLimit: calculateGasMargin(estimatedGasLimit),
          // gasLimit: '3500000',
          from: account
        }).then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Locker ${getVeLtArg
              ?.toFixed(2, { groupSeparator: ',' })
              .toString()} VELT with ${amount.toSignificant()} LT`
          })
          return response.hash
        })
      })
    },
    [account, addTransaction, contract]
  )
  const toAddTimeLocker = useCallback(
    async (argTime: any) => {
      if (!account) throw new Error('none account')
      if (!contract) throw new Error('none contract')
      if (!argTime) throw new Error('none Locker Time')
      const args = [argTime]
      const method = 'increaseUnlockTime'
      console.log('args', args)
      return contract.estimateGas[method](...args, { from: account }).then(estimatedGasLimit => {
        return contract[method](...args, {
          gasLimit: calculateGasMargin(estimatedGasLimit),
          // gasLimit: '3500000',
          from: account
        }).then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Lock Time to ${format.formatDate(argTime)}`
          })
          return response.hash
        })
      })
    },
    [account, addTransaction, contract]
  )

  const { chainId } = useActiveWeb3React()
  const getVeLtAmount = (amount: string, endDate: any, starDate?: any) => {
    if (!amount || !endDate || !LT || !chainId) {
      return undefined
    }
    const year = JSBI.multiply(
      JSBI.multiply(JSBI.multiply(JSBI.BigInt(365), JSBI.BigInt(24)), JSBI.BigInt(60)),
      JSBI.BigInt(60)
    )
    const initStartDate = starDate ? moment(starDate) : moment()
    const lockPeriod = moment(endDate).diff(initStartDate, 'second')
    const veltGetAmount = new TokenAmount(
      VELT[chainId ?? 1],
      JSBI.divide(
        JSBI.divide(
          JSBI.multiply(
            JSBI.BigInt(tryParseAmount(amount, LT[chainId ?? 1])?.raw.toString() ?? '0'),
            JSBI.BigInt(lockPeriod)
          ),
          year
        ),
        JSBI.BigInt(40000)
      )
    )
    return veltGetAmount
  }

  return {
    toLocker,
    toAddAmountLocker,
    toAddTimeLocker,
    getVeLtAmount
  }
}
