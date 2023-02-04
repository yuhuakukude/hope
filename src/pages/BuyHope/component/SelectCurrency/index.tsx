import React, { useState, useCallback, useRef, RefObject } from 'react'
import Modal from '../../../../components/Modal'
import Row from '../../../../components/Row'
import './index.scss'
import styled from 'styled-components'

const SearchInput = styled.input`
  position: relative;
  display: flex;
  padding: 16px;
  align-items: center;
  width: 100%;
  white-space: nowrap;
  background: none;
  border: none;
  outline: none;
  border-radius: 20px;
  color: #000;
  border-style: solid;
  border: 1px solid #3d3e46;
  -webkit-appearance: none;

  font-size: 18px;

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
  list,
  currentCurrency
}: {
  isOpen: boolean
  onCloseModel: (currency: string) => void
  list: any
  currentCurrency: string
}) {
  console.warn(list)
  const [currency, setCurrency] = useState<string>(currentCurrency)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [coinSearchList, setCoinSearchList] = useState([...list])
  const inputRef = useRef<HTMLInputElement>()

  const handleInput = useCallback(event => {
    const input = event.target.value
    const arr: any = []
    list?.forEach((item: any) => {
      if (item.coin.indexOf(input.toUpperCase()) > -1) {
        arr.push(item)
      }
    })
    setCoinSearchList(arr)
    setSearchQuery(input)
  }, [])

  const changeCurrency = (coin: any) => {
    setCurrency(coin)
    onCloseModel(coin)
  }

  function wrappedOnDismiss() {}

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      <div className="select-currency-modal p-y-40 p-x-30 flex-1">
        <div
          className="box-title font-18 text-medium flex ai-center cursor-select"
          onClick={() => onCloseModel(currency)}
        >
          <i className="iconfont font-28 m-r-12">&#xe61a;</i> Select a Token
        </div>
        <Row className="m-t-40">
          <SearchInput
            type="text"
            id="token-search-input"
            placeholder={'Search Token Symbol'}
            autoComplete="off"
            value={searchQuery}
            ref={inputRef as RefObject<HTMLInputElement>}
            onChange={handleInput}
          />
        </Row>
        <div className="coin-box m-t-30">
          {coinSearchList.map((e, i) => (
            <div className="item flex jc-between ai-center m-b-25" key={i} onClick={() => changeCurrency(e.coin)}>
              <div className="left flex ai-center">
                <div className={`${e.icon}`} />
                <div className="m-l-8 font-nor text-medium coin">{e.coin}</div>
              </div>
              <div className="right flex ai-center">
                <p className="text-medium font-nor">{e.amount}</p>
                {currency === e.coin && <i className="iconfont m-l-8">&#xe61c;</i>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  )
}
