import { useSingleCallResult } from '../../state/multicall/hooks'
import { useGomConContract, useLTContract } from '../useContract'
import { useActiveWeb3React } from '../index'
import { JSBI, TokenAmount, CurrencyAmount } from '@uniswap/sdk'
import moment from 'moment'
import { tryParseAmount } from '../../state/swap/hooks'
import { getLTToken, getVELTToken } from 'utils/addressHelpers'

export enum conFnNameEnum {
  CreateLock = 'createLock',
  IncreaseAmount = 'increaseAmount',
  IncreaseUnlockTime = 'increaseUnlockTime'
}

export function useLocker() {
  const { account } = useActiveWeb3React()
  const gomConContract = useGomConContract()
  const votePowerAmount = useSingleCallResult(gomConContract, 'gaugeRelativeWeight', [account ?? undefined])

  return {
    votePowerAmount: votePowerAmount?.result ? Number(votePowerAmount?.result) : undefined,
    votePowerAmountLoading: votePowerAmount.loading
  }
}

export function useCalculator() {
  const { chainId } = useActiveWeb3React()
  const ltTokenContract = useLTContract()
  const rateResult = useSingleCallResult(ltTokenContract, 'rate')

  const getVeLtAmount = (amount: string, endDate: any) => {
    if (!amount || !endDate || !chainId) {
      return undefined
    }
    const year = JSBI.multiply(
      JSBI.multiply(JSBI.multiply(JSBI.BigInt(365), JSBI.BigInt(24)), JSBI.BigInt(60)),
      JSBI.BigInt(60)
    )
    const initStartDate = moment().format('YYYY-MM-DD HH:mm:ss')
    const lockPeriod = moment(endDate).diff(initStartDate, 'second')
    const veltGetAmount = new TokenAmount(
      getVELTToken(chainId),
      JSBI.divide(
        JSBI.divide(
          JSBI.multiply(
            JSBI.BigInt(tryParseAmount(amount, getLTToken(chainId))?.raw.toString() ?? '0'),
            JSBI.BigInt(lockPeriod)
          ),
          year
        ),
        JSBI.BigInt(40000)
      )
    )
    return veltGetAmount
  }

  const getLtRewards = (weight: CurrencyAmount) => {
    if (!rateResult.result || !weight || !chainId) {
      return undefined
    }
    const rate = CurrencyAmount.ether(JSBI.multiply(JSBI.BigInt(rateResult.result?.[0]), JSBI.BigInt(100)))
    const w = JSBI.multiply(JSBI.multiply(JSBI.BigInt(rate.raw), JSBI.BigInt(weight.raw)), JSBI.BigInt(86400))
    const ltRewards = new TokenAmount(getLTToken(chainId), w)
    return ltRewards
  }

  const getMinVeltAmount = (depositAmount: string, totalAmount: string, veLtTotalAmount: string) => {
    if (!depositAmount || !totalAmount || !veLtTotalAmount || !chainId) {
      return undefined
    }
    const minVelt = new TokenAmount(
      getVELTToken(chainId),
      JSBI.divide(
        JSBI.multiply(
          JSBI.BigInt(tryParseAmount(veLtTotalAmount, getVELTToken(chainId))?.raw.toString() ?? '0'),
          JSBI.BigInt(tryParseAmount(depositAmount, getVELTToken(chainId))?.raw.toString() ?? '0')
        ),
        JSBI.add(
          JSBI.BigInt(tryParseAmount(totalAmount, getVELTToken(chainId))?.raw.toString() ?? '0'),
          JSBI.BigInt(tryParseAmount(depositAmount, getVELTToken(chainId))?.raw.toString() ?? '0')
        )
      )
    )
    return minVelt
  }

  return {
    getVeLtAmount,
    getLtRewards,
    getMinVeltAmount,
    rateLoading: rateResult.loading
  }
}
