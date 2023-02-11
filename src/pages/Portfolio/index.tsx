import React, { useEffect, useState } from 'react'
import PortfolioConnect from './component/Connect'
import PortfolioHead from './component/Head'
import InvestmentAllocation from './component/InvestmentAllocation'
import GombocRewards from './component/GombocRewards'
import VeLTRewards from './component/VeLTRewards'
import Govern from './component/Govern'

import './index.scss'
import { useActiveWeb3React } from 'hooks'
import styled from 'styled-components'
import { AutoColumn } from 'components/Column'
import PortfolioApi, { IPortfolio } from 'api/portfolio.api'
import { data } from './mock'

const PageWrapper = styled(AutoColumn)`
  max-width: 1280px;
  width: 100%;
`

export default function Portfolio() {
  const { account } = useActiveWeb3React()
  const [overViewData, setOverViewData] = useState<IPortfolio>({} as IPortfolio)
  useEffect(() => {
    if (!account) {
      return
    }
    PortfolioApi.getOverview(account)
      .then(data => {
        console.log('data::::', data)
        if (data.success && data.result) {
          setOverViewData(data.result)
        }
      })
      .catch(() => {
        setOverViewData(data.result)
      })
  }, [account])

  return (
    <PageWrapper>
      <div className="portfolio-wrap">
        <PortfolioHead />
        {!account ? (
          <PortfolioConnect />
        ) : (
          <>
            <InvestmentAllocation data={overViewData} />
            <GombocRewards data={overViewData.rewards} />
            <VeLTRewards />
            <Govern />
          </>
        )}
      </div>
    </PageWrapper>
  )
}
