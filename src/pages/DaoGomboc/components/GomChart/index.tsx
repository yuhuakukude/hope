import React, { useRef, useEffect, useCallback, useState } from 'react'
import './index.scss'
import * as echarts from 'echarts'
import { TitleComponentOption } from 'echarts/components'
import { PieSeriesOption } from 'echarts/charts'
import { VELT, STAKING_HOPE_GAUGE_ADDRESS } from '../../../../constants'
import { TokenAmount } from '@uniswap/sdk'
import { useActiveWeb3React } from '../../../../hooks'
import { JSBI } from '@uniswap/sdk'
import { NavLink } from 'react-router-dom'
interface GomChartProps {
  votiingData: any
}

type EChartsOption = echarts.ComposeOption<TitleComponentOption | PieSeriesOption>

const GomChart = ({ votiingData }: GomChartProps) => {
  const { chainId } = useActiveWeb3React()
  const [nextEffectTime, setNextEffectTime] = useState('')
  const voteChartRef = useRef<any>()
  const initFn = useCallback(
    async myChart => {
      if (votiingData && votiingData.nextEffectTime && votiingData.votingList) {
        if (votiingData.nextEffectTime) {
          setNextEffectTime(votiingData.nextEffectTime)
        }
        const votArr = votiingData.votingList
        if (votArr && votArr.length > 0) {
          const arr: { name: string; value: string; ravPercent: string }[] = []
          votArr.forEach((e: any) => {
            if (e.gaugeController && e.gaugeController.getGaugeWeight && e.gaugeController.gaugeRelativeWeight) {
              const num = new TokenAmount(VELT[chainId ?? 1], JSBI.BigInt(e.gaugeController.getGaugeWeight))
              const re = new TokenAmount(VELT[chainId ?? 1], JSBI.BigInt(e.gaugeController.gaugeRelativeWeight))
              const ra = re.multiply(JSBI.BigInt(100))
              const rav = ra.toFixed(2, { groupSeparator: '' }, 0)
              const item = {
                name: e.name as string,
                value: num.toFixed(2),
                ravPercent: rav,
                gauge: e.gauge
              }
              arr.push(item)
            }
          })
          const addr = `${STAKING_HOPE_GAUGE_ADDRESS[chainId ?? 1]}`.toLocaleLowerCase()
          const option: EChartsOption = {
            tooltip: {
              trigger: 'item',
              textStyle: {
                color: '#fff',
                fontSize: 14
              },
              formatter: (params: { name: string; value: number; data: any }) => {
                return `<div>
                    <div style="font-size: 14px;">
                    Gauge Relative Weight
                    </div>
                    <div style="font-size: 14px;margin-top: 16px">${params.name}: ${
                  addr === params.data.gauge ? '(stHOPE)' : ''
                }</div>
                    <div style="font-size: 18px;margin-top: 8px">${params.value}(${params.data.ravPercent}%)</div>
                  </div>`
              },
              padding: 20,
              backgroundColor: 'rgb(51, 51, 60)',
              borderRadius: 10,
              borderWidth: 0
            },
            legend: {
              show: false
            },
            series: [
              {
                type: 'pie',
                radius: [70, 120],
                colorBy: 'data',
                label: {
                  alignTo: 'labelLine',
                  position: 'outer',
                  distanceToLabelLine: 6,
                  lineHeight: 14,
                  fontSize: 14,
                  color: '#FFA8A8',
                  rotate: 0,
                  show: true,
                  overflow: 'truncate',
                  bleedMargin: 10
                },
                labelLine: {
                  length: 25,
                  length2: 20,
                  maxSurfaceAngle: 80
                },
                data: arr as any
              }
            ]
          }
          myChart.setOption(option)
        }
      }
    },
    [votiingData, chainId]
  )

  const init = useCallback(
    async myChart => {
      await initFn(myChart)
    },
    [initFn]
  )

  useEffect(() => {
    const myChart = echarts.init(voteChartRef.current)
    init(myChart)
    return () => {
      myChart.dispose()
    }
  }, [init, votiingData])

  return (
    <div className="gom-chart-box">
      <h3 className="font-bolder text-white font-20">Gauge Weight Changes</h3>
      <p className="m-t-20 text-white lh15">
        Gauge weights are used to determine how much LT does each protocol or pool get. You can vote for Gauge weights
        with your veLT ( locked LT tokens in
        <NavLink to={'/dao/locker'}>
          <span className="text-primary"> Locker </span>
        </NavLink>
        ).
      </p>
      <div className="chart-box m-t-60">
        <div ref={voteChartRef as any} className="voting-chart" id="votingchart" />
      </div>
      <p className="m-t-10 text-center font-14 m-b-30">
        Proposed Gauge Weight Changes taking effect on {nextEffectTime || '--'} UTC
      </p>
    </div>
  )
}

export default GomChart
