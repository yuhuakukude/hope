import React, { useEffect, useState, useCallback, useMemo } from 'react'
import PortfolioConnect from './component/Connect'
import PortfolioHead from './component/Head'
import InvestmentAllocation from './component/InvestmentAllocation'

import './index.scss'
import { Decimal } from 'decimal.js'
import { useActiveWeb3React } from 'hooks'
import styled from 'styled-components'
import { AutoColumn } from 'components/Column'
import MyHOPEStaking from './component/MyHOPEStaking'
import MyLiquidityPools from './component/MyLiquidityPools'
// import MyDepositedLiquidity from './component/MyDepositedLiquidity'

import MyLockedLTAndProfits from './component/MyLockedLTAndProfits'
import { useStHopeBalance } from '../../state/wallet/hooks'
import { SUBGRAPH } from '../../constants'
import { postQuery } from '../../utils/graph'
import { useStaking } from 'hooks/ahp/useStaking'

const PageWrapper = styled(AutoColumn)`
  max-width: 1340px;
  width: 100%;
`

export type PortfolioData = {
  staking: number
  profits: string
  lp: string
  yieldFarming: string
  totalHope: string
}

export default function Portfolio() {
  const { account } = useActiveWeb3React()
  const stHopeBalance = useStHopeBalance()
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

  const allData: PortfolioData | undefined = useMemo(() => {
    if (!account) {
      return
    }
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
  }, [stHopeBalance, stToHope, ltToHope, lockerLt, stHopeProfits, lpData, claRewards, account])

  const [loading, setLoading] = useState(true)
  const getTokenPrice = useCallback(async () => {
    try {
      const query = `{
        tokens(where: {symbol_in: ["stHOPE", "LT", "HOPE"]}, block: {number: 3308000}){
          symbol
          derivedHOPE
        }
      }`
      const res = await postQuery(SUBGRAPH, query)
      if (res.data.tokens && res.data.tokens.length > 0) {
        const list = res.data.tokens
        const price: any = {}
        list.forEach((e: any) => {
          if (e.symbol && e.derivedHOPE) {
            price[e.symbol] = e.derivedHOPE
          }
        })
        if (price['LT'] && price['HOPE']) {
          let stp = 0
          if (price['stHOPE'] && Number(price['stHOPE']) > 0) {
            stp = price['stHOPE']
          } else {
            stp = price['HOPE']
          }
          const stToHopeVal = new Decimal(stp)
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
    } finally {
      setLoading(false)
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
            <InvestmentAllocation data={allData} loading={loading} />
            <MyHOPEStaking />
            {/* <MyDepositedLiquidity /> */}
            <MyLiquidityPools getLpData={setLpTotal} />
            {stHopeBalance && <MyLockedLTAndProfits getAllVoting={getAllVoting} />}
          </>
        )}
      </div>
    </PageWrapper>
  )
}
