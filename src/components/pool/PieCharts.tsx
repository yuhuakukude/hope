import React, { useEffect, useRef } from 'react'
import { PoolInfo } from '../../state/stake/hooks'
// import Row from '../Row'
import * as echarts from 'echarts'

export default function PieCharts({ pool }: { pool?: PoolInfo }) {
  console.log(pool)
  const chartRef: any = useRef()

  useEffect(() => {
    const myChart = echarts.init(chartRef.current)
    const option = {
      series: [
        {
          name: 'Access From',
          type: 'pie',
          radius: ['50%', '100%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 5,
            borderColor: '#26262C',
            borderWidth: 5
          },
          label: {
            show: false,
            position: 'center'
          },
          labelLine: {
            show: false
          },
          data: [200, 100]
        }
      ]
    }
    myChart.setOption(option)
    return () => {
      myChart.dispose()
    }
  }, [])
  return <div style={{ width: '120px', height: '120px' }} ref={chartRef} />
}
