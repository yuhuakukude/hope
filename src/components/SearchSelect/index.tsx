import React, { useState, useRef, RefObject, useEffect } from 'react'
import { Select } from 'antd'
import DoubleCurrencyLogo from '../DoubleLogo'
import './index.scss'

export default function SearchSelect({
  list,
  isLarge,
  placeholder,
  getResult
}: {
  list: any
  isLarge?: boolean
  placeholder?: string
  getResult: (result: string) => void
}) {
  const { Option } = Select
  const inputRef = useRef<any>()
  const optionRef = useRef<any>()
  const [inputValue, setInputValue] = useState('')
  const [data, setData] = useState([])

  const handleInput = (value: string) => {
    setInputValue(value || '')
    getResult(value || '')
  }
  const handleSearch = (value: string) => {
    if (value) {
      const res = list.filter((e: any) => e.label.includes(value.toUpperCase()) || e.value.includes(value))
      setData(res)
    } else {
      setData(list)
    }
  }
  useEffect(() => {
    setData(list)
  }, [list])
  return (
    <div className="select-input-box" style={{ height: isLarge ? '56px' : '42px' }}>
      <Select
        style={{ width: '100%' }}
        value={inputValue}
        onChange={handleInput}
        onSearch={handleSearch}
        className="select-input-tem"
        showSearch
        allowClear={true}
        placeholder={placeholder}
        size={isLarge ? 'large' : 'default'}
        ref={inputRef as RefObject<any>}
        showArrow={false}
        filterOption={false}
        defaultActiveFirstOption={false}
        notFoundContent={null}
      >
        {data.map((item: any, index: number) => {
          return (
            <Option key={index} value={item.value} ref={optionRef as RefObject<any>}>
              <div className="flex ai-center">
                <DoubleCurrencyLogo margin currency0={item.token0} currency1={item.token1} size={24} />
                <span className="m-l-5">{item.label}</span>
              </div>
            </Option>
          )
        })}
      </Select>
      <i className="iconfont">&#xe61b;</i>
    </div>
  )
}
