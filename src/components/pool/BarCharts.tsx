import React, { useEffect, useRef, useState } from 'react'
// import Row from '../Row'
import * as echarts from 'echarts'
import format from '../../utils/format'

export default function BarCharts({
  xData,
  yData,
  top,
  left,
  bottom,
  right,
  height,
  total,
  is24Hour,
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
  is24Hour?: boolean
  getCurrentData: (xCurrent: string, yCurrent: string) => void
}) {
  const chartRef: any = useRef()
  const [indexFlag, setIndexFlag] = useState('')
  const handleResizeChart = (myChart: any) => {
    myChart && myChart.resize()
  }

  useEffect(() => {
    const myChart = echarts.init(chartRef.current)
    myChart.showLoading({
      text: '',
      color: '#E4C989',
      maskColor: 'rgba(255, 255, 255, 0)'
    })
    const option = {
      grid: { top: `${top || 6}%`, bottom: `${bottom || 15}%`, left: `${left || 6}%`, right: `${right || 4}%` },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(51, 51, 60, 1)',
        borderColor: 'rgba(51, 51, 60, 1)',
        padding: 20,
        textStyle: {
          color: '#FFFFFF'
        },
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          if (indexFlag !== params[0].dataIndex) {
            setIndexFlag(params[0].dataIndex)
            const formatStr = is24Hour ? 'DD MMM YYYY HH:mm' : 'DD MMM YYYY'
            getCurrentData(format.formatDate(params[0].name, formatStr), params[0].value)
          }
          return
        }
      },
      dataZoom: [{ type: 'inside' }],
      xAxis: {
        type: 'category',
        data: xData,
        axisLabel: {
          color: '#ffffff',
          fontFamily: 'Arboria-Book',
          fontSize: 16,
          formatter: (value: any) => {
            const formatStr = is24Hour ? 'HH:mm' : 'DD MMM'
            return format.formatDate(value, formatStr)
          }
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
          fontSize: 16,
          formatter: (value: any) => {
            return format.numFormat(Number(value), 2)
          }
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
    if (xData && yData) {
      getCurrentData('total', total ? total : 'total')
      myChart.hideLoading()
    }
    myChart.getZr().on('mouseout', () => {
      setIndexFlag('')
      getCurrentData('total', total ? total : 'total')
    })
    window.addEventListener('resize', () => handleResizeChart(myChart))
    return () => {
      window.removeEventListener('resize', () => handleResizeChart(myChart))
      myChart.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xData, yData, left, right, top, bottom])
  return <div className="m-t-20" style={{ width: '100%', height: `${height || 260}px` }} ref={chartRef} />
}
