import React, { useEffect, useRef } from 'react'
// import Row from '../Row'
import * as echarts from 'echarts'

export default function PieCharts({ xData, yData }: { xData: any; yData: any }) {
  const chartRef: any = useRef()

  useEffect(() => {
    const myChart = echarts.init(chartRef.current)
    const option = {
      grid: { top: '6%', bottom: '15%', left: '10%', right: '3%' },
      xAxis: {
        type: 'category',
        data: xData,
        axisLabel: {
          color: '#ffffff',
          fontFamily: 'Arboria-Book',
          fontSize: 16
        }
      },
      yAxis: {
        type: 'value',
        splitLine: {
          show: true,
          lineStyle: { color: ['#9B8463'], width: 1, dashOffset: 0, type: [10, 4] }
        },
        axisLabel: {
          color: '#ffffff',
          fontFamily: 'Arboria-Book',
          fontSize: 16
        }
      },
      series: [
        {
          data: yData,
          type: 'bar',
          showBackground: true,
          backgroundStyle: {
            color: 'rgba(242, 232, 208, .1)'
          },
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(228,201,137, 1)' },
              { offset: 0.5, color: 'rgba(228,201,137, 0.8)' },
              { offset: 1, color: 'rgba(228,201,137, 0.3)' }
            ])
          }
        }
      ]
    }
    myChart.setOption(option)
    return () => {
      myChart.dispose()
    }
  }, [xData, yData])
  return <div className="m-t-20" style={{ width: '100%', height: `260px` }} ref={chartRef} />
}
