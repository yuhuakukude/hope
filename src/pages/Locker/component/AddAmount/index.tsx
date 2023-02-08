import React, { useState, useMemo, useCallback } from 'react'
import Modal from '../../../../components/Modal'
import { useLocker, useToLocker } from '../../../../hooks/ahp/useLocker'
import NumericalInput from '../../../../components/NumericalInput'
import ActionButton from '../../../../components/Button/ActionButton'
import format from '../../../../utils/format'
import TransactionConfirmationModal, {
  TransactionErrorContent
} from '../../../../components/TransactionConfirmationModal'
import './index.scss'

import { ethers } from 'ethers'
import { useTokenBalance } from '../../../../state/wallet/hooks'
import { JSBI, Token, TokenAmount } from '@uniswap/sdk'
import { useActiveWeb3React } from '../../../../hooks'
import { tryParseAmount } from '../../../../state/swap/hooks'
import { LT, VELT, PERMIT2_ADDRESS, VELT_TOKEN_ADDRESS } from '../../../../constants'
import { ApprovalState, useApproveCallback } from '../../../../hooks/useApproveCallback'
import { getPermitData, Permit, PERMIT_EXPIRATION, toDeadline } from '../../../../permit2/domain'

export default function AddAmount({ isOpen, onCloseModel }: { isOpen: boolean; onCloseModel: () => void }) {
  const [amount, setAmount] = useState('')
  const { account, chainId, library } = useActiveWeb3React()
  const ltBalance = useTokenBalance(account ?? undefined, LT[chainId ?? 1])
  const inputAmount = tryParseAmount(amount, LT[chainId ?? 1]) as TokenAmount | undefined
  const [txHash, setTxHash] = useState<string>('')
  const [errorStatus, setErrorStatus] = useState<{ code: number; message: string } | undefined>()
  const veltBalance = useTokenBalance(account ?? undefined, VELT[chainId ?? 1])

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

  const afterLtAmount = useMemo(() => {
    if (!amount || !lockerRes?.amount || !chainId) {
      return undefined
    }
    const res = new TokenAmount(
      LT[chainId ?? 1],
      JSBI.add(
        JSBI.BigInt(lockerRes?.amount.raw.toString() ?? '0'),
        JSBI.BigInt(tryParseAmount(amount, LT[chainId ?? 1])?.raw.toString() ?? '0')
      )
    )
    return res
  }, [amount, lockerRes, chainId])

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

  const changeAmount = (val: any) => {
    setAmount(val)
  }

  const actionText = useMemo(() => {
    if (isMaxDisabled) {
      return `Insufficient LT balance`
    } else if (!inputAmount) {
      return `Enter Amount`
    } else {
      return approvalState === ApprovalState.NOT_APPROVED ? 'Confirm in your wallet' : 'Locker'
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
    library
      .getSigner(account)
      ._signTypedData(domain, types, values)
      .then(signature => {
        toAddAmountLocker(inputAmount, nonce, deadline, signature)
          .then(hash => {
            setAttemptingTxn(false)
            setTxHash(hash)
            setAmount('')
            onCloseModel()
          })
          .catch((err: any) => {
            setAttemptingTxn(false)
            setErrorStatus({ code: err?.code, message: err.message })
          })
      })
      .catch(error => {
        setAttemptingTxn(false)
        setErrorStatus({ code: error?.code, message: error.message })
      })
  }, [account, inputAmount, library, chainId, toAddAmountLocker, onCloseModel])

  return (
    <Modal isOpen={isOpen} onDismiss={() => onCloseModel()}>
      <TransactionConfirmationModal
        isOpen={showConfirm}
        onDismiss={() => setShowConfirm(false)}
        attemptingTxn={attemptingTxn}
        hash={txHash}
        content={confirmationContent}
        pendingText={''}
        currencyToAdd={curToken}
      />
      <div className="locker-add-amount-modal p-y-40 p-l-30 p-r-25 flex-1">
        <div className="title flex ai-center cursor-select jc-between">
          <p className="box-title font-18 text-medium">Add LT Locking Amount</p>
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
              <p className="text-medium text-primary">{afterLtAmount ? afterLtAmount.toFixed(2) : '--'}</p>
            </div>
          </div>
          <div className="item m-t-20">
            <div className="label text-normal font-nor">Total veLT Amount : </div>
            <div className="value font-nor flex m-t-12 ai-center">
              <p className="text-medium">{veltBalance?.toFixed(2, { groupSeparator: ',' } ?? '0.00') || '--'}</p>
              <i className="iconfont m-x-12">&#xe619;</i>
              <p className="text-medium text-primary">{afterVeLtAmount ? afterVeLtAmount.toFixed(2) : '--'}</p>
            </div>
          </div>
          <div className="item m-t-20">
            <div className="label text-normal font-nor">Unlock Time : </div>
            <div className="value font-nor flex m-t-12 ai-center">
              <p className="text-medium">{format.formatDate(Number(`${lockerRes?.end}`))} (UTC)</p>
              <i className="iconfont m-x-12">&#xe619;</i>
              <p className="text-medium">{format.formatDate(Number(`${lockerRes?.end}`))} (UTC)</p>
            </div>
          </div>
        </div>
        <div className="amout-box">
          <p className="flex jc-between font-nor m-t-40">
            <span className="text-normal">Increase Amount</span>
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
                changeAmount(val)
              }}
            />
            <div className="coin-box flex ai-center cursor-select">
              <div className="hope-icon"></div>
              <div className="currency font-nor text-medium m-l-12">LT</div>
            </div>
          </div>
        </div>
        <div className="m-t-30">
          <ActionButton
            pending={approvalState === ApprovalState.PENDING}
            pendingText={'Approving'}
            disableAction={isMaxDisabled || !inputAmount || !ltBalance}
            actionText={actionText}
            onAction={approvalState === ApprovalState.NOT_APPROVED ? approveCallback : lockerCallback}
          />
        </div>
      </div>
    </Modal>
  )
}
