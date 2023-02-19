import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { postQuery } from '../../utils/graph'
import { SUBGRAPH } from '../../constants'

dayjs.extend(utc)

export async function getPairChartDaysData(pairAddress: string): Promise<any[]> {
  let data: any = []
  const utcEndTime = dayjs.utc()
  const utcStartTime = utcEndTime.subtract(1, 'year').startOf('minute')
  const startTime = utcStartTime.unix() - 1

  const getQuery = (skip: number) => {
    return `
    {
      pairDayDatas(first: 1000, skip: ${skip}, orderBy: date, orderDirection: asc, where: { pairAddress: "${pairAddress}" }) {
        id
        date
        dailyVolumeToken0
        dailyVolumeToken1
        dailyVolumeUSD
        reserveUSD
      }
    }
  `
  }

  try {
    let allFound = false
    let skip = 0
    while (!allFound) {
      const query = getQuery(skip)
      const result = await postQuery(SUBGRAPH, query)
      skip += 1000
      data = data.concat(result.data.pairDayDatas)
      if (result.data.pairDayDatas.length < 1000) {
        allFound = true
      }
    }

    const dayIndexSet = new Set()
    const dayIndexArray: any = []
    const oneDay = 24 * 60 * 60
    data.forEach((dayData: any, i: number) => {
      // add the day index to the set of days
      dayIndexSet.add((data[i].date / oneDay).toFixed(0))
      dayIndexArray.push(data[i])
      dayData.dailyVolumeUSD = parseFloat(dayData.dailyVolumeUSD)
      dayData.reserveUSD = parseFloat(dayData.reserveUSD)
    })

    if (data[0]) {
      // fill in empty days
      let timestamp = data[0].date ? data[0].date : startTime
      let latestLiquidityUSD = data[0].reserveUSD
      let index = 1
      while (timestamp < utcEndTime.unix() - oneDay) {
        const nextDay = timestamp + oneDay
        const currentDayIndex = (nextDay / oneDay).toFixed(0)
        if (!dayIndexSet.has(currentDayIndex)) {
          data.push({
            date: nextDay,
            dayString: nextDay,
            dailyVolumeUSD: 0,
            reserveUSD: latestLiquidityUSD
          })
        } else {
          latestLiquidityUSD = dayIndexArray[index].reserveUSD
          index = index + 1
        }
        timestamp = nextDay
      }
    }

    data = data.sort((a: any, b: any) => (parseInt(a.date) > parseInt(b.date) ? 1 : -1))
  } catch (e) {
    console.log(e)
  }

  return data
}

export async function getPairChart24HourData(pairAddress: string): Promise<any[]> {
  let data: any = []
  const endTime = dayjs
    .utc()
    .subtract(1, 'hour')
    .unix()
  const startTime = dayjs
    .utc()
    .subtract(25, 'hour')
    .endOf('hour')
    .unix()

  const getQuery = () => {
    return `{
      pairHourDatas(orderBy: hourStartUnix, orderDirection: desc, where: {pair: "${pairAddress}", hourStartUnix_gte: ${startTime} hourStartUnix_lte: ${endTime}}) {
        hourStartUnix
        hourlyVolumeUSD
        reserveUSD
      }
    }`
  }

  try {
    const query = getQuery()
    const result = await postQuery(SUBGRAPH, query)
    data = result.data.pairHourDatas
    data.forEach((dayData: any) => {
      dayData.hourlyVolumeUSD = parseFloat(dayData.hourlyVolumeUSD)
      dayData.reserveUSD = parseFloat(dayData.reserveUSD)
    })
  } catch (e) {
    console.log(e)
  }

  return data
}

export async function getPairChartOverviewData(): Promise<any[]> {
  let data: any = []
  const getQuery = () => {
    return `{
      lightswapDayDatas(orderBy: date, orderDirection: desc, first: 7){
        id
        date
        totalLiquidityUSD
        dailyVolumeUSD
      }
    }`
  }

  try {
    const query = getQuery()
    const result = await postQuery(SUBGRAPH, query)
    data = result.data.lightswapDayDatas
    data.forEach((dayData: any) => {
      dayData.totalLiquidityUSD = parseFloat(dayData.totalLiquidityUSD)
      dayData.dailyVolumeUSD = parseFloat(dayData.dailyVolumeUSD)
    })
  } catch (e) {
    console.log(e)
  }

  return data
}

export async function getPairChartOverviewVolData(startTime: number, endTime: number): Promise<any[]> {
  let data: any = []
  const getQuery = () => {
    return `{
      lightswapHourDatas(
        orderBy: hourStartUnix
       orderDirection: desc
       where: {hourStartUnix_gte: ${startTime} hourStartUnix_lte: ${endTime}}
      ){
        hourStartUnix
        hourlyVolumeUSD
      }
    }`
  }

  try {
    const query = getQuery()
    const result = await postQuery(SUBGRAPH, query)
    data = result.data.lightswapHourDatas
    data.forEach((dayData: any) => {
      dayData.hourlyVolumeUSD = parseFloat(dayData.hourlyVolumeUSD)
    })
  } catch (e) {
    console.log(e)
  }

  return data
}
