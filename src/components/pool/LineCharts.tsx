import React, { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

import format from '../../utils/format'

export default function PieCharts({ height = 320, xData, yData }: { height?: number; xData?: any; yData?: any }) {
  const chartRef: any = useRef()
  const handleResizeChart = (myChart: any) => {
    myChart && myChart.resize()
  }
  useEffect(() => {
    const myChart = echarts.init(chartRef.current)
    const option = {
      grid: { top: '6%', bottom: '15%', left: '5%', right: '5%' },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(51, 51, 60, 1)',
        borderColor: 'rgba(51, 51, 60, 1)',
        padding: 20,
        textStyle: {
          color: '#FFFFFF'
        },
        formatter: (params: any) => {
          return `
          <p style="font-family: 'Arboria-Book'; font-size: 16px;">${params[0].name}</p>
          <p style="font-family: 'Arboria-Medium'; font-size: 20px; margin-top: 12px;">
            <span style="display: inline-block; margin-right: 8px;background-color: #33333C;width:10px;height:10px;border-radius: 50%;border:3px solid #E4C989;"></span>
            ${format.amountFormat(params[0].value, 2)}
          </p>
          `
        }
      },
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
          fontSize: 16
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          show: false
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
    window.addEventListener('resize', () => handleResizeChart(myChart))
    return () => {
      window.removeEventListener('resize', () => handleResizeChart(myChart))
      myChart.dispose()
    }
  }, [xData, yData])
  return (
    <div>
      <div className="m-t-20" style={{ width: '100%', height: `${height}px` }} ref={chartRef} />
    </div>
  )
}
