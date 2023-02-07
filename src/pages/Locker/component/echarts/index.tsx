import React, { useRef, useState, useCallback, useEffect } from 'react'
import LockerApi from '../../../../api/locker.api'
import { LT, VELT } from '../../../../constants'
import { tryParseAmount } from '../../../../state/swap/hooks'
import { useActiveWeb3React } from '../../../../hooks'
import * as echarts from 'echarts'
import { TokenAmount } from '@uniswap/sdk'
import './index.scss'
import format from '../../../../utils/format'

export default function LockerEcharts() {
  const { chainId } = useActiveWeb3React()
  const chartRef: any = useRef()
  const [lockTime, setLockTime] = useState<any>('0')
  const [ltLocked, setLtLocked] = useState<any>('0')
  const [veLtLocked, setVeLtLocked] = useState<any>('0')
  const initFn = useCallback(
    async (myChart: any) => {
      try {
        const res = await LockerApi.getBannerCharts()
        if (res && res.result) {
          setLockTime(res.result.averageOfLockTime || '--')
          setLtLocked(
            res.result.totalOfLockedLT
              ? (tryParseAmount(res.result.totalOfLockedLT, LT[chainId ?? 1]) as TokenAmount | undefined)
              : '0'
          )
          setVeLtLocked(
            res.result.totalVeLTAmount
              ? (tryParseAmount(res.result.totalVeLTAmount, VELT[chainId ?? 1]) as TokenAmount | undefined)
              : '0'
          )
          const arr = res.result.lockedLtList || []
          const dateArr: any = []
          const valueArr: any = []
          arr.forEach((e: any) => {
            dateArr.unshift(e.snapshotDate)
            const valItem = tryParseAmount(e.lightLockedTotal, LT[chainId ?? 1]) as TokenAmount | undefined
            valueArr.unshift(valItem?.toFixed(2))
          })
          console.log(valueArr)
          const option = {
            visualMap: {
              show: false,
              type: 'continuous',
              seriesIndex: 0,
              dimension: 0,
              min: 0,
              max: dateArr.length - 1,
              inRange: {
                color: ['#0000FF', '#E31B29', '#F5791F']
              }
            },
            title: {
              left: 'center',
              textStyle: {
                color: '#FFFFFF'
              }
            },
            tooltip: {
              trigger: 'axis'
            },
            xAxis: {
              data: dateArr,
              axisLine: {
                lineStyle: {
                  color: '#AEAEAE'
                }
              },
              axisLabel: {
                color: '#FFFFFF',
                margin: 10
              }
            },
            yAxis: {
              type: 'value',
              splitLine: {
                show: true,
                lineStyle: { color: ['#303133'], width: 1, type: 'solid' }
              },
              axisLine: {
                lineStyle: {
                  color: '#AEAEAE'
                }
              },
              axisLabel: {
                color: '#FFFFFF'
              }
            },
            series: [
              {
                type: 'line',
                showSymbol: false,
                data: valueArr,
                lineStyle: {
                  width: 3
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

  useEffect(() => {
    const myChart = echarts.init(chartRef.current)
    init(myChart)
    return () => {
      myChart.dispose()
    }
  }, [init])
  return (
    <>
      <div className="dao-locker-echarts">
        <h3 className="text-medium font-20">Weekly LT Lock Ration</h3>
        <p className="font-nor text-normal m-t-40">Weekly $LT lock ration</p>
        <div className="charts-box m-t-20">
          <div style={{ width: '100%', height: '100%' }} ref={chartRef} />
        </div>
        <div className="total-box flex jc-between m-t-40">
          <div className="p-r-20 border-line flex-1">
            <p className="flex jc-between">
              <span className="text-normal font-nor">Total LT Locked: </span>
              <span className="text-medium font-nor">{format.amountFormat(ltLocked, 6)}</span>
            </p>
            <p className="flex jc-between m-t-20">
              <span className="text-normal font-nor">Total veLT Amount : </span>
              <span>{format.amountFormat(veLtLocked, 6)}</span>
            </p>
          </div>
          <div className="p-l-20 flex-1">
            <p className="flex jc-between">
              <span className="text-normal font-nor">Average Lock Time :</span>
              <span className="text-medium font-nor"> {lockTime} years</span>
            </p>
            <p className="flex jc-between m-t-20">
              <span className="text-normal font-nor">Yearly fee earnings per 1 veLT : </span>
              <span className="text-medium font-nor">0.01$</span>
            </p>
          </div>
        </div>
        <div className="tip-box m-t-30 p-t-30">
          <p className="text-normal font-nor m-b-12">10,000 LT locked for 4 years = 1 veLT</p>
          <p className="text-normal font-nor m-b-12">10,000 LT locked for 3 years = 0.75 veLT</p>
          <p className="text-normal font-nor m-b-12">10,000 LT locked for 2 years = 0.50 veLT</p>
          <p className="text-normal font-nor m-b-12">10,000 LT locked for 1 year = 0.25 veLT</p>
        </div>
      </div>
    </>
  )
}
