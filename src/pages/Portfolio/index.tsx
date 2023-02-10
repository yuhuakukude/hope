import React, { useEffect, useRef } from 'react'
import PortfolioConnect from './component/Connect'
import PortfolioHead from './component/Head'
import InvestmentAllocation from './component/InvestmentAllocation'
import GombocRewards from './component/GombocRewards'
import VeLTRewards from './component/VeLTRewards'
import Govern from './component/Govern'

import './index.scss'
import PortfolioApi from 'api/portfolio.api'

async function getData() {
  const data = await PortfolioApi.getOverview()
  console.log('data::::', data)
}

export default function Portfolio() {
  useEffect(() => {
    getData()
  }, [])

  const isConnect = useRef(false)
  return (
    <div className="portfolio-wrap">
      <PortfolioHead />
      {!isConnect ? (
        <PortfolioConnect />
      ) : (
        <>
          <InvestmentAllocation />
          <GombocRewards />
          <VeLTRewards />
          <Govern />
        </>
      )}
    </div>
  )
}
