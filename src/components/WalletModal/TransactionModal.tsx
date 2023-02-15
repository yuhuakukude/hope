import styled from 'styled-components'
import { RowBetween } from '../Row'
import React, { useCallback, useMemo } from 'react'
import { PrimaryText } from '../Text'
import { DivideLine } from './WalletDetail'
import { GapColumn } from '../Column'
import { clearAllTransactions } from '../../state/transactions/actions'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../state'
import { useActiveWeb3React } from '../../hooks'
import { isTransactionRecent, useAllTransactions } from '../../state/transactions/hooks'
import { TransactionDetails } from '../../state/transactions/reducer'
import { renderTransactions } from '../AccountDetails'

const ModalBg = styled.div`
  background: ${({ theme }) => theme.bg1};
  border-radius: 20px;
  position: fixed;
  width: 500px;
  top: 60px;
  right: 20px;
`

const ClearText = styled(PrimaryText)`
  :hover {
    color: ${({ theme }) => theme.red1};
    cursor: pointer;
  }
`

const ClickableIcon = styled.i`
  :hover {
    cursor: pointer;
  }
`

// we want the latest one to come first, so return negative if a is after b
function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
  return b.addedTime - a.addedTime
}

export default function TransactionModal({
  setShowTransaction
}: // pendingTransactions,
// confirmedTransactions
{
  setShowTransaction: (showTransaction: boolean) => void
  // pendingTransactions: string[]
  // confirmedTransactions: string[]
}) {
  const dispatch = useDispatch<AppDispatch>()
  const { chainId } = useActiveWeb3React()

  const allTransactions = useAllTransactions()
  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  }, [allTransactions])
  const pending = sortedRecentTransactions.filter(tx => !tx.receipt).map(tx => tx.hash)
  const confirmed = sortedRecentTransactions.filter(tx => tx.receipt).map(tx => tx.hash)

  const clearAllTransactionsCallback = useCallback(() => {
    if (chainId) dispatch(clearAllTransactions({ chainId }))
  }, [dispatch, chainId])

  return (
    <ModalBg>
      <RowBetween padding={'30px'}>
        <ClickableIcon
          className="iconfont"
          onClick={() => {
            setShowTransaction(false)
          }}
        >
          &#xe61d;
        </ClickableIcon>
        <PrimaryText size={'18px'}>Transactions</PrimaryText>
        <ClearText onClick={clearAllTransactionsCallback}>Clear All</ClearText>
      </RowBetween>
      <DivideLine />
      <GapColumn gap={'20px'} style={{ padding: '0 30px 30px', maxHeight: '80vh', overflow: 'auto' }}>
        {renderTransactions(pending)}
        {renderTransactions(confirmed)}
      </GapColumn>
    </ModalBg>
  )
}
