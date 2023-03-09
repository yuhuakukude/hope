import React from 'react'

import './index.scss'

export default function Card({
  isShowBg = false,
  children,
  title
}: {
  isShowBg?: boolean
  children: React.ReactNode
  title?: string | React.ReactNode
}) {
  return (
    <div className={['card-wrap', isShowBg ? 'card-bg' : ''].join(' ')}>
      {title && <div className="card-title text-medium">{title}</div>}
      <div className="card-content">{children}</div>
    </div>
  )
}
