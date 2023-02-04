import { Token, TokenAmount } from '@uniswap/sdk'
import { useEffect, useMemo, useState } from 'react'
import { useSingleCallResult } from '../state/multicall/hooks'
import { usePermit2Contract } from './useContract'

export function usePermitAllowance(token?: Token, owner?: string, spender?: string) {
  const contract = usePermit2Contract()
  const [blocksPerFetch, setBlocksPerFetch] = useState<1>()
  const args = useMemo(() => [owner, token?.address, spender], [owner, spender, token])
  const result = useSingleCallResult(contract, 'allowance', args, {
    blocksPerFetch
  }).result
  console.log('result', result, owner, token?.address, spender)
  const rawAmount = result?.amount.toString()
  const allowance = useMemo(() => (token && rawAmount ? new TokenAmount(token, rawAmount) : undefined), [
    token,
    rawAmount
  ])
  useEffect(() => setBlocksPerFetch(allowance?.equalTo('0') ? 1 : undefined), [allowance])

  return useMemo(() => ({ permitAllowance: allowance, expiration: result?.expiration, nonce: result?.nonce }), [
    allowance,
    result
  ])
}
