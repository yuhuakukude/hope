import React from 'react'

import './index.scss'

export default function Card({ isShowBg = false, children }: { isShowBg?: boolean; children: React.ReactNode }) {
  return <div className={['card-wrap', isShowBg ? 'card-bg' : ''].join(' ')}>{children}</div>
}
