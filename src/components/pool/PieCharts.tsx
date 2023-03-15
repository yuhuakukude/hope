import React, { useEffect, useRef } from 'react'
// import Row from '../Row'
import * as echarts from 'echarts'

export default function PieCharts({ data, size }: { data?: any; size?: number }) {
  const chartRef: any = useRef()
  const handleResizeChart = (pieChart: any) => {
    pieChart && pieChart.resize()
  }
  useEffect(() => {
    const pieChart = echarts.init(chartRef.current)
    const option = {
      series: [
        {
          silent: true,
          type: 'pie',
          color: ['#E4C989', '#66FFA6'],
          radius: ['45%', '100%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: size ? 1 : 4,
            borderColor: '#26262C',
            borderWidth: size ? 2 : 4
          },
          label: {
            show: false,
            position: 'center'
          },
          labelLine: {
            show: false
          },
          data
        }
      ]
    }
    pieChart.setOption(option)
    window.addEventListener('resize', () => handleResizeChart(pieChart))
    return () => {
      window.removeEventListener('resize', () => handleResizeChart(pieChart))
    }
  }, [data, size])
  return <div style={{ width: `${size ? size : 80}px`, height: `${size ? size : 80}px` }} ref={chartRef} />
}
