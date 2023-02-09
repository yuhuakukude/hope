import React from 'react'
import PortfolioConnect from './component/Connect'
import PortfolioHead from './component/Head'
import InvestmentAllocation from './component/InvestmentAllocation'
import GombocRewards from './component/GombocRewards'
import VeLTRewards from './component/VeLTRewards'
import Govern from './component/Govern'

import './index.scss'

export default function Portfolio() {
  return (
    <div className="portfolio-wrap">
      <PortfolioHead />
      {false && <PortfolioConnect />}
      {true && <InvestmentAllocation />}
      {true && <GombocRewards />}
      {true && <VeLTRewards />}
      <Govern />
    </div>
  )
}
