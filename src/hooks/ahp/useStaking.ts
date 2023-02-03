import { useCallback } from 'react'
import { useSingleCallResult } from '../../state/multicall/hooks'
import { useStakingHopeGombocContract, useLtMinterContract } from '../useContract'
// import { useStakingHopeGombocContract } from '../useContract'
import { useActiveWeb3React } from '../index'
import JSBI from 'jsbi'
import { CurrencyAmount } from '@uniswap/sdk'
import { STAKING_HOPE_GOMBOC_ADDRESS } from '../../constants'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { calculateGasMargin } from '../../utils'
import { TransactionResponse } from '@ethersproject/providers'

export function useStaking() {
  const { account, chainId } = useActiveWeb3React()
  const shgContract = useStakingHopeGombocContract()
  const ltMinterContract = useLtMinterContract()
  const stakedVal = useSingleCallResult(shgContract, 'lpBalanceOf', [account ?? undefined])
  const unstakedVal = useSingleCallResult(shgContract, 'unstakedBalanceOf', [account ?? undefined])
  const lpTotalSupply = useSingleCallResult(shgContract, 'lpTotalSupply')
  const claRewards = useSingleCallResult(shgContract, 'claimableTokens', [account ?? undefined])
  const mintedVal = useSingleCallResult(ltMinterContract, 'minted', [
    account ?? undefined,
    STAKING_HOPE_GOMBOC_ADDRESS[chainId ?? 1]
  ])

  return {
    stakedVal: stakedVal?.result ? CurrencyAmount.ether(stakedVal?.result?.[0]) : undefined,
    lpTotalSupply: lpTotalSupply?.result ? CurrencyAmount.ether(lpTotalSupply?.result?.[0]) : undefined,
    unstakedVal: unstakedVal?.result ? CurrencyAmount.ether(unstakedVal?.result?.[0]) : undefined,
    claRewards: claRewards?.result ? CurrencyAmount.ether(claRewards?.result?.[0]) : undefined,
    mintedVal: mintedVal?.result ? CurrencyAmount.ether(mintedVal?.result?.[0]) : undefined
  }
}

export function useToStaked() {
  const addTransaction = useTransactionAdder()
  const contract = useStakingHopeGombocContract()
  const { account } = useActiveWeb3React()
  const toStaked = useCallback(
    async (amount: CurrencyAmount, NONCE, DEADLINE, sigVal) => {
      if (!account) throw new Error('none account')
      if (!contract) throw new Error('none contract')
      if (amount.equalTo(JSBI.BigInt('0'))) throw new Error('amount is un support')
      const args = [amount.raw.toString(), NONCE, DEADLINE, sigVal]
      const method = 'staking'
      console.log('🚀 ~ file: useBuyBong.ts ~ line 18 ~ args', args, method)
      return contract.estimateGas[method](...args, { from: account }).then(estimatedGasLimit => {
        return contract[method](...args, {
          gasLimit: calculateGasMargin(estimatedGasLimit),
          // gasLimit: '3500000',
          from: account
        }).then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Buy ${amount
              .multiply(JSBI.BigInt('5'))
              .toSignificant(4, { groupSeparator: ',' })
              .toString()}  RAM with ${amount.toSignificant()} USDT`
          })
          return response.hash
        })
      })
    },
    [account, addTransaction, contract]
  )
  return {
    toStaked
  }
}
