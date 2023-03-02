import React, { useEffect, useState, useCallback } from 'react'
import PortfolioConnect from './component/Connect'
import PortfolioHead from './component/Head'
import InvestmentAllocation from './component/InvestmentAllocation'
// import GombocRewards from './component/GombocRewards'
// import VeLTRewards from './component/VeLTRewards'
// import Govern from './component/Govern'

import './index.scss'
import { useActiveWeb3React } from 'hooks'
import styled from 'styled-components'
import { AutoColumn } from 'components/Column'
import PortfolioApi, { PortfolioInfo } from 'api/portfolio.api'
import MyHOPEStaking from './component/MyHOPEStaking'
import MyLiquidityPools from './component/MyLiquidityPools'
import MyLockedLTAndProfits from './component/MyLockedLTAndProfits'

const PageWrapper = styled(AutoColumn)`
  max-width: 1280px;
  width: 100%;
`

export default function Portfolio() {
  const { account } = useActiveWeb3React()
  const [overViewData, setOverViewData] = useState<PortfolioInfo>({} as PortfolioInfo)
  const [lpData, setLpData] = useState({})
  const init = useCallback(async () => {
    try {
      const res = await PortfolioApi.getOverview(`${account}`)
      if (res.result && res.result) {
        setOverViewData(res.result)
      }
    } catch (error) {
      console.log(error)
    }
  }, [account])

  function setLpTotal(lpTotal: number, yfTotal: number) {
    setLpData({ lpTotal, yfTotal })
  }

  useEffect(() => {
    if (account) {
      init()
    }
  }, [account, init])

  return (
    <PageWrapper>
      <div className="portfolio-wrap">
        <PortfolioHead />
        {!account ? (
          <PortfolioConnect />
        ) : (
          <>
            <InvestmentAllocation lpData={lpData} data={overViewData} />
            {/* <GombocRewards data={overViewData.rewards} /> */}
            <MyHOPEStaking />
            <MyLiquidityPools getLpData={setLpTotal} />
            <MyLockedLTAndProfits />
            {/* <VeLTRewards /> */}
            {/* <Govern /> */}
          </>
        )}
      </div>
    </PageWrapper>
  )
}
