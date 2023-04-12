import { Tooltip } from 'antd'
import React, { useCallback, useState } from 'react'

import './index.scss'

export interface TitleTipsProps {
  label: string
  value: any
  isHide?: boolean
  onClick: (data: TitleTipsProps) => void
}

export default function TitleTips({
  options,
  label,
  noBorder
}: {
  options: TitleTipsProps[]
  label?: string | HTMLElement
  noBorder?: boolean
}) {
  const getTitle = useCallback(
    () => (
      <div className="select-tips-list">
        {options.map((item, index) => {
          if (item.isHide) return null
          return (
            <div
              key={index}
              onClick={() => {
                item.onClick(item)
              }}
              className="select-tips-item"
            >
              {item.label}
            </div>
          )
        })}
      </div>
    ),
    [options]
  )

  const [visible, setVisible] = useState(false)

  const onVisibleChange = (visible: boolean) => {
    setVisible(visible)
  }
  return (
    <div className="select-tips-wrap">
      <Tooltip
        title={getTitle}
        placement="bottomRight"
        overlayClassName="select-tips-tool"
        onVisibleChange={onVisibleChange}
      >
        <span className={['select-tips-more', noBorder ? 'no-border' : ''].join(' ')}>
          {label ? label : 'More'}
          <i className={`iconfont ${visible ? 'iconfont-visible' : ''}`}>&#xe60d;</i>
        </span>
      </Tooltip>
    </div>
  )
}
