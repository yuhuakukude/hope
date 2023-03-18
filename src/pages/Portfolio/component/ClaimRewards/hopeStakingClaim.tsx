import React, { useCallback, useEffect, useState } from 'react'
import TransactionConfirmationModal, {
  TransactionErrorContent
} from '../../../../components/TransactionConfirmationModal'
import { Token } from '@uniswap/sdk'
import { useToClaim } from '../../../../hooks/ahp/usePortfolio'
import { LT, HOPE, STAKING_HOPE_GAUGE_ADDRESS } from '../../../../constants'
import { useActiveWeb3React } from 'hooks'

export default function ClaimRewards({ item, clearItem }: { item: any; clearItem: () => void }) {
  const { account, chainId } = useActiveWeb3React()
  const [txHash, setTxHash] = useState<string>('')
  const [errorStatus, setErrorStatus] = useState<{ code: number; message: string } | undefined>()
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [curToken, setCurToken] = useState<Token | undefined>(HOPE[chainId ?? 1])

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

  const [claimPendingText, setPendingText] = useState('')
  const { toClaim } = useToClaim()

  const claimCallback = useCallback(async () => {
    if (!account || !item) return
    setCurToken(LT[chainId ?? 1])
    onTxStart()
    setPendingText(`claim Rewards`)
    console.log(STAKING_HOPE_GAUGE_ADDRESS[chainId ?? 1])
    toClaim(STAKING_HOPE_GAUGE_ADDRESS[chainId ?? 1])
      .then(hash => {
        setPendingText('')
        onTxSubmitted(hash)
      })
      .catch((error: any) => {
        setPendingText('')
        onTxError(error)
      })
  }, [account, chainId, onTxError, onTxStart, onTxSubmitted, toClaim, item])

  useEffect(() => {
    if (!item) {
      return
    }
    setTxHash('')
    setErrorStatus(undefined)
    claimCallback()
  }, [item, claimCallback])

  const onDismiss = useCallback(() => {
    setShowConfirm(false)
    clearItem()
  }, [clearItem])

  const confirmationContent = useCallback(
    () =>
      errorStatus && (
        <TransactionErrorContent errorCode={errorStatus.code} onDismiss={onDismiss} message={errorStatus.message} />
      ),
    [errorStatus, onDismiss]
  )

  return (
    <TransactionConfirmationModal
      isOpen={showConfirm}
      onDismiss={onDismiss}
      attemptingTxn={attemptingTxn}
      hash={txHash}
      content={confirmationContent}
      pendingText={claimPendingText}
      currencyToAdd={curToken}
    />
  )
}
