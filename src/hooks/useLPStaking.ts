import { useEffect, useState } from 'react'
import {
  fetchStakeList,
  fetchStakingPool,
  PoolInfo,
  fetchTotalAmount,
  fetchPairsList,
  fetchPairPool,
  fetchGlobalData,
  GraphPairInfo,
  PairDetail,
  fetchPairTxs,
  TxResponse
} from '../state/stake/hooks'
import { useActiveWeb3React } from './index'
import AprApi from '../api/apr.api'

export function useLPTotalLocked() {
  const [totalAmount, setTotalAmount] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const total = await fetchTotalAmount()
        if (total && total.gombocFactories && total.gombocFactories.length > 0) {
          const num = total.gombocFactories[0].totalValueLockedUSD
          setTotalAmount(num)
        }
      } catch (error) {
        setTotalAmount('')
      }
    })()
  }, [])

  return {
    totalAmount
  }
}

export function useLPStakingInfos(sort: 'asc' | 'desc', isMyVote: boolean) {
  const { account } = useActiveWeb3React()
  const [result, setResult] = useState<PoolInfo[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const list = await fetchStakeList('0xcbed65db7e177d4875ddf5b67e13326a43a7b03f', sort, isMyVote)
        const addressList = list.map((e: PoolInfo) => e.id)
        const res = await AprApi.getHopeAllFeeApr(addressList.join(','))
        if (res) {
          setResult(
            list.map((e: PoolInfo) => {
              return { ...e, ...res.result[e.id] }
            })
          )
        }
        setLoading(false)
      } catch (error) {
        setResult([])
        setLoading(false)
      }
    })()
  }, [sort, account, isMyVote])

  return {
    loading: loading,
    result
  }
}

export function useLPStakingPairsInfos(sort: 'asc' | 'desc') {
  const { account } = useActiveWeb3React()
  const [result, setResult] = useState<GraphPairInfo[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        let list = await fetchPairsList(account ?? '', sort, 'trackedReserveETH')
        const addressList = list.map((e: GraphPairInfo) => e.address)
        const res = await AprApi.getHopeAllFeeApr(addressList.join(','))
        list = list.map((e: GraphPairInfo) => ({ ...e, ...res.result[e.address] }))
        setResult(list)
        setLoading(false)
      } catch (error) {
        setResult([])
        setLoading(false)
        console.warn(error)
      }
    })()
  }, [sort, account])

  return {
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
  oneWeekTVLUSD: number
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

export function usePairTxs(pairAddress: string, type?: string) {
  const [result, setResult] = useState<TxResponse[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  // const [total, setTotal] = useState<number>(0)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const data = await fetchPairTxs(pairAddress, type)
        setLoading(false)
        setResult(data)
      } catch (error) {
        setResult([])
        setLoading(false)
        console.error('useOverviewData', error)
      }
    })()
  }, [pairAddress, type])

  return {
    loading: loading,
    result
  }
}
