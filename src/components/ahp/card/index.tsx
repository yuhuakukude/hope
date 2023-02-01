import React from 'react'

import './index.scss'

/**
 *
 * @param props
 *
 * title 卡片标题
 * center 标题是否居中
 * shadow 卡片是否有阴影
 * drap 卡片是否支持收起
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
