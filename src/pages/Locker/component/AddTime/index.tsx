import React, { useState, useMemo, useCallback } from 'react'
import { useLocker, useToLocker, conFnNameEnum } from '../../../../hooks/ahp/useLocker'
import { InputNumber } from 'antd'
import ActionButton from '../../../../components/Button/ActionButton'
import moment from 'moment'
import TransactionConfirmationModal, {
  TransactionErrorContent
} from '../../../../components/TransactionConfirmationModal'
import format, { formatMessage } from '../../../../utils/format'
import './index.scss'
import Skeleton from '../../../../components/Skeleton'

import { JSBI, Token, TokenAmount } from '@uniswap/sdk'
import { useTokenBalance } from '../../../../state/wallet/hooks'
import { useActiveWeb3React } from '../../../../hooks'
import { useActionPending } from '../../../../state/transactions/hooks'
import { getLTToken, getVELTToken } from 'utils/addressHelpers'

export default function AddTime({ maxWeek }: { maxWeek: number }) {
  const [weekNumber, setWeekNumber] = useState(maxWeek < 2 ? 0 : 2)
  const { account, chainId } = useActiveWeb3React()
  const ltToken = useMemo(() => getLTToken(chainId), [chainId])
  const veltToken = useMemo(() => getVELTToken(chainId), [chainId])
  const ltBalance = useTokenBalance(account ?? undefined, ltToken)
  const [txHash, setTxHash] = useState<string>('')
  const [pendingText, setPendingText] = useState('')
  const [errorStatus, setErrorStatus] = useState<{ code: number; message: string } | undefined>()
  const veltBalance = useTokenBalance(account ?? undefined, veltToken)
  const { pending: isLocerkTimePending } = useActionPending(
    account ? `${account}-${conFnNameEnum.IncreaseUnlockTime}` : ''
  )
  const { pending: isLocerkAmountPending } = useActionPending(
    account ? `${account}-${conFnNameEnum.IncreaseAmount}` : ''
  )

  // token api
  const [curToken, setCurToken] = useState<Token | undefined>(ltToken)

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm

  // token
  const { lockerRes, lockerResLoading } = useLocker()
  const { toAddTimeLocker, getVeLtAmount } = useToLocker()

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

  const afterVeLtAmount = useMemo(() => {
    if (!argTime || !lockerRes?.amount) {
      return undefined
    }
    const velt = getVeLtAmount(
      lockerRes?.amount.toFixed(2) ?? '0',
      format.formatDate(Number(`${argTime}`), 'YYYY-MM-DD'),
      format.formatDate(Number(`${lockerRes?.end}`))
    )
    const res = new TokenAmount(
      getVELTToken(chainId),
      JSBI.add(JSBI.BigInt(veltBalance?.raw.toString() ?? '0'), JSBI.BigInt(velt?.raw.toString() ?? '0'))
    )
    return res
  }, [lockerRes, chainId, veltBalance, argTime, getVeLtAmount])

  const lockerCallback = useCallback(async () => {
    if (!account || !chainId) return
    setCurToken(getVELTToken(chainId))
    setPendingText(`Lock LT`)
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
        setErrorStatus({ code: err?.code, message: formatMessage(err) ?? err.message })
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
        isToGauge={true}
      />
      <div className="locker-add-amount-modal flex-1">
        <div className="time-box m-t-30">
          <p className="font-nor text-normal text-center">
            <Skeleton loading={lockerResLoading} width={265}>
              The max. duration you can add is {maxWeek >= 2 ? maxWeek : 0} weeks
            </Skeleton>
          </p>

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
          <div className="m-t-25">
            {/* <p className="font-nor text-normal text-center m-t-30">
              new unlock date is {argTime ? format.formatUTCDate(argTime) : '--'} (UTC)
            </p> */}
            <p className="font-nor flex jc-between ai-center">
              <span className="text-normal">New unlock date will be:</span>
              <Skeleton loading={lockerResLoading} width={160}>
                <span className="text-medium">
                  {argTime
                    ? format.formatUTCDate(argTime)
                    : format.formatUTCDate(Number(`${lockerRes?.end}`), 'YYYY-MM-DD')}{' '}
                  (UTC)
                </span>
              </Skeleton>
            </p>
            <p className="font-nor flex jc-between ai-center m-t-16">
              <span className="text-normal">Your voting power after the lock will be:</span>
              <Skeleton loading={lockerResLoading} width={160}>
                <span className="text-medium">
                  {afterVeLtAmount
                    ? afterVeLtAmount.toFixed(2, { groupSeparator: ',' } ?? '0.00')
                    : veltBalance?.toFixed(2, { groupSeparator: ',' } ?? '0.00') || '--'}{' '}
                  veLT
                </span>
              </Skeleton>
            </p>
          </div>
        </div>
        <div className="m-t-50">
          <ActionButton
            pending={!!pendingText || isLocerkTimePending || isLocerkAmountPending}
            pendingText={isLocerkTimePending || isLocerkAmountPending ? 'Pending' : 'Confirm in your wallet'}
            disableAction={!weekNumber || weekNumber < 2 || maxWeek < 2 || !ltBalance}
            actionText="Increase"
            onAction={lockerCallback}
          />
        </div>
      </div>
    </div>
  )
}
