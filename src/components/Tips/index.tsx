import React from 'react'
import { Tooltip } from 'antd'
import { TooltipProps } from 'antd/lib/tooltip'

import './index.scss'

export default function Tips(props: TooltipProps) {
  return (
    <Tooltip {...props}>
      <i className="iconfont font-16 cursor-select tips-circle">&#xe620;</i>
    </Tooltip>
  )
}
