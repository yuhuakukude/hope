import React from 'react'

import './index.scss'

/**
 *
 * @param props
 */

const HopeCard = (props: any) => {
  return (
    <div className="ark-card-box">
      <div className={'header'}>
        <div className="title text-dark">{props.title}</div>
      </div>
      <div className="content">{props.children}</div>
    </div>
  )
}

export default HopeCard
