import React from 'react'

import './index.scss'
import { Skeleton2 } from 'components/Skeleton'
export default function Item({
  title,
  desc,
  type = 1,
  loading
}: {
  title: string | React.ReactNode
  desc: string | React.ReactNode
  type?: 1 | 2 | 3
  loading?: boolean
}) {
  return (
    <>
      <div className="portfolio-table-item-title">
        <Skeleton2 loading={!!loading}>
          {type === 3 && <span className="portfolio-table-item-title2">Fees : </span>}
          {title}
        </Skeleton2>
      </div>
      <div className={`portfolio-table-item-desc ${type !== 1 ? 'portfolio-table-item-desc2' : ''}`}>
        <Skeleton2 loading={!!loading}>
          {type === 3 && <span className="portfolio-table-item-title2">Rewards : </span>}
          {desc}
        </Skeleton2>
      </div>
    </>
  )
}
