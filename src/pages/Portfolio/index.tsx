import React from 'react'
import PortfolioConnect from './component/Connect'
import PortfolioHead from './component/Head'
import InvestmentAllocation from './component/InvestmentAllocation'
import Rewards from './component/Rewards'

import './index.scss'

export default function Portfolio() {
  return (
    <div className="portfolio-wrap">
      <PortfolioHead />
      {false && <PortfolioConnect />}
      {false && <InvestmentAllocation />}
      <Rewards />
    </div>
  )
}
