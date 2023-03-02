import React, { useEffect, useMemo, useState } from 'react'
import * as echarts from 'echarts'
import { TitleComponentOption } from 'echarts/components'
import { PieSeriesOption } from 'echarts/charts'
import format from 'utils/format'
import './index.scss'
import Card from '../Card'
import Tips from 'components/Tips'
import Modal from 'components/antd/Modal'
import TitleTips from '../TitleTips'
import { STAKING_HOPE_GOMBOC_ADDRESS } from '../../../../constants'
import { useActiveWeb3React } from '../../../../hooks'
import { useTokenPrice } from '../../../../hooks/liquidity/useBasePairs'
import { toUsdPrice } from 'hooks/ahp/usePortfolio'
// import Button from 'components/antd/Button'

type EChartsOption = echarts.ComposeOption<TitleComponentOption | PieSeriesOption>

export default function InvestmentAllocation({ data, lpData }: { data: any; lpData: any }) {
  const { chainId } = useActiveWeb3React()
  const addresses = useMemo(() => {
    return [STAKING_HOPE_GOMBOC_ADDRESS[chainId ?? 1]]
  }, [chainId])

  const { result: priceResult } = useTokenPrice(addresses)
  const allocations = useMemo(() => {
    return [
      {
        name: 'HOPE Staking',
        value: data.staking,
        formatValue: format.amountFormat(data.staking, 2),
        tips:
          'The total value of tokens currently held in the HOPE Staking contract, including the transferable, unstaking, and withdrawable portions of the address'
      },
      {
        name: 'Liquidity Pools',
        value: data.lp,
        formatValue: format.amountFormat(data.lp, 2),
        tips: 'Total value of assets withdrawable from liquidity pools'
      },
      {
        name: 'Yield Farming',
        value: data.yieldFarming,
        formatValue: format.amountFormat(data.yieldFarming, 2),
        tips: 'Total value of LP Tokens staked and pending rewards'
      },
      {
        name: 'Locked LT & Profits',
        value: data.profits,
        formatValue: format.amountFormat(data.profits, 2),
        tips: (
          <>
            <div>Locked LT: Total value of locked LT </div>
            <div>
              Profits: Platform fee income. veLT holders will receive 25% of all agreed fee income as an reward, as well
              as a portion of the Gömböc fee income during the voting period if they participate in the weighted vote of
              a Gömböc. Learn more
            </div>
          </>
        )
      }
    ]
  }, [data])
  const [visibleMap, setVisibleMap] = useState(false)
  useEffect(() => {
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
                    <div style="font-size: 14px;margin-top: 16px">${params.name}: </div>
                    <div style="font-size: 18px;margin-top: 8px">(${params.percent}%)</div>
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
          data: allocations.slice(0, (allocations.length / 2) | 0),
          textStyle: {
            color: '#fff',
            fontSize: 16
          }
        },
        {
          itemWidth: 10,
          itemHeight: 10,
          itemGap: 30,
          icon: 'circle',
          orient: 'vertical',
          left: 'right',
          top: 'bottom',
          data: allocations.slice((allocations.length / 2) | 0),
          textStyle: {
            color: '#fff',
            fontSize: 16
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
          data: allocations as any
        }
      ]
    }

    let myChart: echarts.ECharts | null = null
    setTimeout(() => {
      myChart = echarts.init(document.querySelector('#investment-allocation-map') as HTMLElement)
      myChart.setOption(option)
    })

    return () => {
      myChart && myChart.dispose()
    }
  }, [allocations, visibleMap])

  return (
    <div className="investment-allocation">
      <Card
        title={
          <>
            My Investment Allocation
            <i className="iconfont investment-allocation-title" onClick={() => setVisibleMap(true)}>
              &#xe611;
            </i>
          </>
        }
      >
        <div className="investment-allocation-top">
          <div className="investment-allocation-head">
            <div className="investment-allocation-total">
              <TitleTips
                title="Total Value"
                desc="Total value of holdings, withdrawable liquidity, rewards, staked HOPE, and HOPE held"
              />
            </div>
            <div className="investment-allocation-total2">
              {format.amountFormat(data.totalHope, 2)} HOPE ≈
              <span className="investment-allocation-total3">
                {' '}
                $
                {priceResult && priceResult[0] && priceResult[0].price
                  ? format.amountFormat(toUsdPrice(data.totalHope, priceResult[0].price), 2)
                  : '0.00'}
              </span>
            </div>
          </div>
        </div>
        <div className="investment-allocation-bottom">
          <div className="investment-allocation-content">
            {allocations.map((item, index) => {
              return (
                <div className="investment-allocation-box" key={index}>
                  <div className="investment-allocation-box-head">
                    <span className="investment-allocation-box-name">{item.name}</span>
                    <span className="investment-allocation-box-question">
                      <Tips title={item.tips} />
                    </span>
                  </div>
                  <div className="investment-allocation-box-amount">≈ {item.formatValue} HOPE</div>
                  <div className="investment-allocation-box-amount2">
                    ≈ $
                    {priceResult && priceResult[0] && priceResult[0].price
                      ? format.amountFormat(toUsdPrice(item.value, priceResult[0].price), 2)
                      : '0.00'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Card>
      <Modal width="500px" visible={visibleMap} onCancel={() => setVisibleMap(false)}>
        <div className="investment-allocation-wrap">
          <div className="investment-allocation-map" id="investment-allocation-map"></div>
        </div>
      </Modal>
    </div>
  )
}
