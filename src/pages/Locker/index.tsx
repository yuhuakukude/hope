import React, { useState, useMemo, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { NavLink } from 'react-router-dom'
import { AutoColumn } from '../../components/Column'
import LockerEcharts from './component/echarts'
import NumericalInput from '../../components/NumericalInput'
import { DatePicker } from 'antd'
import dayjs from 'dayjs'
import moment from 'moment'
import ActionButton from '../../components/Button/ActionButton'
import './index.scss'
import TransactionConfirmationModal, { TransactionErrorContent } from '../../components/TransactionConfirmationModal'

import { ethers } from 'ethers'
import { useActiveWeb3React } from '../../hooks'
import { LT, PERMIT2_ADDRESS, VELT_TOKEN_ADDRESS } from '../../constants'
import { tryParseAmount } from '../../state/swap/hooks'
import { Token, TokenAmount } from '@uniswap/sdk'
import { useTokenBalance } from '../../state/wallet/hooks'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { useLocker, useToLocker } from '../../hooks/ahp/useLocker'
import { getPermitData, Permit, PERMIT_EXPIRATION, toDeadline } from '../../permit2/domain'

const PageWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 30px;
`

export default function DaoLocker() {
  const [amount, setAmount] = useState('')
  const [lockerDate, setLockerDate] = useState<any>('')
  const [dateIndex, setDateIndex] = useState(2)
  const [txHash, setTxHash] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const dateList = [
    { type: 'week', label: '≈2 Week', value: 2 },
    { type: 'month', label: '≈6 Months', value: 26 },
    { type: 'year', label: '≈1 Years', value: 52 },
    { type: 'years', label: '≈4 Years', value: 208 }
  ]

  const { account, chainId, library } = useActiveWeb3React()
  const ltBalance = useTokenBalance(account ?? undefined, LT[chainId ?? 1])
  const inputAmount = tryParseAmount(amount, LT[chainId ?? 1]) as TokenAmount | undefined

  // token api
  const [approvalState, approveCallback] = useApproveCallback(inputAmount, PERMIT2_ADDRESS[chainId ?? 1])
  const [curToken, setCurToken] = useState<Token | undefined>(LT[chainId ?? 1])

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm

  // token

  const { lockerRes } = useLocker()
  const { toLocker } = useToLocker()

  const changeDateIndex = (val: any) => {
    const weekDate = dayjs().day() === 0 ? 7 : dayjs().day()
    let subNum = 0
    let week4 = dayjs()
      .add(4 - weekDate, 'day')
      .format('YYYY-MM-DD')
    if (weekDate > 4) {
      week4 = dayjs()
        .subtract(weekDate - 4, 'day')
        .format('YYYY-MM-DD')
    }
    if (weekDate > 4 && weekDate !== 7) {
      subNum = 1
    }
    const time = moment(week4).add((val - subNum) * 7, 'day')
    setLockerDate(moment(time))
    setDateIndex(val)
  }

  const disabledDate = (current: any) =>
    (current && dayjs(current).day() !== 4) ||
    current < dayjs().endOf('day') ||
    dayjs(current).diff(dayjs(), 'day') <= 7

  const onDateChange = (date: any, dateString: any) => {
    console.log(date, dateString)
    setLockerDate(dateString)
  }
  const changeAmount = (val: any) => {
    setAmount(val)
  }

  const maxInputFn = () => {
    const balance = ltBalance?.toFixed(2)
    const resAmount = balance?.toString().replace(/(?:\.0*|(\.\d+?)0+)$/, '$1') || '0'
    setAmount(resAmount)
  }

  const isMaxDisabled = useMemo(() => {
    let flag = false
    if (amount && ltBalance) {
      const payAmout = (tryParseAmount(amount, LT[chainId ?? 1]) as TokenAmount | undefined) || ''
      flag = ltBalance?.lessThan(payAmout)
    }
    return flag
  }, [amount, ltBalance, chainId])

  const actionText = useMemo(() => {
    if (isMaxDisabled) {
      return `Insufficient LT balance`
    } else if (!inputAmount || !lockerDate) {
      return `Enter Amount & Date`
    } else {
      return approvalState === ApprovalState.NOT_APPROVED ? 'Confirm in your wallet' : 'Locker'
    }
  }, [isMaxDisabled, inputAmount, lockerDate, approvalState])

  const confirmationContent = useCallback(() => {
    return errorMessage && <TransactionErrorContent onDismiss={() => setShowConfirm(false)} message={errorMessage} />
  }, [errorMessage])

  const lockerCallback = useCallback(async () => {
    if (!account || !inputAmount || !library || !chainId) return
    setCurToken(LT[chainId ?? 1])
    setShowConfirm(true)
    setAttemptingTxn(true)

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
    const signature = await library.getSigner(account)._signTypedData(domain, types, values)
    toLocker(inputAmount, lockerDate, nonce, deadline, signature)
      .then(hash => {
        setAttemptingTxn(false)
        setTxHash(hash)
        setAmount('')
      })
      .catch((err: any) => {
        setAttemptingTxn(false)
        setErrorMessage(err.message)
      })
  }, [account, inputAmount, library, chainId, lockerDate, toLocker])

  useEffect(() => {
    if (account) {
      changeDateIndex(2)
    }
  }, [account])

  return (
    <>
      <PageWrapper>
        <TransactionConfirmationModal
          isOpen={showConfirm}
          onDismiss={() => setShowConfirm(false)}
          attemptingTxn={attemptingTxn}
          hash={txHash}
          content={confirmationContent}
          pendingText={''}
          currencyToAdd={curToken}
        />
        <div className="dao-locker-page">
          <div className="banner p-30">
            <h2 className="text-medium">Lock your LT to acquire veLT</h2>
            <p className="font-nor m-t-20">
              Extra earnings & voting power{' '}
              <NavLink to={'/buy-hope'} className="link text-primary m-l-20">
                Learn more <i className="iconfont">&#xe619;</i>{' '}
              </NavLink>
            </p>
            <ul className="m-t-20">
              <li className="font-nor">- Boost liquidity mining yield up to 2.5x</li>
              <li className="font-nor">- Vote to direct liquidity mining emissions</li>
              <li className="font-nor">- Earn your share of protocol revenue</li>
            </ul>
          </div>
          <div className="tip-box flex ai-center jc-center m-t-30">
            <i className="iconfont text-primary">&#xe61e;</i>
            <p className="font-nor text-normal m-l-12">
              Your lock expires soon. You need to lock at least for two weeks in{' '}
              <a href="#getVeLt" className="text-primary">
                Locker
              </a>
            </p>
          </div>
          <div className="content-box m-t-30" id="getVeLt">
            <h3 className="text-medium font-20">My veLT</h3>
            <div className="card-box m-t-30 flex jc-between">
              <div className="item p-30">
                <p className="font-nor text-normal">My LT Balance</p>
                <p className="font-20 m-t-20 text-medium">1,023,456,789.12 LT</p>
                <p className="font-nor text-normal m-t-16">≈ $102,345.92</p>
              </div>
              <div className="item p-30">
                <p className="font-nor text-normal">My Locked LT Amount</p>
                <p className="font-20 m-t-20 text-medium">1,023,456,789.12 LT</p>
                <p className="font-nor text-normal m-t-16">≈ $102,345.92</p>
                <NavLink to={'/buy-hope'} className="link-btn text-medium text-primary font-12 m-t-20">
                  Withdraw
                </NavLink>
              </div>
              <div className="item p-30 flex jc-between">
                <div className="-l">
                  <p className="font-nor text-normal">My veLT Amount</p>
                  <p className="font-20 m-t-20 text-medium">123,456,789.12 veLT</p>
                  <p className="font-nor text-normal m-t-16">unallocated:</p>
                  <p className="font-nor text-normal m-t-12">123,456,789.12 (100.00%)</p>
                </div>
                <div className="-r m-l-20 flex ai-center">
                  <i className="iconfont font-20 cursor-select text-primary">&#xe621;</i>
                </div>
              </div>
              <div className="item p-30 flex jc-between">
                <div className="-l">
                  <p className="font-nor text-normal">Locked Until (UTC)</p>
                  <p className="font-20 m-t-20 text-medium">2024-09-10 00:00:00 </p>
                  <p className="font-nor text-normal m-t-16">Max increase: 202 weeks</p>
                </div>
                <div className="-r m-l-20 flex ai-center">
                  <i className="iconfont font-20 cursor-select text-primary">&#xe621;</i>
                </div>
              </div>
            </div>
            <div className="action-box m-t-30 flex jc-between">
              <div className="l flex-3 p-30">
                <LockerEcharts></LockerEcharts>
              </div>
              <div className="r m-l-30 flex-2 p-30">
                <h3 className="text-medium font-20">Lock LT get veLT</h3>
                <div className="amout-box">
                  <p className="flex jc-between font-nor m-t-40">
                    <span className="text-normal">Lock</span>
                    <span className="text-normal">
                      Available: {ltBalance?.toFixed(2, { groupSeparator: ',' } ?? '0.00') || '--'} LT{' '}
                      <span className="text-primary cursor-select" onClick={maxInputFn}>
                        Max
                      </span>
                    </span>
                  </p>
                  <div className="inp-box m-t-12">
                    <NumericalInput
                      className={['input-amount', isMaxDisabled && 'error'].join(' ')}
                      value={amount}
                      decimals={2}
                      align={'right'}
                      onUserInput={val => {
                        changeAmount(val)
                      }}
                    />
                    <div className="coin-box flex ai-center cursor-select">
                      <div className="hope-icon"></div>
                      <div className="currency font-nor text-medium m-l-12">LT</div>
                    </div>
                  </div>
                </div>
                <div className="date-box">
                  <p className="font-nor m-t-30 text-normal">Lock Until</p>
                  <DatePicker
                    className="date-picker-tem m-t-12"
                    disabled={!account || Number(lockerRes?.amount) > 0}
                    disabledDate={disabledDate}
                    onChange={onDateChange}
                    allowClear={false}
                    format="YYYY-MM-DD"
                    placeholder="0000-00-00"
                    showToday={false}
                  />
                </div>
                <div className="date-btn flex jc-between m-t-30">
                  {dateList.map((item, index) => (
                    <div
                      className={dateIndex === item.value ? 'active btn-item' : 'btn-item'}
                      key={index}
                      onClick={() => changeDateIndex(item.value)}
                    >
                      <div>{item.label}</div>
                    </div>
                  ))}
                </div>
                <p className="m-t-40 font-nor flex jc-between">
                  <span className="text-normal">Total voting escrow</span>
                  <span className="text-medium">0.00 veLT</span>
                </p>
                <div className="m-t-30">
                  <ActionButton
                    pending={approvalState === ApprovalState.PENDING}
                    pendingText={'Approving'}
                    disableAction={isMaxDisabled || !inputAmount || !lockerDate || !ltBalance}
                    actionText={actionText}
                    onAction={approvalState === ApprovalState.NOT_APPROVED ? approveCallback : lockerCallback}
                  />
                </div>
                {account && (
                  <div className="tip flex m-t-30">
                    <div className="icon m-r-15">
                      <i className="iconfont font-28 text-primary font-bold">&#xe614;</i>
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
