import { useEffect, useState } from 'react'
import {
  fetchStakeList,
  fetchStakingPool,
  PoolInfo,
  fetchTotalAmount,
  fetchPairsList,
  fetchPairPool,
  GraphPairInfo,
  PairDetail,
  fetchPairTxs,
  TxResponse,
  PairMore,
  fetchPairMore
} from '../state/stake/hooks'
import { useActiveWeb3React } from './index'
import AprApi from '../api/apr.api'

export function useLPTotalLocked() {
  const [totalAmount, setTotalAmount] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const total = await fetchTotalAmount()
        if (total && total.gaugeFactories && total.gaugeFactories.length > 0) {
          const num = total.gaugeFactories[0].totalValueLockedUSD
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
  const { chainId, account } = useActiveWeb3React()
  const [result, setResult] = useState<PoolInfo[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const list = await fetchStakeList(chainId ?? 1, '0xcbed65db7e177d4875ddf5b67e13326a43a7b03f', sort, isMyVote)
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
  }, [sort, account, isMyVote, chainId])

  return {
    loading: loading,
    result
  }
}

export function useLPStakingPairsInfos(sort: 'asc' | 'desc') {
  const { chainId, account } = useActiveWeb3React()
  const [result, setResult] = useState<GraphPairInfo[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        let list = await fetchPairsList(chainId ?? 1, account ?? '', sort, 'trackedReserveHOPE')
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
  }, [sort, account, chainId])

  return {
    loading: loading,
    result
  }
}

export function useStakingPairPool(address: string) {
  const { chainId, account } = useActiveWeb3React()
  const [result, setResult] = useState<PairDetail | undefined>(undefined)
  const [pairMore, setPairMore] = useState<PairMore | undefined>(undefined)

  const [loading, setLoading] = useState<boolean>(true)
  // const [total, setTotal] = useState<number>(0)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const pool = await fetchPairPool(address.toLowerCase() ?? '', chainId ?? 1)
        setLoading(false)
        setResult(pool)
      } catch (error) {
        setResult(undefined)
        setLoading(false)
      }
    })()
  }, [account, address, chainId])

  useEffect(() => {
    ;(async () => {
      try {
        const more = await fetchPairMore(address.toLowerCase() ?? '')
        setLoading(false)
        setPairMore(more)
      } catch (error) {
        setResult(undefined)
      }
    })()
  }, [account, address])

  return {
    loading: loading,
    result,
    pairMore
  }
}

export function useStakingPool(address: string) {
  const { chainId, account } = useActiveWeb3React()
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
        const pool = await fetchStakingPool(address ?? '', chainId ?? 1)
        setLoading(false)
        setResult(pool)
      } catch (error) {
        setResult(undefined)
        setLoading(false)
      }
    })()
  }, [currentPage, account, address, chainId])

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

export function usePairTxs(pairAddress: string, type?: string) {
  const defaultObj = {
    title: '',
    transaction: { id: '', timestamp: '' },
    pair: {
      token0: {
        id: '',
        symbol: ''
      },
      token1: {
        id: '',
        symbol: ''
      }
    },
    sender: '',
    amount0: 0,
    amount1: 0,
    amountUSD: 0
  }
  const [result, setResult] = useState<TxResponse[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  // const [total, setTotal] = useState<number>(0)

  useEffect(() => {
    ;(async () => {
      setResult([defaultObj, defaultObj])
      setLoading(true)
      try {
        const data = await fetchPairTxs(pairAddress, type)
        data.sort((a, b) => Number(b.transaction.timestamp) - Number(a.transaction.timestamp))
        setLoading(false)
        setResult(data)
      } catch (error) {
        setResult([])
        setLoading(false)
        console.error('useOverviewData', error)
      }
    })()
  }, [pairAddress, type, defaultObj])

  return {
    loading: loading,
    result
  }
}
