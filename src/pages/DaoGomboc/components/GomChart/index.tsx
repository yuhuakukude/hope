import React, { useRef, useEffect, useCallback, useState } from 'react'
import './index.scss'
import * as echarts from 'echarts'
import { TitleComponentOption } from 'echarts/components'
import { PieSeriesOption } from 'echarts/charts'
import { VELT } from '../../../../constants'
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
          const arr: { name: string; value: string }[] = []
          votArr.forEach((e: any) => {
            if (e.gaugeController && e.gaugeController.getGombocWeight && e.gaugeController.gombocRelativeWeight) {
              const num = new TokenAmount(VELT[chainId ?? 1], JSBI.BigInt(e.gaugeController.getGombocWeight))
              // const re = new TokenAmount(VELT[chainId ?? 1], JSBI.BigInt(e.gaugeController.gombocRelativeWeight))
              // const ra = re.multiply(JSBI.BigInt(100))
              // textVal = `${num?.toFixed(2, { groupSeparator: ',' })} (${ra?.toFixed(2)})`
              // console.log(textVal)
              const item = {
                name: e.name as string,
                value: num.toFixed(2)
              }
              arr.push(item)
            }
          })

          const option: EChartsOption = {
            tooltip: {
              trigger: 'item',
              textStyle: {
                color: '#fff',
                fontSize: 14
              },
              formatter: (params: { name: string; value: number; percent: number }) => {
                return `<div>
                    <div style="font-size: 14px;">
                    Gömböc Relative Weight
                    </div>
                    <div style="font-size: 14px;margin-top: 16px">${params.name}: </div>
                    <div style="font-size: 18px;margin-top: 8px">${params.value}(${params.percent}%)</div>
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
      <h3 className="font-bolder text-white font-20">Proposed Gömböc Weight Changes</h3>
      <p className="m-t-20 text-white lh15">
        Gömböc weights are used to determine how much $LT does each protocol or pool get. You can vote for gömböc weight
        with your veLT ( locked $LT tokens in
        <NavLink to={'/dao/locker'}>
          <span className="text-primary"> Locker </span>
        </NavLink>
        ).
      </p>
      <div className="chart-box m-t-60">
        <div ref={voteChartRef as any} className="voting-chart" id="votingchart" />
      </div>
      <p className="m-t-10 text-center font-14 m-b-30">
        Proposed Gömböc Weight Changes taking effect on {nextEffectTime || '--'} UTC
      </p>
    </div>
  )
}

export default GomChart
