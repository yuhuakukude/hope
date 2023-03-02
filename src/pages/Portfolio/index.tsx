import React, { useEffect, useState, useCallback, useMemo } from 'react'
import PortfolioConnect from './component/Connect'
import PortfolioHead from './component/Head'
import InvestmentAllocation from './component/InvestmentAllocation'
// import GombocRewards from './component/GombocRewards'
// import VeLTRewards from './component/VeLTRewards'
// import Govern from './component/Govern'

import './index.scss'
import { Decimal } from 'decimal.js'
import { useActiveWeb3React } from 'hooks'
import styled from 'styled-components'
import { AutoColumn } from 'components/Column'
import PortfolioApi, { PortfolioInfo } from 'api/portfolio.api'
import MyHOPEStaking from './component/MyHOPEStaking'
import MyLiquidityPools from './component/MyLiquidityPools'
import MyLockedLTAndProfits from './component/MyLockedLTAndProfits'
import { useTokenBalance } from '../../state/wallet/hooks'
import { ST_HOPE, SUBGRAPH } from '../../constants'
import { postQuery } from '../../utils/graph'

const PageWrapper = styled(AutoColumn)`
  max-width: 1280px;
  width: 100%;
`

export default function Portfolio() {
  const { account, chainId } = useActiveWeb3React()
  const stHopeBalance = useTokenBalance(account ?? undefined, ST_HOPE[chainId ?? 1])
  const [overViewData, setOverViewData] = useState<PortfolioInfo>({} as PortfolioInfo)
  const [stToHope, setStToHope] = useState('0')
  const [ltToHope, setLtToHope] = useState('0')
  const [stHopeProfits, setStHopeProfits] = useState('0')
  const [lockerLt, setLockerLt] = useState('0')
  console.log(stHopeProfits)

  const getTokenToHope = (tokenAmount: string, hopeScale: string) => {
    if (!tokenAmount || !hopeScale) return '0'
    return new Decimal(tokenAmount)
      .mul(new Decimal(hopeScale || 0))
      .toNumber()
      .toFixed(2)
  }

  const allData = useMemo(() => {
    const getLtHope = getTokenToHope(lockerLt || '0', ltToHope)
    const getSthopeHope = getTokenToHope(stHopeProfits || '0', stToHope)
    const profits = new Decimal(getLtHope)
      .add(new Decimal(getSthopeHope))
      .toNumber()
      .toFixed(2)
    return {
      staking: getTokenToHope(stHopeBalance?.toFixed(2) || '0', stToHope),
      profits
    }
  }, [stHopeBalance, stToHope, ltToHope, lockerLt, stHopeProfits])
  console.log(allData)

  const getTokenPrice = useCallback(async () => {
    try {
      const query = `{
        tokens(where: {symbol_in: ["stHOPE", "LT", "HOPE"]}){
          symbol
          derivedETH
        }
      }`
      const res = await postQuery(SUBGRAPH, query)
      const stToHopeVal = new Decimal(res.data.tokens[2].derivedETH)
        .div(new Decimal(res.data.tokens[0].derivedETH))
        .toNumber()
        .toFixed(18)
      const ltToHopeVal = new Decimal(res.data.tokens[2].derivedETH)
        .div(new Decimal(res.data.tokens[1].derivedETH))
        .toNumber()
        .toFixed(18)
      setStToHope(stToHopeVal || '0')
      setLtToHope(ltToHopeVal || '0')
    } catch (error) {
      console.log(error)
    }
  }, [])

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

  useEffect(() => {
    if (account) {
      getTokenPrice()
      init()
    }
  }, [account, getTokenPrice, init])

  const getAllVoting = (stHope: string, lt: string) => {
    setLockerLt(lt)
    setStHopeProfits(stHope)
  }

  return (
    <PageWrapper>
      <div className="portfolio-wrap">
        <PortfolioHead />
        {!account ? (
          <PortfolioConnect />
        ) : (
          <>
            <InvestmentAllocation data={overViewData} />
            {/* <GombocRewards data={overViewData.rewards} /> */}
            <MyHOPEStaking />
            <MyLiquidityPools />
            <MyLockedLTAndProfits getAllVoting={getAllVoting} />
            {/* <VeLTRewards /> */}
            {/* <Govern /> */}
          </>
        )}
      </div>
    </PageWrapper>
  )
}
