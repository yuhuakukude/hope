import { useSingleCallResult } from '../../state/multicall/hooks'
import { useStakingHopeGombocContract, useLtMinterContract } from '../useContract'
// import { useStakingHopeGombocContract } from '../useContract'
import { useActiveWeb3React } from '../index'
import { CurrencyAmount } from '@uniswap/sdk'
import { STAKING_HOPE_GOMBOC_ADDRESS } from '../../constants'

export function useStaking() {
  const { account } = useActiveWeb3React()
  const shgContract = useStakingHopeGombocContract()
  const ltMinterContract = useLtMinterContract()
  const stakedVal = useSingleCallResult(shgContract, 'lpBalanceOf', [account ?? undefined])
  const unstakedVal = useSingleCallResult(shgContract, 'unstakedBalanceOf', [account ?? undefined])
  const lpTotalSupply = useSingleCallResult(shgContract, 'lpTotalSupply')
  const claRewards = useSingleCallResult(shgContract, 'claimableTokens', [account ?? undefined])
  const mintedVal = useSingleCallResult(ltMinterContract, 'minted', [account ?? undefined, STAKING_HOPE_GOMBOC_ADDRESS])

  return {
    stakedVal: stakedVal?.result ? CurrencyAmount.ether(stakedVal?.result?.[0]) : undefined,
    lpTotalSupply: lpTotalSupply?.result ? CurrencyAmount.ether(lpTotalSupply?.result?.[0]) : undefined,
    unstakedVal: unstakedVal?.result ? CurrencyAmount.ether(unstakedVal?.result?.[0]) : undefined,
    claRewards: claRewards?.result ? CurrencyAmount.ether(claRewards?.result?.[0]) : undefined,
    mintedVal: mintedVal?.result ? CurrencyAmount.ether(mintedVal?.result?.[0]) : undefined
  }
}
