import { useEffect, useState } from 'react'
import {
  fetchStakeList,
  fetchStakingPool,
  PoolInfo,
  fetchPairsList,
  fetchPairsListLength,
  fetchPairPool,
  fetchGlobalData,
  GraphPairInfo,
  PairDetail,
  fetchPairTxs,
  TX
} from '../state/stake/hooks'
import { useActiveWeb3React } from './index'
// import AprApi from '../api/apr.api'

export function useLPStakingInfos(searchName: string, sort: 'asc' | 'desc') {
  const { account } = useActiveWeb3React()
  const [result, setResult] = useState<PoolInfo[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  const [loading, setLoading] = useState<boolean>(false)
  // const [total, setTotal] = useState<number>(0)
  const pageSize = 10

  useEffect(() => {
    setCurrentPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchName])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const list = await fetchStakeList(
          account ?? '',
          searchName,
          sort,
          'apr',
          (currentPage - 1) * pageSize,
          pageSize
        )
        setLoading(false)
        setResult(list)
      } catch (error) {
        setResult([])
        setLoading(false)
      }
    })()
  }, [searchName, sort, currentPage, account])

  return {
    loading: loading,
    page: {
      setCurrentPage,
      currentPage,
      hasPrev: currentPage > 1,
      hasNext: result?.length === pageSize,
      pageSize
    },
    result
  }
}

export function useLPStakingPairsInfos(searchName: string, sort: 'asc' | 'desc', page: number, pageSize: number) {
  const { account } = useActiveWeb3React()
  const [result, setResult] = useState<GraphPairInfo[]>([])

  const [loading, setLoading] = useState<boolean>(false)
  const [resultLength, setResultLength] = useState<number>(0)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const listLength = await fetchPairsListLength()
        setResultLength(listLength)
        const list = await fetchPairsList(account ?? '', searchName, sort, 'trackedReserveETH', page, pageSize)
        // const addressList = list.map((e: GraphPairInfo) => e.address)
        setLoading(false)
        setResult(list)
      } catch (error) {
        setResult([])
        setLoading(false)
      }
    })()
  }, [searchName, sort, page, account, pageSize])

  return {
    total: resultLength,
    loading: loading,
    result
  }
}

export function useStakingPairPool(address: string) {
  const { account } = useActiveWeb3React()
  const [result, setResult] = useState<PairDetail | undefined>(undefined)

  const [loading, setLoading] = useState<boolean>(false)
  // const [total, setTotal] = useState<number>(0)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const pool = await fetchPairPool(address ?? '')
        setLoading(false)
        setResult(pool)
      } catch (error) {
        setResult(undefined)
        setLoading(false)
      }
    })()
  }, [account, address])

  return {
    loading: loading,
    result
  }
}

export function useStakingPool(address: string) {
  const { account } = useActiveWeb3React()
  const [result, setResult] = useState<PoolInfo | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)

  const [loading, setLoading] = useState<boolean>(false)
  // const [total, setTotal] = useState<number>(0)

  useEffect(() => {
    setCurrentPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const pool = await fetchStakingPool(address ?? '')
        setLoading(false)
        setResult(pool)
      } catch (error) {
        setResult(undefined)
        setLoading(false)
      }
    })()
  }, [currentPage, account, address])

  return {
    loading: loading,
    result
  }
}

export interface Overview {
  tvl: string
  tvlChangeUSD: number
  totalVolume: number
  oneDayVolumeUSD: number
  volumeChangeUSD: number
  dayFees: number
  weekFees: number
  weeklyVolumeChange: number
}

export function useOverviewData() {
  const [result, setResult] = useState<Overview | undefined>(undefined)
  const [loading, setLoading] = useState<boolean>(false)
  // const [total, setTotal] = useState<number>(0)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const data = await fetchGlobalData()
        console.log('useOverviewData--', data)
        setLoading(false)
        setResult(data)
      } catch (error) {
        setResult(undefined)
        setLoading(false)
        console.error('useOverviewData', error)
      }
    })()
  }, [])

  return {
    loading: loading,
    result
  }
}

export function usePairTxs(pairAddress: string) {
  const [result, setResult] = useState<TX[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  // const [total, setTotal] = useState<number>(0)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const data = await fetchPairTxs(pairAddress)
        console.log('useOverviewData--', data)
        setLoading(false)
        setResult(data)
      } catch (error) {
        setResult([])
        setLoading(false)
        console.error('useOverviewData', error)
      }
    })()
  }, [pairAddress])

  return {
    loading: loading,
    result
  }
}
