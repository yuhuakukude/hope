import { Tooltip } from 'antd'
import React, { useCallback, useState } from 'react'

import './index.scss'

export interface TitleTipsProps {
  label: string
  value: any
  onClick: (data: TitleTipsProps) => void
}

export default function TitleTips({ options, label }: { options: TitleTipsProps[]; label?: string | HTMLElement }) {
  const getTitle = useCallback(
    () => (
      <div className="select-tips-list">
        {options.map((item, index) => {
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
        <span className="select-tips-more">
          {label ? label : 'More'}
          <i className={`iconfont ${visible ? 'iconfont-visible' : ''}`}>&#xe60d;</i>
        </span>
      </Tooltip>
    </div>
  )
}
