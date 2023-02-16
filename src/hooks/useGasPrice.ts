import JSBI from 'jsbi'
import { useMemo } from 'react'

import { useSingleCallResult } from '../state/multicall/hooks'
import { useGasPriceContract } from './useContract'

/**
 * Returns the price of 1 gas in WEI for the currently selected network using the chainlink fast gas price oracle
 */
export default function useGasPrice(): JSBI | undefined {
  const contract = useGasPriceContract()

  const resultStr = useSingleCallResult(contract, 'latestAnswer').result?.[0]?.toString()
  return useMemo(() => (typeof resultStr === 'string' ? JSBI.BigInt(resultStr) : undefined), [resultStr])
}
