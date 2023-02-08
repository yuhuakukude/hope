import React from 'react'
import Card from '../Card'
import './index.scss'

export default function PortfolioHead() {
  return (
    <div className="portfolio-head">
      <Card>
        <div className="portfolio-head-title">Put your money to work</div>
        <div className="portfolio-head-desc">
          You can now invest with HOPE & stHOPE to earn LT rewards! Or invest in LightSwap pools to earn exchange fees
          and pooling rewards!{' '}
        </div>
        <div className="portfolio-button portfolio-head-button">Learn more</div>
      </Card>
    </div>
  )
}
