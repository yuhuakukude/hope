import React, { useEffect, useMemo, useRef } from 'react'
import * as echarts from 'echarts'
import { TitleComponentOption } from 'echarts/components'
import { PieSeriesOption } from 'echarts/charts'
import format from 'utils/format'
import './index.scss'
import Card from '../Card'
import TitleTips from '../TitleTips'
import { PortfolioInfo } from 'api/portfolio.api'
import Tips from 'components/Tips'

type EChartsOption = echarts.ComposeOption<TitleComponentOption | PieSeriesOption>

export default function InvestmentAllocation({ data }: { data: PortfolioInfo }) {
  const chartRef = useRef<any>()
  const allocations = useMemo(() => {
    return [
      {
        name: 'HOPE',
        value: data.hope,
        formatValue: format.amountFormat(data.hope, 2),
        tips: 'Total amount of HOPE held'
      },
      {
        name: 'stHOPE',
        value: data.stHope,
        formatValue: format.amountFormat(data.stHope, 2),
        tips: 'Total amount of stHOPE held'
      },
      {
        name: 'Pool',
        value: data.hopeOfPool,
        formatValue: format.amountFormat(data.hopeOfPool, 2),
        tips: 'Total value of assets withdrawable from liquidity pools'
      },
      {
        name: 'Farming',
        value: data.hopeOfFarming,
        formatValue: format.amountFormat(data.hopeOfFarming, 2),
        tips: 'Total value of LP Tokens staked and pending rewards'
      },
      {
        name: 'Govern',
        value: data.hopeOfGovern,
        formatValue: format.amountFormat(data.hopeOfGovern, 2),
        tips: 'Total value of locked LT'
      },
      {
        name: 'LT',
        value: data.hopeOfLt,
        formatValue: format.amountFormat(data.hopeOfLt, 2),
        tips: 'Total value of LT held'
      }
    ]
  }, [data])
  useEffect(() => {
    const option: EChartsOption = {
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
          right: 'right',
          top: 'center',
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
          right: '18%',
          top: 'center',
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
          bottom: 0,
          data: allocations as any
        }
      ]
    }
    const myChart = echarts.init(chartRef.current)
    myChart.setOption(option)
    return () => {
      myChart.dispose()
    }
  }, [allocations])

  return (
    <div className="investment-allocation">
      <Card>
        <div className="investment-allocation-top">
          <div className="investment-allocation-head">
            <div className="investment-allocation-title">My Investment Allocation</div>
            <div className="investment-allocation-total">
              <TitleTips
                title="Total Value"
                desc="Total value of holdings, withdrawable liquidity, rewards, staked HOPE, and HOPE held"
              />
            </div>
            <div className="investment-allocation-total2">{format.amountFormat(data.totalHope, 2)} HOPE </div>
            <div className="investment-allocation-total3">~ ${format.amountFormat(data.usdOfTotalHope, 2)}</div>
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
                  <div className="investment-allocation-box-amount">~ {item.formatValue} HOPE</div>
                </div>
              )
            })}
          </div>
          <div className="investment-allocation-map" ref={chartRef}></div>
        </div>
      </Card>
    </div>
  )
}
