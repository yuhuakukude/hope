import React, { useMemo } from 'react'
import styled from 'styled-components'
import { CheckCircle, XCircle } from 'react-feather'
import { useActiveWeb3React } from '../../hooks'
import { getEtherscanLink } from '../../utils'
import { ExternalLink } from '../../theme'
import { useAllTransactions } from '../../state/transactions/hooks'
import { RowFixed } from '../Row'
import Loader from '../Loader'
import { TYPE } from '../../theme'
import { formatDate } from '../../utils/format'
import { Tooltip } from 'antd'

const TransactionWrapper = styled.div``

const TransactionStatusText = styled.div`
  color: ${({ theme }) => theme.text1};
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
  width: 180px;
  :hover {
    text-decoration: underline;
  }
`

const TransactionState = styled(ExternalLink)<{ pending: boolean; success?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-decoration: none !important;
  border-radius: 0.5rem;
  padding: 0.55rem 0rem;
  font-weight: 500;
  font-size: 0.825rem;
  color: ${({ theme }) => theme.primary1};
`

const IconWrapper = styled.div<{ pending: boolean; success?: boolean }>`
  color: ${({ pending, success, theme }) => (pending ? theme.primary1 : success ? theme.green1 : theme.red1)};
`

export default function Transaction({ hash }: { hash: string }) {
  const { chainId } = useActiveWeb3React()
  const allTransactions = useAllTransactions()

  const tx = allTransactions?.[hash]
  const summary = tx?.summary
  const pending = !tx?.receipt
  const success = !pending && tx && (tx.receipt?.status === 1 || typeof tx.receipt?.status === 'undefined')

  const isOverTranTip = useMemo(() => {
    let res = false
    if (tx && tx.addedTime) {
      const time = (new Date().getTime() - tx.addedTime) / 1000 / 60
      if (time > 2) {
        res = true
      }
    }
    return res
  }, [tx])

  if (!chainId) return null

  return (
    <TransactionWrapper>
      <TransactionState href={getEtherscanLink(chainId, hash, 'transaction')} pending={pending} success={success}>
        <RowFixed>
          <TYPE.main>{`${tx?.addedTime ? formatDate(Math.floor(tx?.addedTime / 1000)) : ''}`}</TYPE.main>
        </RowFixed>
        <RowFixed>
          <TransactionStatusText>{summary ?? hash}</TransactionStatusText>
        </RowFixed>
        <IconWrapper className="flex ai-center" pending={pending} success={success}>
          {pending && isOverTranTip && (
            <Tooltip
              overlayClassName="tips-wallet tips-tran"
              title="Due to the long waiting time, the transaction may fail. You can check if it fails on Etherscan. If so, you can click 'Clear All' and resubmit the transaction."
            >
              <i
                className="iconfont hope-icon-common text-primary"
                style={{ fontSize: '15px', margin: '0 21px 0 0', padding: '5px', color: '#E4C989' }}
              >
                &#xe62b;
              </i>
            </Tooltip>
          )}
          {pending ? <Loader /> : success ? <CheckCircle size="16" /> : <XCircle size="16" />}
        </IconWrapper>
      </TransactionState>
    </TransactionWrapper>
  )
}
