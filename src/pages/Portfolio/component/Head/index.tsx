import Button from 'components/antd/Button'
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
        <div className="learn-more">
          <Button
            type="link"
            onClick={() => {
              window.open(
                'https://docs.hope.money/hope-1/lRGc3srjpd2008mDaMdR/usdhope-reserve-pools-hrp/understanding-usdhope-reserve-pools'
              )!.opener = null
            }}
          >
            Learn more
          </Button>
        </div>
      </Card>
    </div>
  )
}
