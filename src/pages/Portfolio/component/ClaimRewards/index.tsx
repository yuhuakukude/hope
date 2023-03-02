import React, { useCallback, useEffect, useMemo, useState } from 'react'
import TransactionConfirmationModal, {
  TransactionErrorContent
} from '../../../../components/TransactionConfirmationModal'
import { Token } from '@uniswap/sdk'
import GombocClaim from '../../../../components/ahp/GombocClaim'
import { useToClaim, useClaimRewards } from '../../../../hooks/ahp/usePortfolio'
import { STAKING_HOPE_GOMBOC_ADDRESS, LT, HOPE } from '../../../../constants'
import { useActiveWeb3React } from 'hooks'

export default function ClaimRewards<T>({ item, clearItem }: { item: T; clearItem: () => void }) {
  const { account, chainId } = useActiveWeb3React()
  const [curTableItem, setCurTableItem]: any = useState({})
  const [txHash, setTxHash] = useState<string>('')
  const [errorStatus, setErrorStatus] = useState<{ code: number; message: string } | undefined>()
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [curToken, setCurToken] = useState<Token | undefined>(HOPE[chainId ?? 1])

  useEffect(() => {
    if (!item) {
      return
    }
    setCurTableItem(item)
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
    setErrorStatus({ code: error?.code, message: error.message })
  }, [])

  const [claimPendingText, setPendingText] = useState('')
  const { toClaim } = useToClaim()

  const claimCallback = useCallback(async () => {
    if (!account) return
    setCurToken(LT[chainId ?? 1])
    onTxStart()
    setPendingText(`claim Rewards`)
    toClaim(STAKING_HOPE_GOMBOC_ADDRESS[chainId ?? 1])
      .then(hash => {
        setPendingText('')
        onTxSubmitted(hash)
      })
      .catch((error: any) => {
        setPendingText('')
        onTxError(error)
      })
  }, [account, chainId, onTxError, onTxStart, onTxSubmitted, toClaim])

  const curAddress = useMemo(() => {
    let res = ''
    if (curTableItem && curTableItem?.gomboc) {
      res = curTableItem?.gomboc
    }
    return res
  }, [curTableItem])
  const { toClaimRewards } = useClaimRewards(curAddress)
  const claimRewardsCallback = useCallback(async () => {
    if (!account) return
    setCurToken(LT[chainId ?? 1])
    onTxStart()
    setPendingText(`claim Rewards`)
    toClaimRewards()
      .then(hash => {
        setPendingText('')
        onTxSubmitted(hash)
      })
      .catch((error: any) => {
        setPendingText('')
        onTxError(error)
      })
  }, [account, chainId, onTxError, onTxStart, onTxSubmitted, toClaimRewards])

  const claimSubmit = useCallback(
    (type: string) => {
      if (type === 'normal') {
        claimCallback()
      } else {
        claimRewardsCallback()
      }
    },
    [claimCallback, claimRewardsCallback]
  )

  const onDismiss = useCallback(() => {
    setShowConfirm(false)
    clearItem()
  }, [clearItem])

  const confirmationContent = useCallback(
    () =>
      errorStatus ? (
        <TransactionErrorContent errorCode={errorStatus.code} onDismiss={onDismiss} message={errorStatus.message} />
      ) : (
        <GombocClaim
          onSubmit={(type: string) => {
            claimSubmit(type)
          }}
          onDismiss={onDismiss}
          tableItem={curTableItem}
        />
      ),
    [claimSubmit, errorStatus, curTableItem, onDismiss]
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
