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

export function useLPStakingInfos(searchName: string, sort: 'asc' | 'desc', isMyVote: boolean) {
  const { account } = useActiveWeb3React()
  const [result, setResult] = useState<PoolInfo[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [resTokenList, setResTokenList] = useState<any>([])
  const [loading, setLoading] = useState<boolean>(false)
  // const [total, setTotal] = useState<number>(0)
  const pageSize = 10
  useEffect(() => {
    setCurrentPage(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchName])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const allList = await fetchStakeList(account ?? '', '', sort, 'apr', 0, 200, false)
        const tokenList = allList.map((e: PoolInfo) => ({
          label: `${e.tokens[0].symbol}/${e.tokens[1].symbol}`,
          value: e.id,
          token0: e.tokens[0],
          token1: e.tokens[1]
        }))
        setResTokenList(tokenList)
        const list = await fetchStakeList(
          account ?? '',
          searchName,
          sort,
          'apr',
          currentPage * pageSize,
          pageSize,
          isMyVote
        )
        const addressList = list.map((e: PoolInfo) => e.stakingRewardAddress)
        const res = await AprApi.getHopeAllFeeApr(addressList.join(','))
        if (res) {
          setResult(
            list.map((e: PoolInfo) => {
              return { ...e, ...res.result[e.stakingRewardAddress] }
            })
          )
        }
        setLoading(false)
        // setResult([])
      } catch (error) {
        setResult([])
        setLoading(false)
      }
    })()
  }, [searchName, sort, currentPage, account, isMyVote])

  return {
    loading: loading,
    page: {
      setCurrentPage,
      currentPage,
      hasPrev: currentPage > 1,
      hasNext: result?.length === pageSize,
      pageSize
    },
    tokenList: resTokenList,
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

export function usePairTxs(pairAddress: string) {
  const [result, setResult] = useState<TxResponse[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  // const [total, setTotal] = useState<number>(0)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const data = await fetchPairTxs(pairAddress)
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
