import React, { useRef, useEffect, useCallback, useState } from 'react'
import './index.scss'
import * as echarts from 'echarts'
import { TitleComponentOption } from 'echarts/components';
import {  PieSeriesOption } from 'echarts/charts';
import { ethers } from 'ethers'
// import GombocApi from '../../../../../api/gomboc.api'

interface GomChartProps {
  votiingData: any
}

type EChartsOption = echarts.ComposeOption<
  TitleComponentOption | PieSeriesOption
>;

const GomChart = ({ votiingData }: GomChartProps) => {
  const [nextEffectTime, setNextEffectTime] = useState('')
  const voteChartRef = useRef<any>()
  const initFn = useCallback(
    async myChart => {
      // const res = await GombocApi.getGombocsVotiing()
      if (votiingData && votiingData.nextEffectTime && votiingData.votingList) {
        if (votiingData.nextEffectTime) {
          setNextEffectTime(votiingData.nextEffectTime)
        }
        const votArr = votiingData.votingList
        if (votArr && votArr.length > 0) {
          const arr: {name: string, value: string}[] = []
          votArr.forEach((e: any) => {
            let num = '0'
            if (e.gaugeController && e.gaugeController.getGombocWeight) {
              num = ethers.utils.formatUnits(`${e.gaugeController.getGombocWeight}`, 18)
            }
            const item = {
              name: e.name as string,
              value: num
            }
            arr.push(item)
          })

          const option:EChartsOption = {
            tooltip: {
              trigger: 'item'
            },
            legend: {
              show: false
            },
            series: [{
              type: 'pie',
              radius: [70,120],
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
                bleedMargin: 10,
              },
              labelLine: {
                length: 15,
                length2: 10,
                maxSurfaceAngle: 80
              },
              data: arr as any
            }]
          }
          myChart.setOption(option)
        }
      }
    },
    [votiingData]
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
        with your veLT (locked $LT tokens in <span className="text-primary">Locker</span>).
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
