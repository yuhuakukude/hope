import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as echarts from 'echarts'
import { TitleComponentOption } from 'echarts/components'
import { PieSeriesOption } from 'echarts/charts'
import format from 'utils/format'
import './index.scss'
import Card from '../Card'
import Tips from 'components/Tips'
import Modal from 'components/antd/Modal'
import TitleTips from '../TitleTips'
import { useActiveWeb3React } from '../../../../hooks'
import { useTokenPrice } from '../../../../hooks/liquidity/useBasePairs'
import { toUsdPrice } from 'hooks/ahp/usePortfolio'
import { DOCS_URL } from 'constants/config'
import { getHopeTokenAddress } from 'utils/addressHelpers'
import Skeleton from 'components/Skeleton'
import { PortfolioData } from 'pages/Portfolio'
// import Button from 'components/antd/Button'

type EChartsOption = echarts.ComposeOption<TitleComponentOption | PieSeriesOption>

type IOptionItem = {
  name: string
  value: any
  formatValue: string
  tips: JSX.Element | string
}

export default function InvestmentAllocation({ data, loading }: { data?: PortfolioData; loading: boolean }) {
  const { chainId } = useActiveWeb3React()
  const addresses = useMemo(() => [getHopeTokenAddress(chainId)], [chainId])
  const { result: priceResult } = useTokenPrice(addresses)
  const [allocations, setAllocations] = useState<IOptionItem[]>([])

  const [visibleMap, setVisibleMap] = useState(false)
  const investmentRef = useRef<HTMLInputElement>()

  const [myChart, setMyChart] = useState<echarts.ECharts | null>(null)

  useEffect(() => {
    const listData = [
      {
        name: 'HOPE Staking',
        value: data?.staking,
        formatValue: format.amountFormat(data?.staking, 2),
        tips:
          'The total value of tokens currently held in the HOPE Staking contract, including all transferable, unstaking, withdrawable, and claimable assets.'
      },
      {
        name: 'Liquidity Pools',
        value: data?.lp,
        formatValue: format.amountFormat(data?.lp, 2),
        tips: 'Total value of assets withdrawable from liquidity pools.'
      },
      {
        name: 'Liquidity Farming',
        value: data?.yieldFarming,
        formatValue: format.amountFormat(data?.yieldFarming, 2),
        tips: 'Total value of LP Tokens staked and pending rewards'
      },
      {
        name: 'Locked LT & Profits',
        value: data?.profits,
        formatValue: format.amountFormat(data?.profits, 2),
        tips: (
          <>
            <div>
              The total value of LT locked into Voting Escrow contract, and the portion of platform fees earned through
              the holding of veLT.{' '}
              <a className="text-primary" href={DOCS_URL['LightToken2']} target="_blank" rel="noopener noreferrer">
                Learn more
              </a>
            </div>
          </>
        )
      }
    ]
    setAllocations(listData)
    if (!visibleMap) {
      return
    }

    const option: EChartsOption = {
      left: 95,
      top: 40,
      width: 250,
      height: 250,
      tooltip: {
        trigger: 'item',
        textStyle: {
          color: '#fff',
          fontSize: 14
        },
        formatter: (params: { name: string; value: number; percent: number }) => {
          return `<div>
                    <div style="font-size: 14px;font-family: Arboria-Book;">${params.name}: </div>
                    <div style="font-size: 18px;margin-top: 8px;font-family: Arboria-Bold;">(${params.percent}%)</div>
                  </div>`
        },
        padding: 20,
        backgroundColor: 'rgb(51, 51, 60)',
        borderRadius: 10,
        borderWidth: 0
      },
      legend: [
        {
          itemWidth: 10,
          itemHeight: 10,
          itemGap: 30,
          icon: 'circle',
          orient: 'vertical',
          left: 'left',
          top: 'bottom',
          data: listData.slice(0, (listData.length / 2) | 0),
          textStyle: {
            color: '#A8A8AA',
            fontSize: 16,
            fontFamily: 'Arboria-Book'
          }
        },
        {
          itemWidth: 10,
          itemHeight: 10,
          itemGap: 30,
          icon: 'circle',
          orient: 'vertical',
          left: '50%',
          top: 'bottom',
          data: listData.slice((listData.length / 2) | 0),
          textStyle: {
            color: '#A8A8AA',
            fontSize: 16,
            fontFamily: 'Arboria-Book'
          }
        }
      ],
      series: [
        {
          type: 'pie',
          radius: [50, 90],
          left: 'center',
          colorBy: 'data',
          label: {
            show: false
          },
          top: 'top',
          data: listData as any
        }
      ]
    }
    if (!myChart) {
      setMyChart(echarts.init(investmentRef.current as HTMLElement, option))
    } else {
      myChart.setOption(option)
    }
  }, [visibleMap, myChart, data])

  return (
    <div className="investment-allocation">
      <Card
        title={
          <>
            My Assets Allocation
            <i className="iconfont investment-allocation-title" onClick={() => setVisibleMap(true)}>
              &#xe624;
            </i>
          </>
        }
      >
        <div className="investment-allocation-top">
          <div className="investment-allocation-head">
            <div className="investment-allocation-total">
              <TitleTips
                title="Total Value"
                desc="Total value of withdrawable liquidity, liquidity farming, claimable rewards, staked HOPE, and Locked LT"
              />
            </div>
            <div className="investment-allocation-total2">
              <span className="text-medium investment-allocation-total4">
                <Skeleton loading={loading} width={150} height={30}>
                  {format.amountFormat(data?.totalHope, 2)} HOPE
                </Skeleton>
              </span>

              <span className="investment-allocation-total3">
                <Skeleton loading={loading} width={46} height={14} ml={12}>
                  {' '}
                  ≈ $
                  {priceResult && priceResult[0] && priceResult[0].price
                    ? toUsdPrice(data?.totalHope, priceResult[0].price)
                    : '0.00'}
                </Skeleton>
              </span>
            </div>
          </div>
        </div>
        <div className="investment-allocation-bottom">
          <div className="investment-allocation-content">
            {allocations.map((item, index) => {
              return (
                <div className="investment-allocation-box flex-1" key={index}>
                  <div className="investment-allocation-box-head">
                    <span className="investment-allocation-box-name">{item.name}</span>
                    <span className="investment-allocation-box-question">
                      <Tips title={item.tips} />
                    </span>
                  </div>
                  <div className="investment-allocation-box-amount text-medium">
                    <Skeleton loading={loading} width={94} height={16}>
                      ≈ {item.formatValue} HOPE
                    </Skeleton>
                  </div>
                  <div className="investment-allocation-box-amount2">
                    <Skeleton loading={loading} width={46} height={14}>
                      ≈ $
                      {priceResult && priceResult[0] && priceResult[0].price
                        ? toUsdPrice(item.value, priceResult[0].price)
                        : '0.00'}
                    </Skeleton>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Card>
      <Modal
        width="500px"
        visible={visibleMap}
        onCancel={() => setVisibleMap(false)}
        forceRender
        closeIcon={
          <i className="iconfont close-icon font-18" style={{ color: '#fff' }}>
            &#xe612;
          </i>
        }
      >
        <div className="investment-allocation-wrap">
          <div className="investment-allocation-map" ref={investmentRef as any}></div>
        </div>
      </Modal>
    </div>
  )
}
