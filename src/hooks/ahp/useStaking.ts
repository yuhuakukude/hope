import { useSingleCallResult } from '../../state/multicall/hooks'
import { useStakingHopeGombocContract } from '../useContract'
import { useActiveWeb3React } from '../index'
import { CurrencyAmount } from '@uniswap/sdk'

export function useStaking() {
  const { account } = useActiveWeb3React()
  const shgContract = useStakingHopeGombocContract()
  const stakedVal = useSingleCallResult(shgContract, 'lpBalanceOf', [account ?? undefined])
  return {
    stakedVal: stakedVal?.result ? CurrencyAmount.ether(stakedVal?.result?.[0]) : undefined
  }
}
