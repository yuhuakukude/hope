import React, { useCallback, useEffect, useState } from 'react'
import TransactionConfirmationModal, {
  TransactionErrorContent
} from '../../../../components/TransactionConfirmationModal'
import { Token, TokenAmount } from '@uniswap/sdk'
import { useToClaim } from '../../../../hooks/ahp/usePortfolio'
import { useActiveWeb3React } from 'hooks'
import GaugeClaimAll from 'components/ahp/GaugeClaimAll'
import { formatMessage } from '../../../../utils/format'
import { getHOPEToken, getLTToken } from 'utils/addressHelpers'

export default function ClaimRewards({
  item,
  clearItem,
  totalVal,
  ltPrice
}: {
  item: any
  clearItem: () => void
  totalVal: TokenAmount
  ltPrice: any
}) {
  const { account, chainId } = useActiveWeb3React()
  const [txHash, setTxHash] = useState<string>('')
  const [errorStatus, setErrorStatus] = useState<{ code: number; message: string } | undefined>()
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [curToken, setCurToken] = useState<Token | undefined>(getHOPEToken(chainId))

  useEffect(() => {
    if (!item) {
      return
    }
    setTxHash('')
    setErrorStatus(undefined)
    setAttemptingTxn(false)
    setShowConfirm(true)
  }, [item])

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

  const claimAllCallback = useCallback(async () => {
    if (!account || !Array.isArray(item)) return
    setCurToken(getLTToken(chainId))
    onTxStart()
    setPendingText(`claim all Rewards`)
    toClaim(item.map(i => i.gauge))
      .then(hash => {
        setPendingText('')
        onTxSubmitted(hash)
      })
      .catch((error: any) => {
        setPendingText('')
        onTxError(error)
      })
  }, [account, chainId, onTxError, onTxStart, onTxSubmitted, toClaim, item])

  const onDismiss = useCallback(() => {
    setShowConfirm(false)
    clearItem()
  }, [clearItem])

  const confirmationContent = useCallback(
    () =>
      errorStatus ? (
        <TransactionErrorContent errorCode={errorStatus.code} onDismiss={onDismiss} message={errorStatus.message} />
      ) : (
        <GaugeClaimAll
          ltPrice={ltPrice}
          total={totalVal}
          onSubmit={claimAllCallback}
          onDismiss={onDismiss}
          list={item}
        />
      ),
    [errorStatus, onDismiss, item, claimAllCallback, totalVal, ltPrice]
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
