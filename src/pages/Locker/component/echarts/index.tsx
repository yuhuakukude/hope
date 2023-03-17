import React, { useRef, useState, useCallback, useEffect } from 'react'
import LockerApi from '../../../../api/locker.api'
import { LT } from '../../../../constants'
import { useActiveWeb3React } from '../../../../hooks'
import * as echarts from 'echarts'
import { TokenAmount } from '@uniswap/sdk'
import './index.scss'
import format from '../../../../utils/format'
import { useLocker } from '../../../../hooks/ahp/useLocker'
import moment from 'moment'

export default function LockerEcharts() {
  const { chainId } = useActiveWeb3React()
  const chartRef: any = useRef()
  const [lockTime, setLockTime] = useState<any>('0')
  const [isHasData, setIsHasData] = useState<boolean>(false)
  const [earningsAmount, setEarningsAmount] = useState<any>('0')
  const { ltTotalAmounnt, veltTotalAmounnt } = useLocker()
  const initFn = useCallback(
    async (myChart: any) => {
      try {
        const res = await LockerApi.getBannerCharts()
        if (res && res.result) {
          setLockTime(res.result.averageOfLockTime || '--')
          setEarningsAmount(res.result.earningsAmount || '--')
          let arr = res.result.lockedLtList || []
          arr = arr.filter((e: any) => {
            return moment(e.snapshotDate).isBetween(
              moment()
                .subtract(7, 'days')
                .format('YYYY-MM-DD'),
              moment().format('YYYY-MM-DD'),
              null,
              '[)'
            )
          })
          const dateArr: any = []
          const valueArr: any = []
          const defaultDate: any = [7, 6, 5, 4, 3, 2, 1].map((e: number) =>
            moment()
              .subtract(e, 'days')
              .format('YYYY-MM-DD')
          )
          arr.forEach((e: any) => {
            dateArr.unshift(e.snapshotDate)
            const valItem = new TokenAmount(LT[chainId ?? 1], e.lightLockedTotal).toFixed(2)
            valueArr.unshift(Number(valItem))
          })
          const minAmount = valueArr.length > 0 ? Math.min(...valueArr) : 0
          setIsHasData(valueArr.length <= 0)
          const option = {
            grid: { top: '6%', bottom: '10%', right: '2%' },
            visualMap: {
              show: false,
              type: 'continuous',
              seriesIndex: 0,
              dimension: 0,
              min: 0,
              max: dateArr.length - 1,
              inRange: {
                color: ['#E4C989', '#B5884C']
              }
            },
            title: {
              show: false
            },
            tooltip: {
              trigger: 'axis',
              backgroundColor: 'rgba(51, 51, 60, 1)',
              borderColor: 'rgba(90, 90, 91, 1)',
              padding: 20,
              className: 'echarts-tooltip',
              axisPointer: {
                type: 'line'
              },
              textStyle: {
                color: '#FFFFFF'
              },
              formatter: (params: any) => {
                return `
                  <p style="font-family: 'Arboria-Book'; font-size: 16px;">${moment(params[0].name).format(
                    'DD MMM YYYY'
                  )}</p>
                  <p style="font-family: 'Arboria-Medium'; font-size: 20px; margin-top: 12px;">
                    <span style="display: inline-block; margin-right: 8px;background-color: #33333C;width:10px;height:10px;border-radius: 50%;border:3px solid ${
                      params[0].color
                    };"></span>
                    ${format.amountFormat(params[0].value, 2)}
                  </p>
                `
              }
            },
            xAxis: {
              data: dateArr.length <= 0 ? defaultDate : dateArr,
              axisLine: {
                lineStyle: {
                  color: '#AEAEAE'
                }
              },
              axisLabel: {
                color: '#FFFFFF',
                margin: 10,
                fontSize: 12,
                formatter: (value: any) => {
                  return moment(value).format('DD MMM')
                }
              },
              axisTick: {
                alignWithLabel: true
              }
            },
            yAxis: {
              type: 'value',
              min: minAmount,
              max: valueArr.length > 0 ? null : 1000,
              splitNumber: 6,
              splitLine: {
                show: false,
                lineStyle: { color: ['#606266'], width: 1, type: 'solid' }
              },
              axisLine: {
                lineStyle: {
                  color: '#AEAEAE'
                }
              },
              axisLabel: {
                color: '#FFFFFF',
                fontSize: 12,
                formatter: (value: any) => {
                  return format.numFormat(Number(value), 2)
                }
              }
            },
            series: [
              {
                type: 'line',
                showSymbol: false,
                smooth: true,
                symbolSize: 10,
                data: valueArr,
                lineStyle: {
                  width: 3
                },
                emphasis: {
                  scale: 1.5
                },
                symbol: 'circle',
                itemStyle: {
                  borderColor: '#E4C989',
                  borderWidth: 3,
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                      offset: 0.1,
                      color: '#E4C989'
                    },
                    {
                      offset: 1,
                      color: '#B5884C'
                    }
                  ])
                }
              }
            ]
          }
          myChart.setOption(option)
        }
      } catch (error) {
        console.log(error)
      }
    },
    [chainId]
  )

  const init = useCallback(
    async (myChart: any) => {
      await initFn(myChart)
    },
    [initFn]
  )
  const handleResizeChart = (myChart: any) => {
    myChart && myChart.resize()
  }

  useEffect(() => {
    const myChart = echarts.init(chartRef.current)
    init(myChart)
    window.addEventListener('resize', () => handleResizeChart(myChart))
    return () => {
      window.removeEventListener('resize', () => handleResizeChart(myChart))
      myChart.dispose()
    }
  }, [init])
  return (
    <>
      <div className="dao-locker-echarts">
        <h3 className="text-medium font-20">Weekly LT lock ration </h3>
        <p className="font-nor text-normal m-t-40">Weekly LT lock ration</p>
        <div className="charts-box m-t-20">
          <div style={{ width: '100%', height: '100%' }} ref={chartRef} />
          {isHasData && (
            <div className="no-data-box">
              <div className="img"></div>
              <p>No data</p>
            </div>
          )}
        </div>
        <div className="total-box flex jc-between m-t-40">
          <div className="p-r-20 border-line flex-1">
            <p className="flex jc-between">
              <span className="text-normal font-nor">Total LT Locked: </span>
              <span className="text-medium font-nor">
                {ltTotalAmounnt?.toFixed(2, { groupSeparator: ',' }).toString() || '--'}
              </span>
            </p>
            <p className="flex jc-between m-t-20">
              <span className="text-normal font-nor">Total veLT Amount : </span>
              <span className="text-medium font-nor">
                {veltTotalAmounnt?.toFixed(2, { groupSeparator: ',' }).toString() || '--'}
              </span>
            </p>
          </div>
          <div className="p-l-20 flex-1">
            <p className="flex jc-between">
              <span className="text-normal font-nor">Average Lock Time :</span>
              <span className="text-medium font-nor"> {lockTime} years</span>
            </p>
            <p className="flex jc-between m-t-20">
              <span className="text-normal font-nor">Yearly fee earnings per 1 veLT : </span>
              <span className="text-medium font-nor">{Number(earningsAmount).toFixed(4)}$</span>
            </p>
          </div>
        </div>
        <div className="tip-box m-t-30 p-t-30 flex">
          <div>
            <p className="text-normal font-nor m-b-12">10,000 LT locked for 4 years = 1 veLT</p>
            <p className="text-normal font-nor m-b-12">10,000 LT locked for 3 years = 0.75 veLT</p>
            <p className="text-normal font-nor m-b-12">10,000 LT locked for 2 years = 0.50 veLT</p>
            <p className="text-normal font-nor m-b-12">10,000 LT locked for 1 year = 0.25 veLT</p>
          </div>
        </div>
      </div>
    </>
  )
}
