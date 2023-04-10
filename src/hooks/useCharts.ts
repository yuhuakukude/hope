import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useEffect, useState } from 'react'
import {
  getPairChartDaysData,
  getPairChart24HourData,
  getPairChartOverviewData,
  getPairChartOverviewVolData,
  getChartStartInitData
} from '../state/stake/charts'

dayjs.extend(utc)

const dayOrHourrResList = (dayRes: any, dayNum: number, initStartData: string, isHour?: boolean) => {
  const tiemList = []
  for (let i = 0; i < dayNum; i++) {
    tiemList.unshift(
      dayjs
        .utc()
        .subtract(i, isHour ? 'hour' : 'day')
        .startOf(isHour ? 'hour' : 'day')
        .unix()
    )
  }
  return tiemList.map((e, i) => {
    let resobj: any = { hourStartUnix: e, hourlyVolumeUSD: 0, reserveUSD: 0, date: e }
    const itemObj = dayRes.find((item: any) => (isHour ? item.hourStartUnix === e : item.date === e))
    if (itemObj) {
      resobj = { ...itemObj }
    }
    if (i === 0 && Number(resobj.reserveUSD) === 0) {
      resobj.reserveUSD = Number(initStartData)
    }
    return resobj
  })
}

const dealListZeroData = (list: any) => {
  list.forEach((e: any, i: any) => {
    if (i > 0 && e.reserveUSD === 0) {
      e.reserveUSD = list[i - 1].reserveUSD
    }
  })
  return list
}

export function useLineDaysChartsData(address: string) {
  const [result, setResult] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  useEffect(() => {
    ;(async () => {
      try {
        if (address) {
          const list = await getPairChartDaysData(address ?? '')
          const initStartData = await getChartStartInitData(address ?? '', false)
          const resList = dayOrHourrResList(list, 30, initStartData, false)
          setResult(dealListZeroData(resList))
        } else {
          setResult([])
        }
        setLoading(false)
      } catch (error) {
        setResult([])
        setLoading(false)
      }
    })()
  }, [address])

  return {
    result,
    loading
  }
}

export function useLine24HourChartsData(address: string) {
  const [result, setResult] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  useEffect(() => {
    ;(async () => {
      try {
        if (address) {
          const list = await getPairChart24HourData(address ?? '')
          const initStartData = await getChartStartInitData(address ?? '', true)
          const resList = dayOrHourrResList(list, 24, initStartData, true)
          setResult(dealListZeroData(resList))
        } else {
          setResult([])
        }
        setLoading(false)
      } catch (error) {
        setResult([])
        setLoading(false)
      }
    })()
  }, [address])

  return {
    result,
    loading
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
        const endTime = dayjs
          .utc()
          .subtract(1, 'hour')
          .unix()
        const startTime = dayjs
          .utc()
          .subtract(25, 'hour')
          .endOf('hour')
          .unix()
        const tiemList = [
          dayjs
            .utc()
            .subtract(1, 'hour')
            .startOf('hour')
            .unix()
        ]
        for (let i = 1; i < 24; i++) {
          tiemList.push(
            dayjs
              .utc()
              .subtract(i + 1, 'hour')
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
