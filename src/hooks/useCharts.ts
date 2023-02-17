import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useEffect, useState } from 'react'
import {
  getPairChartDaysData,
  getPairChart24HourData,
  getPairChartOverviewData,
  getPairChartOverviewVolData
} from '../state/stake/charts'

dayjs.extend(utc)

export function useLineDaysChartsData(address: string) {
  const [result, setResult] = useState<any[]>([])
  useEffect(() => {
    ;(async () => {
      try {
        if (address) {
          const list = await getPairChartDaysData(address ?? '')
          setResult(list)
        } else {
          setResult([])
        }
      } catch (error) {
        setResult([])
      }
    })()
  }, [address])

  return {
    result
  }
}

export function useLine24HourChartsData(address: string) {
  const [result, setResult] = useState<any[]>([])
  useEffect(() => {
    ;(async () => {
      try {
        if (address) {
          const tiemList = [
            dayjs
              .utc()
              .startOf('hour')
              .unix()
          ]
          for (let i = 1; i < 24; i++) {
            tiemList.push(
              dayjs
                .utc()
                .subtract(i, 'hour')
                .startOf('hour')
                .unix()
            )
          }
          const list = await getPairChart24HourData(address ?? '')
          const resList = tiemList.map(e => {
            const itemObj = list.find(item => item.hourStartUnix === e)
            if (itemObj) {
              return { ...itemObj }
            }
            return { hourStartUnix: e, hourlyVolumeUSD: 0, reserveUSD: 0 }
          })
          setResult(resList)
        } else {
          setResult([])
        }
      } catch (error) {
        setResult([])
      }
    })()
  }, [address])

  return {
    result
  }
}

export function useOverviewTvlChartsData() {
  const [result, setResult] = useState<any[]>([])
  useEffect(() => {
    ;(async () => {
      try {
        const list = await getPairChartOverviewData()
        setResult(list)
      } catch (error) {
        setResult([])
      }
    })()
  }, [])

  return {
    result
  }
}

export function useOverviewVolChartsData() {
  const [result, setResult] = useState<any[]>([])
  useEffect(() => {
    ;(async () => {
      try {
        const endTime = dayjs.utc().unix()
        const startTime = dayjs
          .utc()
          .subtract(24, 'hour')
          .endOf('hour')
          .unix()
        const tiemList = [
          dayjs
            .utc()
            .startOf('hour')
            .unix()
        ]
        for (let i = 1; i < 24; i++) {
          tiemList.push(
            dayjs
              .utc()
              .subtract(i, 'hour')
              .startOf('hour')
              .unix()
          )
        }
        const list = await getPairChartOverviewVolData(startTime, endTime)
        const resList = tiemList.map(e => {
          const itemObj = list.find(item => item.hourStartUnix === e)
          if (itemObj) {
            return { ...itemObj }
          }
          return { hourStartUnix: e, hourlyVolumeUSD: 0 }
        })
        setResult(resList)
      } catch (error) {
        setResult([])
      }
    })()
  }, [])

  return {
    result
  }
}
