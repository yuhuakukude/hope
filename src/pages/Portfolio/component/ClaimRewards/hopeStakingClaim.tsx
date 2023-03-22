import React, { useCallback, useEffect, useState } from 'react'
import TransactionConfirmationModal, {
  TransactionErrorContent
} from '../../../../components/TransactionConfirmationModal'
import { Token } from '@uniswap/sdk'
import { useToClaim } from '../../../../hooks/ahp/usePortfolio'
import { useActiveWeb3React } from 'hooks'
import { formatMessage } from '../../../../utils/format'
import { getLTToken, getHOPEToken, getStakingHopeGaugeAddress } from 'utils/addressHelpers'

export default function ClaimRewards({ item, clearItem }: { item: any; clearItem: () => void }) {
  const { account, chainId } = useActiveWeb3React()
  const [txHash, setTxHash] = useState<string>('')
  const [errorStatus, setErrorStatus] = useState<{ code: number; message: string } | undefined>()
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [curToken, setCurToken] = useState<Token | undefined>(getHOPEToken(chainId))

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
    setErrorStatus({ code: error?.code, message: formatMessage(error) ?? error.message })
  }, [])

  const [claimPendingText, setPendingText] = useState('')
  const { toClaim } = useToClaim()

  const claimCallback = useCallback(async () => {
    if (!account || !item) return
    setCurToken(getLTToken(chainId))
    onTxStart()
    setPendingText(`claim Rewards`)
    toClaim(getStakingHopeGaugeAddress(chainId))
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
