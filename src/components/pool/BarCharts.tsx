import React, { useEffect, useRef } from 'react'
// import Row from '../Row'
import * as echarts from 'echarts'
import format from '../../utils/format'

export default function PieCharts({
  xData,
  yData,
  top,
  left,
  bottom,
  right,
  height,
  total,
  getCurrentData
}: {
  xData: any
  yData: any
  top?: number
  left?: number
  bottom?: number
  right?: number
  height?: number
  total?: string
  getCurrentData: (xCurrent: string, yCurrent: string) => void
}) {
  const chartRef: any = useRef()

  const handleResizeChart = (myChart: any) => {
    myChart && myChart.resize()
  }

  useEffect(() => {
    const myChart = echarts.init(chartRef.current)
    const option = {
      grid: { top: `${top || 6}%`, bottom: `${bottom || 15}%`, left: `${left || 10}%`, right: `${right || 3}%` },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(51, 51, 60, 1)',
        borderColor: 'rgba(51, 51, 60, 1)',
        padding: 20,
        textStyle: {
          color: '#FFFFFF'
        },
        formatter: (params: any) => {
          getCurrentData(params[0].name, format.amountFormat(params[0].value, 2))
          return
        }
      },
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
    getCurrentData('total', total || '0')
    myChart.getZr().on('mouseout', () => {
      getCurrentData('total', total || '0')
    })
    window.addEventListener('resize', () => handleResizeChart(myChart))
    return () => {
      myChart.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xData, yData, left, right, top, bottom])
  return <div className="m-t-20" style={{ width: '100%', height: `${height || 260}px` }} ref={chartRef} />
}
