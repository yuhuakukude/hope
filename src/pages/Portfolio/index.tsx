import React, { useEffect, useState, useCallback, useMemo } from 'react'
import PortfolioConnect from './component/Connect'
import PortfolioHead from './component/Head'
import InvestmentAllocation from './component/InvestmentAllocation'
// import VeLTRewards from './component/VeLTRewards'
// import Govern from './component/Govern'

import './index.scss'
import { Decimal } from 'decimal.js'
import { useActiveWeb3React } from 'hooks'
import styled from 'styled-components'
import { AutoColumn } from 'components/Column'
import MyHOPEStaking from './component/MyHOPEStaking'
import MyLiquidityPools from './component/MyLiquidityPools'
import MyLockedLTAndProfits from './component/MyLockedLTAndProfits'
import { useTokenBalance } from '../../state/wallet/hooks'
import { ST_HOPE, SUBGRAPH } from '../../constants'
import { postQuery } from '../../utils/graph'
import { useStaking } from 'hooks/ahp/useStaking'

const PageWrapper = styled(AutoColumn)`
  max-width: 1340px;
  width: 100%;
`

export default function Portfolio() {
  const { account, chainId } = useActiveWeb3React()
  const stHopeBalance = useTokenBalance(account ?? undefined, ST_HOPE[chainId ?? 1])
  const { claRewards } = useStaking()
  const [stToHope, setStToHope] = useState('0')
  const [ltToHope, setLtToHope] = useState('0')
  const [stHopeProfits, setStHopeProfits] = useState('0')
  const [lockerLt, setLockerLt] = useState('0')
  const [lpData, setLpData] = useState({ lpTotal: 0, yfTotal: 0 })

  const getTokenToHope = (tokenAmount: string, hopeScale: string) => {
    if (!tokenAmount || !hopeScale) return '0'
    return new Decimal(tokenAmount)
      .mul(new Decimal(hopeScale || 0))
      .toNumber()
      .toFixed(3)
  }

  const allData = useMemo(() => {
    const getLtHope = getTokenToHope(lockerLt || '0', ltToHope)
    const getSthopeHope = getTokenToHope(stHopeProfits || '0', stToHope)
    const profits = new Decimal(getLtHope)
      .add(new Decimal(getSthopeHope))
      .toNumber()
      .toFixed(3)
    const stBal = getTokenToHope(stHopeBalance?.toFixed(3) || '0', stToHope)
    const claRVal = getTokenToHope(claRewards?.toFixed(3) || '0', ltToHope)
    const staking = new Decimal(stBal).add(new Decimal(claRVal)).toNumber()
    const lp = lpData.lpTotal.toFixed(3) || '0'
    const yieldFarming = lpData.yfTotal.toFixed(3) || '0'
    return {
      staking,
      profits,
      lp,
      yieldFarming,
      totalHope: new Decimal(staking)
        .add(new Decimal(profits))
        .add(new Decimal(lp))
        .add(new Decimal(yieldFarming))
        .toNumber()
        .toFixed(3)
    }
  }, [stHopeBalance, stToHope, ltToHope, lockerLt, stHopeProfits, lpData, claRewards])

  const getTokenPrice = useCallback(async () => {
    try {
      const query = `{
        tokens(where: {symbol_in: ["stHOPE", "LT", "HOPE"]}){
          symbol
          derivedETH
        }
      }`
      const res = await postQuery(SUBGRAPH, query)
      if (res.data.tokens && res.data.tokens.length > 0) {
        const list = res.data.tokens
        const price: any = {}
        list.forEach((e: any) => {
          if (e.symbol && e.derivedETH) {
            price[e.symbol] = e.derivedETH
          }
        })
        if (price['stHOPE'] && price['LT'] && price['HOPE']) {
          const stToHopeVal = new Decimal(price['stHOPE'])
            .div(new Decimal(price['HOPE']))
            .toNumber()
            .toFixed(18)
          const ltToHopeVal = new Decimal(price['LT'])
            .div(new Decimal(price['HOPE']))
            .toNumber()
            .toFixed(18)
          setStToHope(stToHopeVal || '0')
          setLtToHope(ltToHopeVal || '0')
        }
      }
    } catch (error) {
      console.log(error)
    }
  }, [])

  function setLpTotal(lpTotal: number, yfTotal: number) {
    setLpData({ lpTotal, yfTotal })
  }

  useEffect(() => {
    if (account) {
      getTokenPrice()
    }
  }, [account, getTokenPrice])

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
            <InvestmentAllocation data={allData} />
            {<MyHOPEStaking />}
            <MyLiquidityPools getLpData={setLpTotal} />
            {stHopeBalance && <MyLockedLTAndProfits getAllVoting={getAllVoting} />}
            {/* <VeLTRewards /> */}
            {/* <Govern /> */}
          </>
        )}
      </div>
    </PageWrapper>
  )
}
