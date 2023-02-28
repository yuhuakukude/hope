import React, { useState, useMemo, useCallback } from 'react'
import { useLocker, useToLocker, conFnNameEnum } from '../../../../hooks/ahp/useLocker'
import { InputNumber } from 'antd'
import ActionButton from '../../../../components/Button/ActionButton'
import moment from 'moment'
import TransactionConfirmationModal, {
  TransactionErrorContent
} from '../../../../components/TransactionConfirmationModal'
import format from '../../../../utils/format'
import './index.scss'

import { Token } from '@uniswap/sdk'
import { useTokenBalance } from '../../../../state/wallet/hooks'
import { useActiveWeb3React } from '../../../../hooks'
import { LT, VELT } from '../../../../constants'
import { useActionPending } from '../../../../state/transactions/hooks'

export default function AddTime({ maxWeek }: { maxWeek: number }) {
  const [weekNumber, setWeekNumber] = useState(2)
  const { account, chainId } = useActiveWeb3React()
  const ltBalance = useTokenBalance(account ?? undefined, LT[chainId ?? 1])
  const [txHash, setTxHash] = useState<string>('')
  const [pendingText, setPendingText] = useState('')
  const [errorStatus, setErrorStatus] = useState<{ code: number; message: string } | undefined>()
  const { pending: isLocerkTimePending } = useActionPending(
    account ? `${account}-${conFnNameEnum.IncreaseUnlockTime}` : ''
  )

  // token api
  const [curToken, setCurToken] = useState<Token | undefined>(LT[chainId ?? 1])

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm

  // token
  const { lockerRes } = useLocker()
  const { toAddTimeLocker } = useToLocker()

  const subWeekFn = () => {
    if (weekNumber > 2) {
      setWeekNumber(Number(weekNumber) - 1)
    }
  }
  const addWeekFn = () => {
    if (weekNumber < maxWeek) {
      setWeekNumber(Number(weekNumber) + 1)
    }
  }

  const changeWeek = (val: any) => {
    val = Number(val) || 2
    if (val < 2) {
      setWeekNumber(2)
    } else if (val > maxWeek) {
      setWeekNumber(maxWeek)
    } else {
      setWeekNumber(Math.floor(val))
    }
  }

  const isCorrect = (e: any) => {
    const code = e.which || e.keyCode
    if (code >= 48 && code <= 57) {
      return true
    } else if (code >= 96 && code <= 105) {
      // 小键盘
      return true
    } else if (code >= 37 && code <= 40) {
      // 方向箭头
      return true
    } else if (code === 8 || code === 9 || code === 46) {
      // 删除(9 46) 换行(8)
      return true
    } else {
      return e.preventDefault()
    }
  }

  const inpFormatter = (value: any) => {
    if (Number(value) > maxWeek) {
      return maxWeek
    }
    return value
  }

  const confirmationContent = useCallback(() => {
    return (
      errorStatus && (
        <TransactionErrorContent
          errorCode={errorStatus.code}
          onDismiss={() => setShowConfirm(false)}
          message={errorStatus.message}
        />
      )
    )
  }, [errorStatus])

  const argTime = useMemo(() => {
    if (lockerRes?.end !== '--' && weekNumber) {
      const endTime = format.formatDate(Number(`${lockerRes?.end}`))
      const newEndDate = moment(endTime).add(weekNumber, 'week')
      return moment(newEndDate).unix()
    }
    return null
  }, [weekNumber, lockerRes])

  const lockerCallback = useCallback(async () => {
    if (!account || !chainId) return
    setCurToken(VELT[chainId ?? 1])
    setPendingText(`Locker LT`)
    setShowConfirm(true)
    setAttemptingTxn(true)

    toAddTimeLocker(argTime)
      .then(hash => {
        setAttemptingTxn(false)
        setTxHash(hash)
        setWeekNumber(2)
        setPendingText(``)
      })
      .catch((err: any) => {
        setAttemptingTxn(false)
        setTxHash('')
        setPendingText(``)
        setErrorStatus({ code: err?.code, message: err.message })
      })
  }, [account, argTime, chainId, toAddTimeLocker])

  return (
    <div>
      <TransactionConfirmationModal
        isOpen={showConfirm}
        onDismiss={() => setShowConfirm(false)}
        attemptingTxn={attemptingTxn}
        hash={txHash}
        content={confirmationContent}
        pendingText={pendingText}
        currencyToAdd={curToken}
        isToGomboc={true}
      />
      <div className="locker-add-amount-modal flex-1">
        <div className="time-box m-t-30">
          <p className="font-nor text-normal text-center">The maximum increase is {maxWeek >= 2 ? maxWeek : 0} weeks</p>
          <div className="week-box flex ai-center jc-center m-t-26">
            <span className="font-nor text-medium">Add</span>
            <div className="week-input-box m-x-20">
              <i className={['iconfont', 'sub', weekNumber <= 2 && 'disabled'].join(' ')} onClick={subWeekFn}>
                &#xe622;
              </i>
              <InputNumber
                autoComplete="off"
                defaultValue={2}
                value={weekNumber}
                onChange={changeWeek}
                onKeyDown={isCorrect}
                formatter={inpFormatter}
              />
              <i className={['iconfont', 'add', weekNumber >= maxWeek && 'disabled'].join(' ')} onClick={addWeekFn}>
                &#xe623;
              </i>
            </div>
            <span className="font-nor text-medium">Weeks</span>
          </div>
          <p className="font-nor text-normal text-center m-t-30">
            new unlock date is {argTime ? format.formatUTCDate(argTime) : '--'} (UTC)
          </p>
        </div>
        <div className="m-t-50">
          <ActionButton
            pending={!!pendingText || isLocerkTimePending}
            pendingText={isLocerkTimePending ? 'Pending' : 'Confirm in your wallet'}
            disableAction={!weekNumber || weekNumber < 2 || maxWeek < 2 || !ltBalance}
            actionText="Increase"
            onAction={lockerCallback}
          />
        </div>
      </div>
    </div>
  )
}
