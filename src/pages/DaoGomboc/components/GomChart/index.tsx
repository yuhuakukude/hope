import React, { useRef, useEffect, useCallback, useState } from 'react'
import './index.scss'
import * as echarts from 'echarts'
import { TitleComponentOption } from 'echarts/components'
import { PieSeriesOption } from 'echarts/charts'
import { TokenAmount } from '@uniswap/sdk'
import { useActiveWeb3React } from '../../../../hooks'
import { JSBI } from '@uniswap/sdk'
import { NavLink } from 'react-router-dom'
import { getStakingHopeGaugeAddress, getVELTToken } from 'utils/addressHelpers'
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
          const veLTToken = getVELTToken(chainId)
          votArr.forEach((e: any) => {
            if (e.gaugeController && e.gaugeController.getGaugeWeight && e.gaugeController.gaugeRelativeWeight) {
              const num = new TokenAmount(veLTToken, JSBI.BigInt(e.gaugeController.getGaugeWeight))
              const re = new TokenAmount(veLTToken, JSBI.BigInt(e.gaugeController.gaugeRelativeWeight))
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
          // for (let index = 0; index < 50; index++) {
          //   const item: any = {
          //     name: `dome${index}`,
          //     value: Math.random() * 10000,
          //     ravPercent: Math.random() * 10000,
          //     gomboc: ''
          //   }
          //   arr.push(item)
          // }
          const addr = `${getStakingHopeGaugeAddress(chainId)}`.toLocaleLowerCase()
          const option: EChartsOption = {
            color: [
              '#534DD1',
              '#ED6E57',
              '#FFC96C',
              '#78BF79',
              '#54919B',
              '#2A586E',
              '#6C3D92',
              '#BC43CA', // 后面的为echarts颜色库
              '#5470c6',
              '#91cc75',
              '#fac858',
              '#ee6666',
              '#73c0de',
              '#3ba272',
              '#fc8452',
              '#9a60b4',
              '#ea7ccc'
            ],
            tooltip: {
              trigger: 'item',
              textStyle: {
                color: '#fff',
                fontSize: 14
              },
              formatter: (params: { name: string; value: number; data: any }) => {
                return `<div>
                    <div style="font-size: 14px; fontFamily: 'Arboria-Medium'">
                      Gauge Relative Weight
                    </div>
                    <div style="font-size: 14px;margin-top: 16px; fontFamily: 'Arboria-Book'">${params.name}: ${
                  addr === params.data.gauge ? '(stHOPE)' : ''
                }</div>
                    <div style="font-size: 18px;margin-top: 8px; fontFamily: 'Arboria-Medium'">${params.value}(${
                  params.data.ravPercent
                }%)</div>
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
                  color: '#A8A8AA',
                  rotate: 0,
                  show: true,
                  overflow: 'truncate',
                  bleedMargin: 10,
                  fontFamily: 'Arboria-Book'
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
      <h3 className="font-bolder text-white font-20">Gauge Weights</h3>
      <p className="m-t-20 text-white lh15 font-nor">
        The distribution of LT rewards between pools and protocols is governed by Gauge Weights, which will be updated
        every voting cycle (currently set to one week).
      </p>
      <p className="m-t-20 text-white lh15 font-nor">
        You can vote for specific Gauges with veLT ( obtainable after locking LT in{' '}
        <NavLink to={'/dao/locker'}>
          <span className="text-primary"> LT Locker </span>
        </NavLink>{' '}
        ), and get voting rewards.
      </p>
      <div className="chart-box m-t-60">
        <div ref={voteChartRef as any} className="voting-chart" id="votingchart" />
      </div>
      <p className="m-t-10 text-center font-nor m-b-30 text-normal">
        Gauge Weights during the next voting cycle, taking effect on {nextEffectTime || '--'} UTC
      </p>
    </div>
  )
}

export default GomChart
