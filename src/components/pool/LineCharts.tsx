import React, { useEffect, useRef } from 'react'
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
  is24Hour,
  getCurrentData
}: {
  xData?: any
  yData?: any
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
    let indexFlag = ''
    const option = {
      grid: { top: `${top || 6}%`, bottom: `${bottom || 15}%`, left: `${left || 5}%`, right: `${right || 4}%` },
      tooltip: {
        trigger: 'axis',
        // showContent: false
        backgroundColor: 'rgba(51, 51, 60, 1)',
        borderColor: 'rgba(51, 51, 60, 1)',
        padding: 20,
        textStyle: {
          color: '#FFFFFF'
        },
        formatter: (params: any) => {
          if (indexFlag !== params[0].dataIndex) {
            indexFlag = params[0].dataIndex
            const formatStr = is24Hour ? 'DD MMM YYYY HH:mm' : 'DD MMM YYYY'
            getCurrentData(format.formatDate(params[0].name, formatStr), format.amountFormat(params[0].value, 2))
          }
          return
        }
      },
      dataZoom: [{ type: 'inside' }],
      xAxis: {
        type: 'category',
        boundaryGap: false,
        offset: 10,
        data: xData,
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
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
        axisLabel: {
          color: '#ffffff',
          fontFamily: 'Arboria-Book',
          fontSize: 16,
          formatter: (value: any) => {
            return format.numFormat(Number(value), 2)
          }
        },
        splitLine: {
          show: true,
          lineStyle: { color: ['#9B8463'], width: 1, dashOffset: 0, type: [10, 4] }
        }
      },
      series: [
        {
          data: yData,
          type: 'line',
          showSymbol: false,
          lineStyle: {
            color: '#E4C989'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(228,201,137, 0.5)'
              },
              {
                offset: 1,
                color: 'rgba(228,201,137, 0.3)'
              }
            ])
          }
        }
      ]
    }
    myChart.setOption(option)
    if (xData && yData) {
      getCurrentData('total', total || '0')
      myChart.hideLoading()
    }
    myChart.getZr().on('mouseout', () => {
      getCurrentData('total', total || '0')
    })
    window.addEventListener('resize', () => handleResizeChart(myChart))
    return () => {
      myChart.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xData, yData, left, right, top, bottom])
  return (
    <div>
      <div className="m-t-20" style={{ width: '100%', height: `${height || 320}px` }} ref={chartRef} />
    </div>
  )
}
