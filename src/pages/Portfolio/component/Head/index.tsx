import React from 'react'
import Card from '../Card'
import './index.scss'

export default function PortfolioHead() {
  return (
    <div className="portfolio-head">
      <Card isShowBg={true}>
        <div className="portfolio-head-title">Put your money to work</div>
        <div className="portfolio-head-desc">
          You can now invest with HOPE & stHOPE to earn LT rewards! Or invest in LightSwap pools to earn exchange fees
          and pooling rewards!
        </div>
        <a
          className="learn-more m-t-20"
          href="https://docs.hope.money/hope-1/lRGc3srjpd2008mDaMdR/usdhope-reserve-pools-hrp/understanding-usdhope-reserve-pools"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="portfolio-button portfolio-head-button">Learn more</div>
        </a>
      </Card>
    </div>
  )
}
