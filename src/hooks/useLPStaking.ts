import { useEffect, useState } from 'react'
import { fetchStakeList, StakeInfo } from '../state/stake/hooks'

export function useLPStakingInfos(searchName: string, sort: 'asc' | 'desc') {
  const [result, setResult] = useState<StakeInfo[]>([])
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
        const list = await fetchStakeList(searchName, sort, 'apr', (currentPage - 1) * pageSize, pageSize)
        setLoading(false)
        console.log('list', list)
        setResult(list)
      } catch (error) {
        setResult([])
        setLoading(false)
        console.error('useRankingList', error)
      }
    })()
  }, [searchName, sort, currentPage])

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
