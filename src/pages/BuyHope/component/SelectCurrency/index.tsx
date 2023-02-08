import React, { useState, useCallback, useRef, RefObject } from 'react'
import Modal from '../../../../components/Modal'
import Row from '../../../../components/Row'
import './index.scss'
import styled from 'styled-components'
import { Token } from '@uniswap/sdk'
import { useTokenBalances } from '../../../../state/wallet/hooks'
import { useActiveWeb3React } from '../../../../hooks'

const SearchInput = styled.input`
  position: relative;
  display: flex;
  padding: 16px 16px 16px 45px;
  align-items: center;
  width: 100%;
  white-space: nowrap;
  background: none;
  border: none;
  outline: none;
  border-radius: 20px;
  color: #fff;
  border-style: solid;
  border: 1px solid #3d3e46;
  -webkit-appearance: none;
  font-size: 18px;
  font-family: Arboria-Medium;

  ::placeholder {
    color: #3d3e46;
  }
  transition: border 100ms;
  :focus {
    border: 1px solid #e4c989;
    outline: none;
  }
`

export default function SelectCurrency({
  isOpen,
  onCloseModel,
  supportedTokens,
  selectToken,
  onTokenSelect
}: {
  isOpen: boolean
  onCloseModel: () => void
  selectToken: Token
  supportedTokens: Token[]
  onTokenSelect: (token: Token) => void
}) {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>()
  const { account } = useActiveWeb3React()
  const balances = useTokenBalances(account ?? undefined, supportedTokens)
  const handleInput = useCallback(
    event => {
      const input = event.target.value
      const arr: any = []
      supportedTokens?.forEach((item: any) => {
        if (item.coin.indexOf(input.toUpperCase()) > -1) {
          arr.push(item)
        }
      })
      setSearchQuery(input)
    },
    [supportedTokens]
  )

  function wrappedOnDismiss() {
    onCloseModel()
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      <div className="select-currency-modal p-y-40 p-x-30 flex-1">
        <div className="box-title font-18 text-medium flex ai-center cursor-select" onClick={() => onCloseModel()}>
          <i className="iconfont font-28 m-r-12">&#xe61a;</i> Select a Token
        </div>
        <Row className="m-t-40 row-box">
          <SearchInput
            type="text"
            id="token-search-input"
            placeholder={'Search Token Symbol'}
            autoComplete="off"
            value={searchQuery}
            ref={inputRef as RefObject<HTMLInputElement>}
            onChange={handleInput}
          />
          <i className="iconfont input-icon">&#xe61b;</i>
        </Row>
        <div className="coin-box m-t-30">
          {supportedTokens.map((token, i) => (
            <div
              className="item flex jc-between ai-center m-b-25"
              key={i}
              onClick={() => {
                onTokenSelect(token)
                onCloseModel()
              }}
            >
              <div className="left flex ai-center">
                <div className={`${token.symbol}`} />
                <div className="m-l-8 font-nor text-medium coin">{token.symbol}</div>
              </div>
              <div className="right flex ai-center">
                <p className="text-medium font-nor">{balances[token.address]?.toFixed(2)}</p>
                {selectToken.address === token.address && <i className="iconfont m-l-8">&#xe61c;</i>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  )
}
