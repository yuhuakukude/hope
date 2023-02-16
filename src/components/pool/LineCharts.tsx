import React, { useEffect, useRef, useState } from 'react'
import { Decimal } from 'decimal.js'
import * as echarts from 'echarts'
import Row from 'components/Row'
import styled from 'styled-components'
import { useLineDaysChartsData, useLine24HourChartsData } from '../../hooks/useCharts'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import format from '../../utils/format'
dayjs.extend(utc)

const TabItem = styled.div<{ isActive?: boolean }>`
  color: ${({ isActive }) => (isActive ? '#E4C989' : '#a8a8aa')};
  font-size: 20px;
  font-family: Arboria-Medium;
  margin-right: 40px;
  cursor: pointer;
  user-select: none;
  position: relative;
  padding-bottom: 12px;
  &:hover {
    color: #e4c989;
  }
  &::after {
    content: '';
    width: 24px;
    height: 2px;
    display: ${({ isActive }) => (isActive ? 'block' : 'none')};
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translate(-50%, 0);
    background: #e4c989;
  }
`

const TimeItem = styled.div<{ isActive?: boolean }>`
  color: #fff;
  font-size: 16px;
  width: 60px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  border-radius: 16px;
  cursor: pointer;
  user-select: none;
  margin-left: 16px;
  background-color: ${({ isActive }) => (isActive ? '#434343' : 'none')};
  &:hover {
    background-color: #434343;
  }
`
export default function PieCharts({
  hideTab = false,
  height = 320,
  address
}: {
  hideTab?: boolean
  height?: number
  address?: string
}) {
  const [tabIndex, setTabIndex] = useState('Volume')
  const [timeIndex, setTimeIndex] = useState('24H')
  const [xData, setXData] = useState<string[]>()
  const [yData, setYData] = useState<string[]>()
  const chartRef: any = useRef()
  const { result: dayChartResult } = useLineDaysChartsData(address ?? '')
  const { result: hourChartResult } = useLine24HourChartsData(address ?? '')
  const getTimeframe = (timeWindow: string) => {
    const utcEndTime = dayjs.utc()
    let utcStartTime = undefined
    if (timeWindow === '1W') {
      utcStartTime =
        utcEndTime
          .subtract(1, 'week')
          .endOf('day')
          .unix() - 1
    }
    if (timeWindow === '1M') {
      utcStartTime =
        utcEndTime
          .subtract(1, 'month')
          .endOf('day')
          .unix() - 1
    }
    return utcStartTime
  }
  const tabChange = (e: string) => {
    setTabIndex(e)
  }
  const timeChange = (e: string) => {
    setTimeIndex(e)
  }

  const TabList = () => {
    return (
      <Row>
        {['Volume', 'TVL', 'Fees'].map((item, index) => {
          return (
            <TabItem key={index} isActive={item === tabIndex} onClick={() => tabChange(item)}>
              {item}
            </TabItem>
          )
        })}
      </Row>
    )
  }

  const TimeList = () => {
    return (
      <Row justify={'flex-end'}>
        {['24H', '1W', '1M'].map((item, index) => {
          return (
            <TimeItem key={index} isActive={item === timeIndex} onClick={() => timeChange(item)}>
              {item}
            </TimeItem>
          )
        })}
      </Row>
    )
  }
  const handleResizeChart = (myChart: any) => {
    myChart && myChart.resize()
  }
  useEffect(() => {
    const utcStartTime = getTimeframe(timeIndex)
    const xArr: string[] = []
    const yArr: string[] = []
    const result = timeIndex === '24H' ? hourChartResult : dayChartResult
    result?.forEach((item: any) => {
      if (timeIndex === '24H') {
        if (tabIndex === 'Volume') {
          yArr.push(item.hourlyVolumeUSD?.toFixed(2))
        }
        if (tabIndex === 'TVL') {
          yArr.push(item.reserveUSD?.toFixed(2))
        }
        if (tabIndex === 'Fees') {
          yArr.push(
            new Decimal(item.hourlyVolumeUSD || 0)
              .mul(new Decimal(0.003))
              .toNumber()
              .toFixed(2)
          )
        }
        xArr.push(format.formatUTCDate(item.hourStartUnix, 'HH:mm'))
      } else if (utcStartTime && item.date >= utcStartTime) {
        if (tabIndex === 'Volume') {
          yArr.push(item.dailyVolumeUSD?.toFixed(2))
        }
        if (tabIndex === 'TVL') {
          yArr.push(item.reserveUSD?.toFixed(2))
        }
        if (tabIndex === 'Fees') {
          yArr.push(
            new Decimal(item.dailyVolumeUSD || 0)
              .mul(new Decimal(0.003))
              .toNumber()
              .toFixed(2)
          )
        }
        xArr.push(format.formatUTCDate(item.date, 'YYYY-MM-DD'))
      }
    })
    setXData(xArr)
    setYData(yArr)
  }, [timeIndex, tabIndex, hourChartResult, dayChartResult])

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
  }, [xData, yData, address])
  return (
    <div>
      {!hideTab && (
        <div className="charts-tab">
          <TabList></TabList>
          <Row marginTop={28} justify={'space-between'} align={'center'}>
            <p className="font-nor" style={{ width: '100%' }}>
              <span className="text-success">+227.543364 USDC</span> Past 24 Hours
            </p>
            <TimeList></TimeList>
          </Row>
        </div>
      )}
      <div className="m-t-20" style={{ width: '100%', height: `${height}px` }} ref={chartRef} />
    </div>
  )
}
