import React from 'react'
import PortfolioConnect from './component/Connect'
import PortfolioHead from './component/Head'
import InvestmentAllocation from './component/InvestmentAllocation'
import GömböcRewards from './component/GömböcRewards'
import VeLTRewards from './component/VeLTRewards'
import Govern from './component/Govern'

import './index.scss'

export default function Portfolio() {
  return (
    <div className="portfolio-wrap">
      <PortfolioHead />
      {false && <PortfolioConnect />}
      <InvestmentAllocation />
      {false && <GömböcRewards />}
      {false && <VeLTRewards />}
      <Govern />
    </div>
  )
}
