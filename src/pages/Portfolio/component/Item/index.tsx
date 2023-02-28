import React from 'react'

import './index.scss'
export default function Item({
  title,
  desc,
  type = 1
}: {
  title: string | React.ReactNode
  desc: string | React.ReactNode
  type?: 1 | 2 | 3
}) {
  return (
    <>
      <div className="portfolio-table-item-title">
        {type === 3 && <span className="portfolio-table-item-title2">Fees : </span>}
        {title}
      </div>
      <div className={`portfolio-table-item-desc ${type !== 1 ? 'portfolio-table-item-desc2' : ''}`}>
        {type === 3 && <span className="portfolio-table-item-title2">Rewards : </span>}
        {desc}
      </div>
    </>
  )
}
