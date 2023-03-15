import { DOCS_URL } from 'constants/config'
import React from 'react'
import Card from '../Card'
import './index.scss'

export default function PortfolioHead() {
  return (
    <div className="portfolio-head">
      <Card isShowBg={true}>
        <div className="portfolio-head-title text-medium">Put your money to work</div>
        <div className="portfolio-head-desc">
          You can now invest with HOPE & stHOPE to earn LT rewards! Or invest in LightSwap pools to earn exchange fees
          and pooling rewards!
        </div>
        <div className="learn-more">
          <a
            className="learn-a font-nor text-primary text-medium m-t-30"
            target="_blank"
            rel="noopener noreferrer"
            href={DOCS_URL['ReservePools']}
          >
            Learn more
          </a>
        </div>
      </Card>
    </div>
  )
}
