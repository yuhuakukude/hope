import { useEffect, useMemo, useState } from 'react'
import { BasePair, fetchPairs, fetchTokensPrice } from '../../graph/fetch'
import { useActiveWeb3React } from '../index'
import { PAIR_SEARCH } from '../usePairInfo'
import AprApi from '../../api/apr.api'

export default function useBasePairs(
  pageSize: number,
  currentPage: number,
  searchType: PAIR_SEARCH,
  searchValue = '',
  account: string
) {
  const { chainId } = useActiveWeb3React()
  const [result, setResult] = useState<BasePair[]>([])
  const [apiResult, setApiResult] = useState<any>()

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

  useEffect(() => {
    ;(async () => {
      if (!result) return
      try {
        const res = await AprApi.getHopeAllFeeApr(result.map(item => item.pairAddress).join(','))
        console.log('AprApi', result.map(item => item.pairAddress).join(','))
        setApiResult(res.result)
      } catch (error) {
        console.warn(error)
      }
    })()
  }, [account, chainId, currentPage, pageSize, result, searchType, searchValue, total])

  return useMemo(() => {
    return {
      loading: loading,
      total,
      result: result.map((e: BasePair) => ({ ...e, ...apiResult?.[e.pairAddress] }))
    }
  }, [apiResult, loading, result, total])
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
