import { useEffect, useMemo, useState } from 'react'
import { BasePair, fetchPairs, fetchTokensPrice } from '../../graph/fetch'
import { useActiveWeb3React } from '../index'
import AprApi from '../../api/apr.api'
import { fetchPairsTimeInfo } from '../../state/stake/hooks'
import { Field } from '../../state/liquidity/actions'
import { getStakingHopeGaugeAddress, getHopeTokenAddress } from 'utils/addressHelpers'

export interface TimeInfoObject {
  [key: string]: {
    dayVolume: number
    dayVolumeChange: number
  }
}

export default function useBasePairs(
  pageSize: number,
  currentPage: number,
  searchType: Field,
  searchValue = '',
  account: string,
  reload: number
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
        let res: any = null
        if (searchType === Field.ALL) {
          res = await AprApi.getHopeAllFeeApr(pairs.map(item => item.pairAddress).join(','))
        } else {
          res = await AprApi.getUserAllFeeApr(pairs.map(item => item.pairAddress).join(','), account)
        }
        setTotal(total)
        setResult(pairs.map((e: BasePair) => ({ ...e, ...res?.result?.[e.pairAddress] })))
        setLoading(false)
      } catch (error) {
        setResult([])
        setLoading(false)
        console.warn(error)
      }
    })()
  }, [account, chainId, currentPage, pageSize, searchType, searchValue, reload])

  useEffect(() => {
    ;(async () => {
      try {
        if (searchType === Field.ALL && result.length > 0) {
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

function formatTokensPrice (tokensPrice: TokenPrice[], hasStHope: boolean, stHopeAddress: string, hopeAddress: string) {
  const tokenMap = tokensPrice.reduce((acc, item) => {
    acc[item.address] = item.price
    return acc
  }, {} as any)
  if (hasStHope) {
    const stHopePrice = tokenMap[stHopeAddress.toLowerCase()] ? Number(tokenMap[stHopeAddress.toLowerCase()]) : 0;
    tokenMap[stHopeAddress.toLowerCase()] = stHopePrice > 0 ? tokenMap[stHopeAddress.toLowerCase()] : tokenMap[hopeAddress.toLowerCase()]
  }
  return tokenMap;
}

export function useTokenPrice(addresses: string[]) {
  const [result, setResult] = useState<TokenPrice[]>([])

  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      if (addresses.length === 0) return
      try {
        // TODO fix no stHope，repease
        const stHopeAddress = getStakingHopeGaugeAddress()
        const hopeAddress = getHopeTokenAddress()
        const hasHope = addresses.some(s => s.toLowerCase() === hopeAddress.toLowerCase())
        const hasStHope = addresses.some(s => s.toLowerCase() === stHopeAddress.toLowerCase())
        if (hasStHope && !hasHope) {
          addresses.push(hopeAddress)
        }
        const tokensPrice: TokenPrice[] = await fetchTokensPrice(addresses)
        const tokenMap = formatTokensPrice(tokensPrice, hasHope, stHopeAddress, hopeAddress)
        const tokenPrices: TokenPrice[] = Object.keys(tokenMap).map(k => ({address: k, price: tokenMap[k]}))
        setResult(tokenPrices)
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
        // TODO fix no stHope，repease
        const stHopeAddress = getStakingHopeGaugeAddress()
        const hopeAddress = getHopeTokenAddress()
        const hasHope = addresses.some(s => s.toLowerCase() === hopeAddress.toLowerCase())
        const hasStHope = addresses.some(s => s.toLowerCase() === stHopeAddress.toLowerCase())
        if (hasStHope && !hasHope) {
          addresses.push(hopeAddress)
        }
        const tokensPrice: TokenPrice[] = await fetchTokensPrice(addresses)
        // const tokenMap = tokensPrice.reduce((acc, item) => {
        //   acc[item.address] = item.price
        //   return acc
        // }, {} as any)
        // if (hasStHope) {
        //   const stHopePrice = tokenMap[stHopeAddress.toLowerCase()] ? Number(tokenMap[stHopeAddress.toLowerCase()]) : 0;
        //   tokenMap[stHopeAddress.toLowerCase()] = stHopePrice > 0 ? tokenMap[stHopeAddress.toLowerCase()] : tokenMap[hopeAddress.toLowerCase()]
        // }
        const tokenMap = formatTokensPrice(tokensPrice, hasHope, stHopeAddress, hopeAddress)
        setResult(tokenMap)
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
