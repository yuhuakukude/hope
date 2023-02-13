import React, { useState, useMemo, useCallback } from 'react'
import Modal from '../../../../components/Modal'
import { useLocker, useToLocker, conFnNameEnum } from '../../../../hooks/ahp/useLocker'
import { InputNumber } from 'antd'
import ActionButton from '../../../../components/Button/ActionButton'
import moment from 'moment'
import TransactionConfirmationModal, {
  TransactionErrorContent
} from '../../../../components/TransactionConfirmationModal'
import format from '../../../../utils/format'
import './index.scss'

import { JSBI, Token, TokenAmount } from '@uniswap/sdk'
import { useTokenBalance } from '../../../../state/wallet/hooks'
import { useActiveWeb3React } from '../../../../hooks'
import { LT, VELT } from '../../../../constants'
import { useActionPending } from '../../../../state/transactions/hooks'

export default function AddTime({
  isOpen,
  maxWeek,
  onCloseModel
}: {
  isOpen: boolean
  maxWeek: number
  onCloseModel: () => void
}) {
  const [weekNumber, setWeekNumber] = useState(2)
  const { account, chainId } = useActiveWeb3React()
  const ltBalance = useTokenBalance(account ?? undefined, LT[chainId ?? 1])
  const [txHash, setTxHash] = useState<string>('')
  const [pendingText, setPendingText] = useState('')
  const [errorStatus, setErrorStatus] = useState<{ code: number; message: string } | undefined>()
  const veltBalance = useTokenBalance(account ?? undefined, VELT[chainId ?? 1])
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
  const { toAddTimeLocker, getVeLtAmount } = useToLocker()

  function wrappedOnDismiss() {
    onCloseModel()
  }

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
    if (lockerRes?.end && weekNumber) {
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
      VELT[chainId ?? 1],
      JSBI.add(JSBI.BigInt(veltBalance?.raw.toString() ?? '0'), JSBI.BigInt(velt?.raw.toString() ?? '0'))
    )
    return res
  }, [lockerRes, argTime, chainId, veltBalance, getVeLtAmount])

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
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss}>
      <TransactionConfirmationModal
        isOpen={showConfirm}
        onDismiss={() => setShowConfirm(false)}
        attemptingTxn={attemptingTxn}
        hash={txHash}
        content={confirmationContent}
        pendingText={pendingText}
        currencyToAdd={curToken}
      />
      <div className="locker-add-amount-modal p-y-40 p-l-30 p-r-25 flex-1">
        <div className="title flex ai-center cursor-select jc-between">
          <p className="box-title font-18 text-medium">Add LT Locking Time</p>
          <i className="iconfont font-20 m-r-12" onClick={() => onCloseModel()}>
            &#xe612;
          </i>
        </div>
        <div className="desc-info">
          <div className="item m-t-40">
            <div className="label text-normal font-nor">Total LT Locked : </div>
            <div className="value font-nor flex m-t-12 ai-center">
              <p className="text-medium">
                {lockerRes?.amount ? lockerRes?.amount.toFixed(2, { groupSeparator: ',' } ?? '0.00') : '--'}
              </p>
              <i className="iconfont m-x-12">&#xe619;</i>
              <p className="text-medium">
                {lockerRes?.amount ? lockerRes?.amount.toFixed(2, { groupSeparator: ',' } ?? '0.00') : '--'}
              </p>
            </div>
          </div>
          <div className="item m-t-20">
            <div className="label text-normal font-nor">Total veLT Amount : </div>
            <div className="value font-nor flex m-t-12 ai-center">
              <p className="text-medium">{veltBalance?.toFixed(2, { groupSeparator: ',' } ?? '0.00') || '--'}</p>
              <i className="iconfont m-x-12">&#xe619;</i>
              <p className="text-medium text-primary">
                {afterVeLtAmount ? afterVeLtAmount.toFixed(2, { groupSeparator: ',' } ?? '0.00') : '--'}
              </p>
            </div>
          </div>
          <div className="item m-t-20">
            <div className="label text-normal font-nor">Unlock Time : </div>
            <div className="value font-nor flex m-t-12 ai-center">
              <p className="text-medium">{format.formatUTCDate(Number(`${lockerRes?.end}`))} (UTC)</p>
              <i className="iconfont m-x-12">&#xe619;</i>
              <p className="text-medium text-primary">{argTime ? format.formatUTCDate(argTime) : '--'} (UTC)</p>
            </div>
          </div>
        </div>
        <div className="time-box m-t-50">
          <p className="font-nor text-normal">Change Locking Time</p>
          <p className="font-nor text-normal text-center m-t-30">The maximum increase is {maxWeek} weeks</p>
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
        </div>
        <div className="m-t-30">
          <ActionButton
            pending={!!pendingText || isLocerkTimePending}
            pendingText={isLocerkTimePending ? 'Pending' : 'Confirm in your wallet'}
            disableAction={!weekNumber || weekNumber < 2 || !ltBalance}
            actionText="Submit"
            onAction={lockerCallback}
          />
        </div>
      </div>
    </Modal>
  )
}
