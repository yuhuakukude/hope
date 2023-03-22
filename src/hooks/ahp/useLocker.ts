import { useCallback } from 'react'
import { useSingleCallResult } from '../../state/multicall/hooks'
import { useLockerContract, useGomConContract } from '../useContract'
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
import momentTz from 'moment-timezone'

export enum conFnNameEnum {
  CreateLock = 'createLock',
  IncreaseAmount = 'increaseAmount',
  IncreaseUnlockTime = 'increaseUnlockTime'
}

export function useLocker() {
  const { account } = useActiveWeb3React()
  const lockerContract = useLockerContract()
  const gomConContract = useGomConContract()
  const lockerRes = useSingleCallResult(lockerContract, 'locked', [account ?? undefined])
  const ltTotalAmount = useSingleCallResult(lockerContract, 'supply', [])
  const veltTotalAmount = useSingleCallResult(lockerContract, 'totalSupply', [])
  const votePowerAmount = useSingleCallResult(gomConContract, 'voteUserPower', [account ?? undefined])

  return {
    lockerRes: lockerRes?.result
      ? {
          amount: lockerRes?.result?.amount > 0 ? CurrencyAmount.ether(lockerRes?.result?.amount) : undefined,
          end:
            `${lockerRes?.result?.end}` === '0' ||
            (lockerRes?.result?.end &&
              Number(lockerRes?.result?.end) <=
                momentTz()
                  .tz('Africa/Bissau', true)
                  .unix())
              ? '--'
              : `${lockerRes?.result?.end}`
        }
      : undefined,
    lockerResLoading: lockerRes.loading,
    ltTotalAmount: ltTotalAmount?.result ? CurrencyAmount.ether(ltTotalAmount?.result?.[0]) : undefined,
    veltTotalAmount: veltTotalAmount?.result ? CurrencyAmount.ether(veltTotalAmount?.result?.[0]) : undefined,
    votePowerAmount: votePowerAmount?.result ? Number(votePowerAmount?.result) : undefined,
    ltTotalAmountLoading: ltTotalAmount.loading,
    veltTotalAmountLoading: veltTotalAmount.loading,
    votePowerAmountLoading: votePowerAmount.loading
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
      const method = conFnNameEnum.CreateLock
      return contract.estimateGas[method](...args, { from: account }).then(estimatedGasLimit => {
        return contract[method](...args, {
          gasLimit: calculateGasMargin(estimatedGasLimit),
          // gasLimit: '3500000',
          from: account
        }).then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Lock ${veLtAmount
              ?.toFixed(2, { groupSeparator: ',' })
              .toString()} veLT with ${amount.toSignificant()} LT`,
            actionTag: {
              recipient: `${account}-${conFnNameEnum.CreateLock}`
            }
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
      const method = conFnNameEnum.IncreaseAmount
      console.log('args', args)
      return contract.estimateGas[method](...args, { from: account }).then(estimatedGasLimit => {
        return contract[method](...args, {
          gasLimit: calculateGasMargin(estimatedGasLimit),
          // gasLimit: '3500000',
          from: account
        }).then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Lock ${getVeLtArg
              ?.toFixed(2, { groupSeparator: ',' })
              .toString()} veLT with ${amount.toSignificant()} LT`,
            actionTag: {
              recipient: `${account}-${conFnNameEnum.IncreaseAmount}`
            }
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
      const method = conFnNameEnum.IncreaseUnlockTime
      console.log('args', args)
      return contract.estimateGas[method](...args, { from: account }).then(estimatedGasLimit => {
        return contract[method](...args, {
          gasLimit: calculateGasMargin(estimatedGasLimit),
          // gasLimit: '3500000',
          from: account
        }).then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Lock Time to ${format.formatUTCDate(argTime)}`,
            actionTag: {
              recipient: `${account}-${conFnNameEnum.IncreaseUnlockTime}`
            }
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
    const initStartDate = starDate ? moment(starDate).format('YYYY-MM-DD') : moment()
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
export function useToWithdraw() {
  const addTransaction = useTransactionAdder()
  const contract = useLockerContract()
  const { account } = useActiveWeb3React()
  const toWithdraw = useCallback(
    async (amount: any) => {
      if (!account) throw new Error('none account')
      if (!contract) throw new Error('none contract')
      const args: any = []
      const method = 'withdraw'
      return contract.estimateGas[method](...args, { from: account }).then(estimatedGasLimit => {
        return contract[method](...args, {
          gasLimit: calculateGasMargin(estimatedGasLimit),
          // gasLimit: '3500000',
          from: account
        }).then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Withdraw ${amount} LT `
          })
          return response.hash
        })
      })
    },
    [account, addTransaction, contract]
  )
  return {
    toWithdraw
  }
}
