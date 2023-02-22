import React from 'react'
import { ButtonPrimary } from 'components/Button'
import { NavLink } from 'react-router-dom'
import './index.scss'

export default function Empty() {
  return (
    <div className="velt-rewards-empty">
      <div className="velt-rewards-empty-title">Lock LT to get veLT and gain more investment income</div>
      <div className="velt-rewards-empty-button">
        <NavLink to={'/dao/locker'}>
          <ButtonPrimary>Get veLT</ButtonPrimary>
        </NavLink>
      </div>
      <a
        className="learn-more m-t-20"
        href="https://docs.hope.money/hope-1/lRGc3srjpd2008mDaMdR/tokens/light-token-usdlt"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className="velt-rewards-empty-more">
          Learn more about veLT
          <i className="iconfont">&#xe619;</i>
        </div>
      </a>
    </div>
  )
}
