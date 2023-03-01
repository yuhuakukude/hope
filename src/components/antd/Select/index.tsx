import { Select as ASelect } from 'antd'
import { SelectProps } from 'antd/lib/select'
import React from 'react'

import './index.scss'

const Option = ASelect.Option

const Select = (
  props: SelectProps & {
    children?: JSX.Element | JSX.Element[]
    options?: { label: string; value: string | number }[]
  }
) => {
  return (
    <div className="dapp-select-wrap">
      <ASelect {...props} dropdownClassName="dapp-select-dropdown">
        {props.children
          ? props.children
          : props.options?.map((opt, index) => {
              return (
                <Option key={index} value={opt.value}>
                  {opt.label}
                </Option>
              )
            })}
      </ASelect>
    </div>
  )
}

Select.Option = ASelect.Option
Select.OptGroup = ASelect.OptGroup
export default Select
