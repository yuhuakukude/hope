import { useEffect, useState } from 'react'
import { fetchStakeList, PoolInfo } from '../state/stake/hooks'
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
