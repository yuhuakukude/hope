import React from 'react'
import './index.scss'

export default function LockerBanner() {
  return (
    <div className="locker-banner-box">
      <div className="banner p-30">
        <h2 className="text-medium">Lock your LT to acquire veLT</h2>
        <p className="font-nor m-t-20">
          Extra earnings & voting power{' '}
          <a
            href="https://docs.hope.money/hope-1/lRGc3srjpd2008mDaMdR/tokens/light-token-usdlt"
            target="_blank"
            rel="noopener noreferrer"
            className="link text-primary m-l-20"
          >
            Learn more <i className="iconfont">&#xe619;</i>{' '}
          </a>
        </p>
        <ul className="m-t-20">
          <li className="font-nor">- Boost liquidity mining yield up to 2.5x</li>
          <li className="font-nor">- Vote to direct liquidity mining emissions</li>
          <li className="font-nor">- Earn your share of protocol revenue</li>
        </ul>
      </div>
    </div>
  )
}
