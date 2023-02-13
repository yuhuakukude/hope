import React from 'react'
import { ButtonPrimary } from 'components/Button'

import './index.scss'

export default function Empty() {
  return (
    <div className="velt-rewards-empty">
      <div className="velt-rewards-empty-title">Lock LT to get veLT and gain more investment income</div>
      <div className="velt-rewards-empty-button">
        <ButtonPrimary>Get veLT</ButtonPrimary>
      </div>
      <div className="velt-rewards-empty-more">
        Learn more about veLT
        <i className="iconfont">&#xe619;</i>
      </div>
    </div>
  )
}
