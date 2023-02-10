import { useMemo } from 'react'
import { useActiveWeb3React } from '../../hooks'
import { useETHBalances } from '../../state/wallet/hooks'

export function useEstimate() {
  const { account } = useActiveWeb3React()
  const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']

  return useMemo(() => {
    if (!userEthBalance) {
      return false
    }
    return Number(userEthBalance?.toFixed(4)) < 0.001
  }, [userEthBalance])
}
