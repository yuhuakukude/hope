import React, { useState, useMemo, useCallback, useEffect, useRef, RefObject } from 'react'
import styled from 'styled-components'
import { AutoColumn } from '../../components/Column'
import LockerEcharts from './component/echarts'
import NumericalInput from '../../components/NumericalInput'
import { DatePicker } from 'antd'
import moment from 'moment'
import momentTz from 'moment-timezone'
import format from '../../utils/format'
import ActionButton from '../../components/Button/ActionButton'
import { ButtonPrimary } from '../../components/Button'
import './index.scss'
import TransactionConfirmationModal, { TransactionErrorContent } from '../../components/TransactionConfirmationModal'

import { ethers } from 'ethers'
import { TransactionResponse } from '@ethersproject/providers'
import { useActiveWeb3React } from '../../hooks'
import { LT, VELT, PERMIT2_ADDRESS, VELT_TOKEN_ADDRESS } from '../../constants'
import { tryParseAmount } from '../../state/swap/hooks'
import { Token, TokenAmount } from '@uniswap/sdk'
import { useTokenBalance } from '../../state/wallet/hooks'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { useLocker, useToLocker, conFnNameEnum, useToWithdraw } from '../../hooks/ahp/useLocker'
import { getPermitData, Permit, PERMIT_EXPIRATION, toDeadline } from '../../permit2/domain'
import AddAmount from './component/AddAmount'
import AddTime from './component/AddTime'
import LockerBanner from './component/Banner'
import { useWalletModalToggle } from '../../state/application/hooks'
import { useEstimate } from '../../hooks/ahp'
import { useActionPending } from '../../state/transactions/hooks'
import LtIcon from '../../assets/images/ahp/lt.png'

const PageWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 0 30px;
  max-width: 1340px;
  min-width: 1210px;
`

enum ACTION {
  LOCKER,
  WITHDRAW
}

export default function DaoLocker() {
  const [addTabIndex, setAddTabIndex] = useState('amount')
  const [amount, setAmount] = useState('')
  const [lockerDate, setLockerDate] = useState<any>('')
  const [dateIndex, setDateIndex] = useState<number | string>()
  const [txHash, setTxHash] = useState<string>('')
  const toggleWalletModal = useWalletModalToggle()
  const [pendingText, setPendingText] = useState('')
  const [actionType, setActionType] = useState(ACTION.LOCKER)
  const [withdrawPendingText, setWithdrawPendingText] = useState('')
  const [errorStatus, setErrorStatus] = useState<{ code: number; message: string } | undefined>()
  const lockerRef = useRef<HTMLInputElement>()
  const dateList = [
    { type: 'week', label: '≈2 Week', value: 2 },
    { type: 'month', label: '≈6 Months', value: 26 },
    { type: 'year', label: '≈1 Years', value: 52 },
    { type: 'years', label: '≈4 Years', value: 208 }
  ]

  const { account, chainId, library } = useActiveWeb3React()

  const isEthBalanceInsufficient = useEstimate()
  const ltBalance = useTokenBalance(account ?? undefined, LT[chainId ?? 1])
  const veltBalance = useTokenBalance(account ?? undefined, VELT[chainId ?? 1])
  const inputAmount = tryParseAmount(amount, LT[chainId ?? 1]) as TokenAmount | undefined
  const { pending: isLockerPending } = useActionPending(account ? `${account}-${conFnNameEnum.CreateLock}` : '')

  // token api
  const [approvalState, approveCallback] = useApproveCallback(inputAmount, PERMIT2_ADDRESS[chainId ?? 1])
  const [curToken, setCurToken] = useState<Token | undefined>(LT[chainId ?? 1])

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm

  // token
  const { lockerRes } = useLocker()
  const { toLocker, getVeLtAmount } = useToLocker()
  const { toWithdraw } = useToWithdraw()

  const getLockerTime = (val: number) => {
    const weekDate = moment().day() === 0 ? 7 : moment().day()
    let week4
    if (weekDate >= 4) {
      week4 = moment()
        .subtract(weekDate - 4, 'day')
        .format('YYYY-MM-DD')
    } else {
      week4 = moment()
        .subtract(7 - 4 + weekDate, 'day')
        .format('YYYY-MM-DD')
    }
    return moment(week4).add(val, 'week')
  }

  const changeDateIndex = useCallback((val: number) => {
    const time = getLockerTime(val)
    setLockerDate(moment(time))
    setDateIndex(val)
  }, [])

  const disabledDate = (current: any) =>
    (current && moment(current).day() !== 4) ||
    current < moment().endOf('day') ||
    moment(current).diff(moment(), 'day') <= 7 ||
    moment(current).isAfter(moment(getLockerTime(208)))

  const onDateChange = (date: any, dateString: any) => {
    setLockerDate(moment(dateString))
    setDateIndex('')
  }

  const maxInputFn = () => {
    const balance = ltBalance?.toFixed(2)
    const resAmount = balance?.toString().replace(/(?:\.0*|(\.\d+?)0+)$/, '$1') || '0'
    setAmount(resAmount)
  }
  const lockTimeArg = useMemo(() => {
    if (!lockerDate) {
      return undefined
    }
    return momentTz(lockerDate)
      .tz('Africa/Bissau', true)
      .unix()
  }, [lockerDate])

  const veLtAmount = useMemo(() => {
    if (!lockTimeArg || !amount) return undefined
    return getVeLtAmount(amount, format.formatDate(lockTimeArg))
  }, [amount, getVeLtAmount, lockTimeArg])

  const maxWeek = useMemo(() => {
    if (!lockerRes?.end) {
      return 0
    }
    const maxEndTime = moment(
      moment()
        .utc()
        .add(4 * 365, 'days')
    )
    const lastEndTime = format.formatDate(Number(`${lockerRes?.end}`), 'YYYY-MM-DD')
    const todayDiffEnd = moment(maxEndTime).diff(moment(lastEndTime), 'days')
    console.log(maxEndTime.format('YYYY-MM-DD'), lastEndTime, todayDiffEnd)
    return Math.floor(todayDiffEnd / 7)
  }, [lockerRes])

  const isMaxDisabled = useMemo(() => {
    let flag = false
    if (amount && ltBalance) {
      const payAmout = (tryParseAmount(amount, LT[chainId ?? 1]) as TokenAmount | undefined) || ''
      flag = ltBalance?.lessThan(payAmout)
    }
    return flag
  }, [amount, ltBalance, chainId])

  const isWithDraw = useMemo(() => {
    return lockerRes?.end === '--' && lockerRes?.amount
  }, [lockerRes])

  const actionText = useMemo(() => {
    if (lockerRes?.end === '--' && lockerRes?.amount) {
      return `Withdraw First Before Relock`
    } else if (isMaxDisabled) {
      return `Insufficient LT balance`
    } else if (!inputAmount || !lockerDate) {
      return `Enter Amount & Date`
    } else {
      return approvalState === ApprovalState.NOT_APPROVED ? 'Approve LT' : 'Lock'
    }
  }, [isMaxDisabled, inputAmount, lockerDate, approvalState, lockerRes])

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

  const onTxStart = useCallback(() => {
    setShowConfirm(true)
    setAttemptingTxn(true)
  }, [])

  const onTxSubmitted = useCallback((hash: string | undefined) => {
    setShowConfirm(true)
    setPendingText(``)
    setAttemptingTxn(false)
    hash && setTxHash(hash)
  }, [])

  const onTxError = useCallback(error => {
    setShowConfirm(true)
    setTxHash('')
    setPendingText(``)
    setAttemptingTxn(false)
    setErrorStatus({ code: error?.code, message: error.message })
  }, [])

  const onApprove = useCallback(() => {
    setActionType(ACTION.LOCKER)
    setCurToken(undefined)
    onTxStart()
    setPendingText(`Approve LT`)
    approveCallback()
      .then((response: TransactionResponse | undefined) => {
        onTxSubmitted(response?.hash)
      })
      .catch(error => {
        onTxError(error)
      })
  }, [approveCallback, onTxError, onTxStart, onTxSubmitted])

  const lockerCallback = useCallback(async () => {
    if (!account || !inputAmount || !library || !chainId || !lockTimeArg) return
    setCurToken(VELT[chainId ?? 1])
    setPendingText(`Lock LT`)
    onTxStart()
    setActionType(ACTION.LOCKER)

    const deadline = toDeadline(PERMIT_EXPIRATION)
    const nonce = ethers.utils.randomBytes(32)
    const permit: Permit = {
      permitted: {
        token: LT[chainId ?? 1].address,
        amount: inputAmount.raw.toString()
      },
      nonce: nonce,
      spender: VELT_TOKEN_ADDRESS[chainId ?? 1] || '',
      deadline
    }

    const { domain, types, values } = getPermitData(permit, PERMIT2_ADDRESS[chainId ?? 1], chainId)
    library
      .getSigner(account)
      ._signTypedData(domain, types, values)
      .then(signature => {
        setPendingText(
          `Lock ${veLtAmount
            ?.toFixed(2, { groupSeparator: ',' })
            .toString()} veLT with ${inputAmount.toSignificant()} LT`
        )
        toLocker(inputAmount, lockTimeArg, nonce, deadline, signature, veLtAmount)
          .then(hash => {
            onTxSubmitted(hash)
            setAmount('')
            setLockerDate('')
            setDateIndex('')
          })
          .catch((error: any) => {
            onTxError(error)
            throw error
          })
      })
      .catch(error => {
        onTxError(error)
        throw error
      })
  }, [account, inputAmount, library, chainId, veLtAmount, lockTimeArg, toLocker, onTxStart, onTxSubmitted, onTxError])

  const toWithdrawCallback = useCallback(async () => {
    if (!account) return
    setCurToken(LT[chainId ?? 1])
    onTxStart()
    setActionType(ACTION.WITHDRAW)
    setWithdrawPendingText('Withdraw LT')
    toWithdraw(lockerRes?.amount ? lockerRes?.amount.toFixed(2, { groupSeparator: ',' } ?? '0.00') : '0.00')
      .then(hash => {
        setWithdrawPendingText('')
        onTxSubmitted(hash)
      })
      .catch((error: any) => {
        setWithdrawPendingText('')
        onTxError(error)
      })
  }, [account, chainId, lockerRes, onTxError, onTxStart, onTxSubmitted, toWithdraw])

  useEffect(() => {
    changeDateIndex(2)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <PageWrapper>
        <TransactionConfirmationModal
          isOpen={showConfirm}
          onDismiss={() => setShowConfirm(false)}
          attemptingTxn={attemptingTxn}
          hash={txHash}
          content={confirmationContent}
          pendingText={actionType === ACTION.WITHDRAW ? withdrawPendingText : pendingText}
          currencyToAdd={curToken}
        />
        <div className="dao-locker-page">
          <LockerBanner></LockerBanner>
          <div className="content-box m-t-30" ref={lockerRef as RefObject<HTMLInputElement>}>
            <div className="action-box m-t-30 flex jc-between">
              <div className="l flex-3 p-30">
                <LockerEcharts></LockerEcharts>
              </div>
              <div className="r m-l-30 flex-2 p-30">
                <h3 className="text-medium font-20"> Locking LT</h3>
                {account && (
                  <div className="ava-balance m-t-30">
                    <p className="flex jc-between ai-center font-nor">
                      <span className="text-normal">My LT Balance</span>
                      <span className="text-medium">
                        {ltBalance?.toFixed(2, { groupSeparator: ',' } ?? '0.00') || '0.00'} LT
                      </span>
                    </p>
                    <p className="flex jc-between ai-center font-nor m-t-16">
                      <span className="text-normal">My LT Locked</span>
                      <p className="flex ai-center">
                        <span className="text-medium">
                          {lockerRes?.amount ? lockerRes?.amount.toFixed(2, { groupSeparator: ',' } ?? '0.00') : '0.00'}{' '}
                          LT
                        </span>
                        {isWithDraw && !withdrawPendingText && (
                          <span
                            className="withdraw text-medium text-primary font-24 m-l-16"
                            onClick={toWithdrawCallback}
                          >
                            Withdraw
                          </span>
                        )}
                      </p>
                    </p>
                    {lockerRes?.end && lockerRes?.end !== '--' && (
                      <p className="flex jc-between ai-center font-nor m-t-16">
                        <span className="text-normal">Locked Until :</span>
                        <span className="text-medium">
                          {format.formatUTCDate(Number(`${lockerRes?.end}`), 'YYYY-MM-DD')}
                        </span>
                      </p>
                    )}
                  </div>
                )}
                {lockerRes?.end && lockerRes?.end !== '--' ? (
                  <div className="add-action-box m-t-30">
                    <div className="add-ava">
                      <p className="flex jc-between font-nor">
                        <span className="text-normal">Balance in Voting Escrow :</span>
                        <span className="text-medium">
                          {veltBalance?.toFixed(2, { groupSeparator: ',' } ?? '0.00', 0) || '0.00'} veLT
                        </span>
                      </p>
                    </div>
                    <div
                      className={['add-tab', 'flex', 'm-t-30', addTabIndex === 'time' ? 'time-active' : ''].join(' ')}
                    >
                      <div
                        className={[
                          'item-tab',
                          'flex-1',
                          'font-nor',
                          'text-medium',
                          addTabIndex === 'amount' ? 'active' : ''
                        ].join(' ')}
                        onClick={() => setAddTabIndex('amount')}
                      >
                        Add Lock Amount
                      </div>
                      <div
                        className={[
                          'item-tab',
                          'flex-1',
                          'font-nor',
                          'text-medium',
                          addTabIndex === 'time' ? 'active' : ''
                        ].join(' ')}
                        onClick={() => setAddTabIndex('time')}
                      >
                        Increase Lock Time
                      </div>
                    </div>
                    {addTabIndex === 'amount' && <AddAmount></AddAmount>}
                    {addTabIndex === 'time' && <AddTime maxWeek={maxWeek}></AddTime>}
                  </div>
                ) : (
                  <div className="locker-box m-t-30">
                    <div className="amout-box">
                      <p className="flex jc-between font-nor">
                        <span className="text-normal">Lock Amount</span>
                        {account && (
                          <span className="text-normal">
                            Available: {ltBalance?.toFixed(2, { groupSeparator: ',' } ?? '0.00') || '0.00'} LT{' '}
                            <span className="text-primary cursor-select m-l-8" onClick={maxInputFn}>
                              Max
                            </span>
                          </span>
                        )}
                      </p>
                      <div className="inp-box m-t-12">
                        <NumericalInput
                          className={['input-amount', isMaxDisabled ? 'error' : ''].join(' ')}
                          value={amount}
                          decimals={2}
                          align={'right'}
                          disabled={!account || !!lockerRes?.amount}
                          onUserInput={val => {
                            setAmount(val)
                          }}
                        />
                        <div className="lt-icon-box flex ai-center">
                          <img src={LtIcon} style={{ width: '24px', height: '24px' }} alt="" />
                          <span className="m-l-12">LT</span>
                        </div>
                      </div>
                    </div>
                    <div className="date-box">
                      <p className="font-nor m-t-30 text-normal">Lock Until</p>
                      <DatePicker
                        value={lockerDate}
                        className="date-picker-tem m-t-12"
                        disabled={!account || !!lockerRes?.amount}
                        disabledDate={disabledDate}
                        onChange={onDateChange}
                        allowClear={false}
                        format="YYYY-MM-DD"
                        placeholder={account ? '0000-00-00' : ''}
                        showToday={false}
                        getCalendarContainer={(triggerNode: any) => triggerNode.parentNode}
                      />
                    </div>
                    <div className="date-btn flex jc-between m-t-30">
                      {dateList.map((item, index) => (
                        <div
                          className={dateIndex === item.value ? 'active btn-item' : 'btn-item'}
                          key={index}
                          onClick={() => changeDateIndex(item.value)}
                        >
                          <div className="text-medium">{item.label}</div>
                        </div>
                      ))}
                    </div>
                    <p className="m-t-30 font-nor flex jc-between">
                      <span className="text-normal">Your starting voting power will be:</span>
                      <span className="text-medium">
                        {veLtAmount ? veLtAmount.toFixed(2, { groupSeparator: ',' }, 0) : '0.00'} veLT
                      </span>
                    </p>
                    <div className="m-t-30">
                      {!account ? (
                        <ButtonPrimary className="hp-button-primary text-medium font-nor" onClick={toggleWalletModal}>
                          Connect Wallet
                        </ButtonPrimary>
                      ) : (
                        <ActionButton
                          error={isMaxDisabled ? 'Insufficient LT balance' : undefined}
                          pending={approvalState === ApprovalState.PENDING || !!pendingText || isLockerPending}
                          pendingText={
                            isLockerPending || approvalState === ApprovalState.PENDING
                              ? 'Pending'
                              : 'Confirm in your wallet'
                          }
                          disableAction={
                            isMaxDisabled ||
                            !inputAmount ||
                            !lockerDate ||
                            !ltBalance ||
                            lockerRes?.end !== '--' ||
                            !!lockerRes?.amount ||
                            approvalState === ApprovalState.UNKNOWN
                          }
                          actionText={actionText}
                          onAction={approvalState === ApprovalState.NOT_APPROVED ? onApprove : lockerCallback}
                        />
                      )}
                    </div>
                  </div>
                )}
                {account && isEthBalanceInsufficient && (
                  <div className="tip flex m-t-25">
                    <div className="icon m-r-15 m-t-5">
                      <i className="iconfont font-nor text-primary font-bold">&#xe614;</i>
                    </div>
                    <p className="text-normal font-nor">
                      Your wallet balance is below 0.001 ETH. The approve action require small transaction fees, so you
                      may have deposit additional funds to complete them.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    </>
  )
}
