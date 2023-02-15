import { useEffect, useState } from 'react'
import { fetchStakeList, fetchStakingPool, PoolInfo, fetchPairsList, fetchPairsListLength } from '../state/stake/hooks'
import { useActiveWeb3React } from './index'

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
        console.log('list', list)
        setResult(list)
      } catch (error) {
        setResult([])
        setLoading(false)
        console.error('useRankingList', error)
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
  const [result, setResult] = useState<PoolInfo[]>([])

  const [loading, setLoading] = useState<boolean>(false)
  const [resultLength, setResultLength] = useState<number>(0)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const listLength = await fetchPairsListLength()
        setResultLength(listLength)
        const list = await fetchPairsList(account ?? '', searchName, sort, 'trackedReserveETH', page, pageSize)
        setLoading(false)
        setResult(list)
      } catch (error) {
        setResult([])
        setLoading(false)
        console.error('useRankingList', error)
      }
    })()
  }, [searchName, sort, page, account, pageSize])

  return {
    total: resultLength,
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
        console.log('list', pool)
        setResult(pool)
      } catch (error) {
        setResult(undefined)
        setLoading(false)
        console.error('useRankingList', error)
      }
    })()
  }, [currentPage, account, address])

  return {
    loading: loading,
    result
  }
}
