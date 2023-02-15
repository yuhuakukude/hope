import React, { useEffect, useRef } from 'react'
// import Row from '../Row'
import * as echarts from 'echarts'

export default function PieCharts({ data, size }: { data?: any; size?: number }) {
  const chartRef: any = useRef()

  const handleResizeChart = (myChart: any) => {
    myChart && myChart.resize()
  }
  useEffect(() => {
    const myChart = echarts.init(chartRef.current)
    const option = {
      series: [
        {
          silent: true,
          type: 'pie',
          color: ['#E4C989', '#66FFA6'],
          radius: ['50%', '100%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: size ? 1 : 5,
            borderColor: '#26262C',
            borderWidth: size ? 2 : 5
          },
          label: {
            show: false,
            position: 'center'
          },
          labelLine: {
            show: false
          },
          data: data
        }
      ]
    }
    myChart.setOption(option)
    window.addEventListener('resize', () => handleResizeChart(myChart))
    return () => {
      window.removeEventListener('resize', () => handleResizeChart(myChart))
      myChart.dispose()
    }
  }, [data, size])
  return <div style={{ width: `${size ? size : 120}px`, height: `${size ? size : 120}px` }} ref={chartRef} />
}
