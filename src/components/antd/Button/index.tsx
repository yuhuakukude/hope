import { ButtonProps } from 'antd/lib/button'
import { Button as AButton } from 'antd'
import React from 'react'

import './index.scss'

// "link" | "ghost" | "default" | "primary" | "dashed" | "danger" | undefined

export default function Button(props: { children: React.ReactNode } & ButtonProps) {
  return (
    <div className="hope-button-wrap">
      <AButton {...props}>{props.children}</AButton>
    </div>
  )
}
