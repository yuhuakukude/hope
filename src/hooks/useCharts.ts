import { useEffect, useState } from 'react'
import { getPairChartDaysData, getPairChart24HourData, getPairChartOverviewData } from '../state/stake/charts'

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
          const list = await getPairChart24HourData(address ?? '')
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

export function useOverviewChartsData() {
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
