import React, { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import { TitleComponentOption } from 'echarts/components'
import { PieSeriesOption } from 'echarts/charts'

import './index.scss'
import Card from '../Card'
import TitleTips from '../TitleTips'

type EChartsOption = echarts.ComposeOption<TitleComponentOption | PieSeriesOption>

export default function InvestmentAllocation() {
  const chartRef = useRef<any>()
  const arr = [
    { name: 'HOPE', value: '1' },
    { name: 'stHOPE', value: '2' },
    { name: 'Pool', value: '3' },
    { name: 'Farming', value: '4' },
    { name: 'Govern', value: '5' },
    { name: 'LT', value: '6' }
  ]
  useEffect(() => {
    const option: EChartsOption = {
      tooltip: {
        trigger: 'item'
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
          data: arr.slice(0, (arr.length / 2) | 0),
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
          data: arr.slice((arr.length / 2) | 0),
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
          data: arr as any
        }
      ]
    }
    const myChart = echarts.init(chartRef.current)
    myChart.setOption(option)
    return () => {
      myChart.dispose()
    }
  }, [arr])

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
            <div className="investment-allocation-total2">12,123,456,789.01 HOPE </div>
            <div className="investment-allocation-total3">~ $123,456,789.00</div>
          </div>
        </div>
        <div className="investment-allocation-bottom">
          <div className="investment-allocation-content">
            {[0, 1, 2, 3, 4, 5].map(index => {
              return (
                <div className="investment-allocation-box" key={index}>
                  <div className="investment-allocation-box-head">
                    <span className="investment-allocation-box-name">HOPE</span>
                    <span className="investment-allocation-question"></span>
                  </div>
                  <div className="investment-allocation-box-amount">~ 123,456,789.00 HOPE</div>
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
