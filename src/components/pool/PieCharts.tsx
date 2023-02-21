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
          data: [50, 50]
        }
      ]
    }
    pieChart.setOption(option)
    window.addEventListener('resize', () => handleResizeChart(pieChart))
    return () => {
      window.removeEventListener('resize', () => handleResizeChart(pieChart))
      pieChart.dispose()
    }
  }, [size])
  return <div style={{ width: `${size ? size : 120}px`, height: `${size ? size : 120}px` }} ref={chartRef} />
}
