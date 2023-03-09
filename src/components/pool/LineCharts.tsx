import React, { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

import format from '../../utils/format'

export default function LineCharts({
  xData,
  yData,
  top,
  left,
  bottom,
  right,
  height,
  is24Hour
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
    const option = {
      grid: { top: `${top || 6}%`, bottom: `${bottom || 15}%`, left: `${left || 6.5}%`, right: `${right || 4}%` },
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
          const formatStr = is24Hour ? 'DD MMM YYYY HH:mm' : 'DD MMM YYYY'
          return `
            <p style="font-family: 'Arboria-Book'; font-size: 16px;">${format.formatDate(params[0].name, formatStr)}</p>
            <p style="font-family: 'Arboria-Medium'; font-size: 20px; margin-top: 12px;">
              <span style="display: inline-block; margin-right: 8px;background-color: #33333C;width:10px;height:10px;border-radius: 50%;border:3px solid #E4C989;"></span>
              ${params[0].value > 0 ? '≈' : ''} $${format.amountFormat(params[0].value, 2)}
            </p>
          `
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
      myChart.hideLoading()
    }
    window.addEventListener('resize', () => handleResizeChart(myChart))
    return () => {
      window.removeEventListener('resize', () => handleResizeChart(myChart))
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
