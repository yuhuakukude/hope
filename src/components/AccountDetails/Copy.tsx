import React from 'react'
import styled from 'styled-components'
import useCopyClipboard from '../../hooks/useCopyClipboard'

import { LinkStyledButton } from '../../theme'
import { Tooltip } from 'antd'

const CopyIcon = styled(LinkStyledButton)`
  color: ${({ theme }) => theme.text3};
  flex-shrink: 0;
  display: flex;
  text-decoration: none;
  font-size: 0.825rem;
  padding: 0;
  :hover,
  :active,
  :focus {
    text-decoration: none;
    color: ${({ theme }) => theme.text2};
  }
`
const TransactionStatusText = styled.span`
  margin-left: 0.25rem;
  font-size: 0.825rem;
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
  font-family: Arboria-Book;
`

export default function CopyHelper(props: { toCopy: string; children?: React.ReactNode }) {
  const [isCopied, setCopied] = useCopyClipboard()

  return (
    <CopyIcon onClick={() => setCopied(props.toCopy)}>
      {isCopied ? (
        <TransactionStatusText>
          <i className="iconfont font-18 text-success">&#xe62e;</i>
          <TransactionStatusText style={{ fontSize: '14px', color: '#fff' }}>Copied!</TransactionStatusText>
        </TransactionStatusText>
      ) : (
        <TransactionStatusText>
          <Tooltip overlayClassName="tips-wallet" title="Copy">
            <i className="iconfont font-24 hope-icon-common" style={{ padding: '2px' }}>
              &#xe628;
            </i>
          </Tooltip>
        </TransactionStatusText>
      )}
      {isCopied ? '' : props.children}
    </CopyIcon>
  )
}
