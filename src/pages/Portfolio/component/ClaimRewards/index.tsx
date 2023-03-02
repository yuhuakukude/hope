import React, { useCallback, useEffect, useMemo, useState } from 'react'
import TransactionConfirmationModal, {
  TransactionErrorContent
} from '../../../../components/TransactionConfirmationModal'
import { Token } from '@uniswap/sdk'
import GombocClaim, { ITableItem } from '../../../../components/ahp/GombocClaim'
import { useToClaim, useClaimRewards } from '../../../../hooks/ahp/usePortfolio'
import { STAKING_HOPE_GOMBOC_ADDRESS, LT, HOPE } from '../../../../constants'
import { useActiveWeb3React } from 'hooks'
import GombocClaimAll from 'components/ahp/GombocClaimAll'
import { getCount, IHeadItem } from '../MyLiquidityPools/components/head'

export default function ClaimRewards({
  item,
  clearItem
}: {
  item: ITableItem | null | IHeadItem[]
  clearItem: () => void
}) {
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
    if (!Array.isArray(item)) {
      setCurTableItem(item)
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
    setErrorStatus({ code: error?.code, message: error.message })
  }, [])

  const [claimPendingText, setPendingText] = useState('')
  const { toClaim } = useToClaim()

  const claimCallback = useCallback(async () => {
    if (!account) return
    setCurToken(LT[chainId ?? 1])
    onTxStart()
    setPendingText(`claim Rewards`)
    toClaim(STAKING_HOPE_GOMBOC_ADDRESS[chainId ?? 1]) // TODO
      .then(hash => {
        setPendingText('')
        onTxSubmitted(hash)
      })
      .catch((error: any) => {
        setPendingText('')
        onTxError(error)
      })
  }, [account, chainId, onTxError, onTxStart, onTxSubmitted, toClaim])

  const claimAllCallback = useCallback(async () => {
    if (!account || !Array.isArray(item)) return
    setCurToken(LT[chainId ?? 1])
    onTxStart()
    setPendingText(`claim all Rewards`)
    // TODO
    toClaim(item.map(i => i.gomboc))
      .then(hash => {
        setPendingText('')
        onTxSubmitted(hash)
      })
      .catch((error: any) => {
        setPendingText('')
        onTxError(error)
      })
  }, [account, chainId, onTxError, onTxStart, onTxSubmitted, toClaim, item])

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

  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (!Array.isArray(item)) {
      return
    }
    setTotal(getCount(item, 'ltOfReward'))
  }, [item])

  const confirmationContent = useCallback(
    () =>
      errorStatus ? (
        <TransactionErrorContent errorCode={errorStatus.code} onDismiss={onDismiss} message={errorStatus.message} />
      ) : Array.isArray(item) ? (
        <GombocClaimAll total={total} onSubmit={claimAllCallback} onDismiss={onDismiss} list={item} />
      ) : (
        <GombocClaim
          onSubmit={(type: string) => {
            claimSubmit(type)
          }}
          onDismiss={onDismiss}
          tableItem={curTableItem}
        />
      ),
    [claimSubmit, errorStatus, curTableItem, onDismiss, item, total, claimAllCallback]
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
