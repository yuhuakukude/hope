import { useEffect, useMemo, useState } from 'react'
import { BasePair, fetchPairs, fetchTokensPrice } from '../../graph/fetch'
import { useActiveWeb3React } from '../index'
import { PAIR_SEARCH } from '../usePairInfo'
import AprApi from '../../api/apr.api'
import { fetchPairsTimeInfo } from '../../state/stake/hooks'

export interface TimeInfoObject {
  [key: string]: {
    dayVolume: number
    dayVolumeChange: number
  }
}

export default function useBasePairs(
  pageSize: number,
  currentPage: number,
  searchType: PAIR_SEARCH,
  searchValue = '',
  account: string
) {
  const { chainId } = useActiveWeb3React()
  const [result, setResult] = useState<BasePair[]>([])
  const [timeInfo, setTimeInfo] = useState<TimeInfoObject | undefined>(undefined)

  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const { pairs, total } = await fetchPairs(chainId ?? 1, pageSize, currentPage, searchType, searchValue, account)
        const res = await AprApi.getHopeAllFeeApr(pairs.map(item => item.pairAddress).join(','))

        setTotal(total)
        setResult(pairs.map((e: BasePair) => ({ ...e, ...res.result?.[e.pairAddress] })))
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
      try {
        if (searchType === PAIR_SEARCH.ALL && result.length > 0) {
          const infos = await fetchPairsTimeInfo(result.map(({ pairAddress }) => pairAddress.toLowerCase()))
          setTimeInfo(
            infos.reduce((acc, item) => {
              acc[item.pairAddress] = { dayVolume: item.dayVolume, dayVolumeChange: item.dayVolumeChange }
              return acc
            }, {} as any)
          )
        }
      } catch (error) {
        setResult([])
        console.warn(error)
      }
    })()
  }, [result, searchType])

  return useMemo(() => {
    return {
      loading: loading,
      total,
      result: result.map((e: BasePair) => ({ ...e, ...timeInfo?.[e.pairAddress.toLowerCase()] }))
    }
  }, [loading, result, timeInfo, total])
}

export interface TokenPrice {
  address: string
  price: number
}

export interface TokenPriceObject {
  [key: string]: string
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

export function useTokenPriceObject(addresses: string[]) {
  const [result, setResult] = useState<TokenPriceObject | undefined>(undefined)

  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      if (addresses.length === 0) return
      try {
        const tokensPrice: TokenPrice[] = await fetchTokensPrice(addresses)
        setResult(
          tokensPrice.reduce((acc, item) => {
            acc[item.address] = item.price
            return acc
          }, {} as any)
        )
        setLoading(false)
      } catch (error) {
        setResult(undefined)
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
