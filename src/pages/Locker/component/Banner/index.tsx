import React from 'react'
import './index.scss'
import { DOCS_URL } from 'constants/config'

export default function LockerBanner() {
  return (
    <div className="locker-banner-box">
      <div className="banner p-30">
        <div className="content">
          <h2 className="text-medium">Lock your LT to acquire veLT</h2>
          <p className="font-nor m-t-20 flex ai-center">
            Extra earnings & voting power{' '}
            <a
              href={DOCS_URL['LightToken']}
              target="_blank"
              rel="noopener noreferrer"
              className="link text-primary m-l-20 flex ai-center"
            >
              Learn more <i className="iconfont m-l-5 m-t-2">&#xe619;</i>{' '}
            </a>
          </p>
          <ul className="m-t-26">
            <li className="font-nor">- Boost liquidity mining yield up to 2.5x</li>
            <li className="font-nor">- Vote to direct liquidity mining emissions</li>
            <li className="font-nor">- Earn your share of protocol revenue</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
