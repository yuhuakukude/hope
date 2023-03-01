import { useEffect, useState } from 'react'
import { fetchPairs, fetchTokensPrice } from '../../graph/fetch'
import { useActiveWeb3React } from '../index'
import { Token, TokenAmount } from '@uniswap/sdk'

export interface BasePair {
  pairAddress: string
  stakingAddress: string | undefined
  tokens: [Token, Token]
  stakedAmount: TokenAmount | undefined
}

export default function useBasePairs() {
  const { chainId } = useActiveWeb3React()
  const [result, setResult] = useState<BasePair[]>([])

  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const pairs = await fetchPairs(chainId ?? 1)
        setResult(pairs)
        setLoading(false)
      } catch (error) {
        setResult([])
        setLoading(false)
        console.warn(error)
      }
    })()
  }, [chainId])

  return {
    loading: loading,
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
