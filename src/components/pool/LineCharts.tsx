import React, { useEffect, useRef, useState } from 'react'
import { PoolInfo } from '../../state/stake/hooks'
// import Row from '../Row'
import * as echarts from 'echarts'
import Row from 'components/Row'
import styled from 'styled-components'

interface TabListInterface {
  label: string
  value: number
}

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

export default function PieCharts({ pool }: { pool?: PoolInfo }) {
  const [tabIndex, setTabIndex] = useState(1)
  const [timeIndex, setTimeIndex] = useState(1)
  const chartRef: any = useRef()
  console.log(pool)
  const tabChange = (e: number) => {
    setTabIndex(e)
  }

  const timeChange = (e: number) => {
    setTimeIndex(e)
  }

  const TabList = () => {
    const tabList: TabListInterface[] = [
      { label: 'Volume', value: 1 },
      { label: 'TVL', value: 2 },
      { label: 'Fees', value: 3 }
    ]
    return (
      <Row>
        {tabList.map((item, index) => {
          return (
            <TabItem key={index} isActive={item.value === tabIndex} onClick={() => tabChange(item.value)}>
              {item.label}
            </TabItem>
          )
        })}
      </Row>
    )
  }

  const TimeList = () => {
    const timeList: TabListInterface[] = [
      { label: '24H', value: 1 },
      { label: '1W', value: 2 },
      { label: '1M', value: 3 }
    ]
    return (
      <Row justify={'flex-end'}>
        {timeList.map((item, index) => {
          return (
            <TimeItem key={index} isActive={item.value === timeIndex} onClick={() => timeChange(item.value)}>
              {item.label}
            </TimeItem>
          )
        })}
      </Row>
    )
  }

  useEffect(() => {
    const myChart = echarts.init(chartRef.current)
    const option = {
      grid: { top: '6%', bottom: '10%', left: '0%', right: '0%' },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        offset: 10,
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
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
          data: [820, 32, 901, 134, 1290, 900, 620],
          type: 'line',
          showSymbol: false,
          lineStyle: {
            color: '#E4C989'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(219, 192, 126, 0.8)'
              },
              {
                offset: 1,
                color: 'rgba(219, 192, 126, 0.3)'
              }
            ])
          }
        }
      ]
    }
    myChart.setOption(option)
    return () => {
      myChart.dispose()
    }
  }, [])
  return (
    <div>
      <div className="charts-tab">
        <TabList></TabList>
        <Row marginTop={28} justify={'space-between'} align={'center'}>
          <p className="font-nor" style={{ width: '100%' }}>
            <span className="text-success">+227.543364 USDC</span> Past 24 Hours
          </p>
          <TimeList></TimeList>
        </Row>
      </div>
      <div className="m-t-20" style={{ width: '100%', height: '320px' }} ref={chartRef} />
    </div>
  )
}
