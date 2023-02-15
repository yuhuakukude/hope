import React, { useState, useCallback } from 'react'
import Card from '../Card'
import Detail from './Detail'
import Empty from './Empty'
import List from './List'
import TitleTips from '../TitleTips'
import FeesWithdraw from '../../../../components/ahp/FeesWithdraw'
import { Token } from '@uniswap/sdk'
import { ST_HOPE } from '../../../../constants'
import { useActiveWeb3React } from '../../../../hooks'
import TransactionConfirmationModal, {
  TransactionErrorContent
} from '../../../../components/TransactionConfirmationModal'
import { useFeeClaim } from '../../../../hooks/ahp/usePortfolio'
import './index.scss'

export default function VeLTRewards() {
  const { account, chainId } = useActiveWeb3React()
  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm
  // txn values
  const [txHash, setTxHash] = useState<string>('')
  const [errorStatus, setErrorStatus] = useState<{ code: number; message: string } | undefined>()
  const [claimPendingText, setClaimPendingText] = useState('')
  const [curToken, setCurToken] = useState<Token | undefined>(ST_HOPE[chainId ?? 1])

  const { toFeeClaim } = useFeeClaim()

  const withdrawAllFn = () => {
    setTxHash('')
    setErrorStatus(undefined)
    setAttemptingTxn(false)
    setShowConfirm(true)
  }

  const onTxStart = useCallback(() => {
    setShowConfirm(true)
    setAttemptingTxn(true)
  }, [])

  const onTxSubmitted = useCallback((hash: string | undefined) => {
    setShowConfirm(true)
    setAttemptingTxn(false)
    hash && setTxHash(hash)
  }, [])

  const onTxError = useCallback(error => {
    setShowConfirm(true)
    setTxHash('')
    setAttemptingTxn(false)
    setErrorStatus({ code: error?.code, message: error.message })
  }, [])

  const feeClaimCallback = useCallback(async () => {
    if (!account) return
    setCurToken(ST_HOPE[chainId ?? 1])
    onTxStart()
    setClaimPendingText(`Fees Withdraw`)
    toFeeClaim()
      .then(hash => {
        setClaimPendingText('')
        onTxSubmitted(hash)
      })
      .catch((error: any) => {
        setClaimPendingText('')
        onTxError(error)
      })
  }, [account, chainId, onTxError, onTxStart, onTxSubmitted, toFeeClaim])

  const withdrawSubmit = useCallback(
    (type: string) => {
      if (type === 'normal') {
        console.log(type)
        feeClaimCallback()
      } else {
        // claimRewardsCallback()
      }
    },
    [feeClaimCallback]
  )

  const confirmationContent = useCallback(
    () =>
      errorStatus ? (
        <TransactionErrorContent
          errorCode={errorStatus.code}
          onDismiss={() => setShowConfirm(false)}
          message={errorStatus.message}
        />
      ) : (
        <FeesWithdraw
          onSubmit={(type: string) => {
            withdrawSubmit(type)
          }}
          onDismiss={() => setShowConfirm(false)}
          feeInfo={{}}
          feeType={''}
          withdrawType={''}
        />
      ),
    [withdrawSubmit, errorStatus]
  )
  return (
    <>
      <TransactionConfirmationModal
        isOpen={showConfirm}
        onDismiss={() => setShowConfirm(false)}
        attemptingTxn={attemptingTxn}
        hash={txHash}
        content={confirmationContent}
        pendingText={claimPendingText}
        currencyToAdd={curToken}
      />
      <div className="velt-rewards-wrap">
        <Card>
          <div className="velt-rewards-title">
            <TitleTips
              link=""
              title="veLT Rewards"
              desc="veLT holders will receive 25% of all agreed fee income as an reward, as well as a portion of the Gomboc
              fee income during the voting period if they participate in the weighted vote of a Gomboc."
            />
          </div>
          {false ? (
            <Empty />
          ) : (
            <>
              <Detail withdrawAll={withdrawAllFn} />
              <List />
            </>
          )}
        </Card>
      </div>
    </>
  )
}
