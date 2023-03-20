import React, { useState, useMemo, useCallback } from 'react'
import { useLocker, useToLocker, conFnNameEnum } from '../../../../hooks/ahp/useLocker'
import NumericalInput from '../../../../components/NumericalInput'
import ActionButton from '../../../../components/Button/ActionButton'
import format, {formatMessage} from '../../../../utils/format'
import LtIcon from '../../../../assets/images/ahp/lt.png'
import TransactionConfirmationModal, {
  TransactionErrorContent
} from '../../../../components/TransactionConfirmationModal'
import './index.scss'
import { Decimal } from 'decimal.js'

import { ethers } from 'ethers'
import { TransactionResponse } from '@ethersproject/providers'
import { useTokenBalance } from '../../../../state/wallet/hooks'
import { JSBI, Token, TokenAmount } from '@uniswap/sdk'
import { useActiveWeb3React } from '../../../../hooks'
import { tryParseAmount } from '../../../../state/swap/hooks'
import { useActionPending } from '../../../../state/transactions/hooks'
import { LT, VELT, PERMIT2_ADDRESS, VELT_TOKEN_ADDRESS } from '../../../../constants'
import { ApprovalState, useApproveCallback } from '../../../../hooks/useApproveCallback'
import { getPermitData, Permit, PERMIT_EXPIRATION, toDeadline } from '../../../../permit2/domain'

export default function AddAmount() {
  const [amount, setAmount] = useState('')
  const { account, chainId, library } = useActiveWeb3React()
  const ltBalance = useTokenBalance(account ?? undefined, LT[chainId ?? 1])
  const inputAmount = tryParseAmount(amount, LT[chainId ?? 1]) as TokenAmount | undefined
  const [txHash, setTxHash] = useState<string>('')
  const [pendingText, setPendingText] = useState('')
  const [errorStatus, setErrorStatus] = useState<{ code: number; message: string } | undefined>()
  const veltBalance = useTokenBalance(account ?? undefined, VELT[chainId ?? 1])
  const { pending: isLocerkAmountPending } = useActionPending(
    account ? `${account}-${conFnNameEnum.IncreaseAmount}` : ''
  )
  const { pending: isLocerkTimePending } = useActionPending(
    account ? `${account}-${conFnNameEnum.IncreaseUnlockTime}` : ''
  )

  // token api
  const [approvalState, approveCallback] = useApproveCallback(inputAmount, PERMIT2_ADDRESS[chainId ?? 1])
  const [curToken, setCurToken] = useState<Token | undefined>(LT[chainId ?? 1])

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm

  // token
  const { lockerRes } = useLocker()
  const { toAddAmountLocker, getVeLtAmount } = useToLocker()

  const isMaxDisabled = useMemo(() => {
    let flag = false
    if (amount && ltBalance) {
      const payAmout = (tryParseAmount(amount, LT[chainId ?? 1]) as TokenAmount | undefined) || ''
      flag = ltBalance?.lessThan(payAmout)
    }
    return flag
  }, [amount, ltBalance, chainId])

  const afterVeLtAmount = useMemo(() => {
    if (!lockerRes?.end || lockerRes?.end === '--' || !amount) {
      return undefined
    }
    const velt = getVeLtAmount(amount, format.formatDate(Number(`${lockerRes?.end}`), 'YYYY-MM-DD'))
    const res = new TokenAmount(
      VELT[chainId ?? 1],
      JSBI.add(JSBI.BigInt(veltBalance?.raw.toString() ?? '0'), JSBI.BigInt(velt?.raw.toString() ?? '0'))
    )
    return res
  }, [amount, lockerRes, chainId, veltBalance, getVeLtAmount])

  const maxInputFn = () => {
    const balance = ltBalance?.toFixed(2)
    const resAmount = balance?.toString().replace(/(?:\.0*|(\.\d+?)0+)$/, '$1') || '0'
    setAmount(resAmount)
  }

  const actionText = useMemo(() => {
    if (isMaxDisabled) {
      return `Insufficient LT balance`
    } else if (!inputAmount) {
      return `Enter LT Amount`
    } else {
      return approvalState === ApprovalState.NOT_APPROVED ? 'Approve LT' : 'Add'
    }
  }, [isMaxDisabled, inputAmount, approvalState])

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
    setAmount('')
  }, [])

  const onTxError = useCallback(error => {
    setShowConfirm(true)
    setTxHash('')
    setPendingText(``)
    setAttemptingTxn(false)
    setErrorStatus({ code: error?.code, message: formatMessage(error) ?? error.message })
  }, [])

  const onApprove = useCallback(() => {
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
    if (!account || !inputAmount || !library || !chainId) return
    setCurToken(VELT[chainId ?? 1])
    setPendingText(`Lock LT`)
    onTxStart()

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
        const getVeLtArg = new Decimal(afterVeLtAmount?.toFixed(2) || '0')
          .sub(new Decimal(veltBalance?.toFixed(2) || '0'))
          .toNumber()
        setPendingText(`Lock ${format.amountFormat(getVeLtArg, 2)} veLT with ${inputAmount.toSignificant()} LT`)
        toAddAmountLocker(inputAmount, nonce, deadline, signature, getVeLtArg)
          .then(hash => {
            onTxSubmitted(hash)
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
  }, [
    account,
    inputAmount,
    library,
    chainId,
    onTxError,
    onTxSubmitted,
    onTxStart,
    toAddAmountLocker,
    afterVeLtAmount,
    veltBalance
  ])

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
        <div className="amout-box">
          <p className="flex jc-end font-nor m-t-40">
            <span className="text-normal">
              Available: {ltBalance?.toFixed(2, { groupSeparator: ',' } ?? '0.00') || '--'}
              <span className="text-primary cursor-select m-l-8" onClick={maxInputFn}>
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
                setAmount(val)
              }}
            />
            <div className="coin-box flex ai-center cursor-select">
              <img src={LtIcon} style={{ width: '24px', height: '24px' }} alt="" />
              <div className="currency font-nor text-medium m-l-12">LT</div>
            </div>
          </div>
          <p className="m-t-30 font-nor flex jc-between">
            <span className="text-normal">Your starting voting power will be:</span>
            <span className="text-medium">
              {afterVeLtAmount
                ? afterVeLtAmount.toFixed(2, { groupSeparator: ',' } ?? '0.00')
                : veltBalance?.toFixed(2, { groupSeparator: ',' } ?? '0.00') || '--'}{' '}
              veLT
            </span>
          </p>
        </div>
        <div className="m-t-50">
          <ActionButton
            error={isMaxDisabled ? 'Insufficient LT balance' : undefined}
            pending={
              approvalState === ApprovalState.PENDING || !!pendingText || isLocerkAmountPending || isLocerkTimePending
            }
            pendingText={
              isLocerkAmountPending || isLocerkTimePending || approvalState === ApprovalState.PENDING
                ? 'Pending'
                : 'Confirm in your wallet'
            }
            disableAction={isMaxDisabled || !inputAmount || !ltBalance || approvalState === ApprovalState.UNKNOWN}
            actionText={actionText}
            onAction={approvalState === ApprovalState.NOT_APPROVED ? onApprove : lockerCallback}
          />
        </div>
      </div>
    </div>
  )
}
