import { useEffect, useState } from 'react'
import { BasePair, fetchPairs, fetchTokensPrice } from '../../graph/fetch'
import { useActiveWeb3React } from '../index'
import { PAIR_SEARCH } from '../usePairInfo'

export default function useBasePairs(
  pageSize: number,
  currentPage: number,
  searchType: PAIR_SEARCH,
  searchValue = '',
  account: string
) {
  const { chainId } = useActiveWeb3React()
  const [result, setResult] = useState<BasePair[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    ;(async () => {
      console.log('fetching--->', searchValue)
      setLoading(true)
      try {
        const { pairs, total } = await fetchPairs(chainId ?? 1, pageSize, currentPage, searchType, searchValue, account)
        setTotal(total)
        console.log('fetchPairs', pairs)
        setResult(pairs)
        setLoading(false)
      } catch (error) {
        setResult([])
        setLoading(false)
        console.warn(error)
      }
    })()
  }, [account, chainId, currentPage, pageSize, searchType, searchValue])

  return {
    loading: loading,
    total,
    result
  }
}

export interface TokenPrice {
  address: string
  price: number
}

export function useTokenPrice(addresses: string[]) {
  const [result, setResult] = useState<TokenPrice[]>([])

  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      if (addresses.length === 0) return
      try {
        const tokensPrice = await fetchTokensPrice(addresses)
        setResult(tokensPrice)
        setLoading(false)
      } catch (error) {
        setResult([])
        setLoading(false)
        console.warn(error)
      }
    })()
  }, [addresses])

  return {
    loading: loading,
    result
  }
}
