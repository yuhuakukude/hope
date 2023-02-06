import styled from 'styled-components'
import { RowBetween } from '../Row'
import React, { useCallback } from 'react'
import { PrimaryText } from '../Text'
import { DivideLine } from './WalletDetail'
import { GapColumn } from '../Column'
import useTheme from '../../hooks/useTheme'
import { clearAllTransactions } from '../../state/transactions/actions'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../state'
import { useActiveWeb3React } from '../../hooks'

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

enum TransactionStatus {
  Complete,
  Warning
}

interface TransactionData {
  time: string
  title: string
  status: TransactionStatus
}

function TransactionLine({ data }: { data: TransactionData }) {
  const theme = useTheme()
  const renderIcon = useCallback(() => {
    switch (data.status) {
      case TransactionStatus.Complete:
        return (
          <i className="iconfont" style={{ color: theme.green1 }}>
            &#xe61f;
          </i>
        )
      case TransactionStatus.Warning:
        return (
          <i className="iconfont" style={{ color: theme.primary1 }}>
            &#xe61e;
          </i>
        )
    }
  }, [data.status, theme.green1, theme.primary1])
  return (
    <RowBetween>
      <PrimaryText>{data.time}</PrimaryText>
      <PrimaryText>{data.title}</PrimaryText>
      {renderIcon()}
    </RowBetween>
  )
}

const ClickableIcon = styled.i`
  :hover {
    cursor: pointer;
  }
`

export default function TransactionModal({
  setShowTransaction
}: // pendingTransactions,
// confirmedTransactions
{
  setShowTransaction: (showTransaction: boolean) => void
  // pendingTransactions: string[]
  // confirmedTransactions: string[]
}) {
  const fakeTransaction: TransactionData[] = [
    {
      time: '2023-01-02',
      title: 'Approve HOPE',
      status: TransactionStatus.Complete
    },
    {
      time: '2023-01-02',
      title: 'Approve HOPE',
      status: TransactionStatus.Warning
    }
  ]
  const dispatch = useDispatch<AppDispatch>()
  const { chainId } = useActiveWeb3React()

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
      <GapColumn gap={'20px'} style={{ padding: '30px' }}>
        {fakeTransaction.map((data, index) => {
          return <TransactionLine data={data} key={index} />
        })}
      </GapColumn>
    </ModalBg>
  )
}
