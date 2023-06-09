import { useSingleCallResult } from '../../state/multicall/hooks'
import { useLTContract } from '../useContract'
import { useActiveWeb3React } from '../index'
import { JSBI, TokenAmount, CurrencyAmount, Percent } from '@uniswap/sdk'
import moment from 'moment'
import { tryParseAmount } from '../../state/swap/hooks'
import { getLTToken, getVELTToken } from 'utils/addressHelpers'

export enum conFnNameEnum {
  CreateLock = 'createLock',
  IncreaseAmount = 'increaseAmount',
  IncreaseUnlockTime = 'increaseUnlockTime'
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
    const rate = CurrencyAmount.ether(JSBI.BigInt(rateResult.result?.[0]))
    const MIN_ETH: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(20))
    const w = JSBI.multiply(JSBI.multiply(JSBI.BigInt(rate.raw), JSBI.BigInt(weight.raw)), JSBI.BigInt(86400))
    const wr = JSBI.divide(w, MIN_ETH)
    const ltRewards = new TokenAmount(getLTToken(chainId), wr)
    return ltRewards
  }

  const getMinVeltAmount = (depositAmount: string, totalAmount: string, veLtTotalAmount: string) => {
    if (
      !depositAmount ||
      !totalAmount ||
      !veLtTotalAmount ||
      !chainId ||
      (Number(totalAmount) === 0 && Number(depositAmount) === 0)
    ) {
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

  const getBuMin = (
    depositAmountArg: string,
    totalAmountArg: string,
    veLtAmountArg: string,
    veLtTotalAmountArg: string
  ) => {
    try {
      if (!depositAmountArg || !totalAmountArg || !veLtAmountArg || !Number(veLtTotalAmountArg) || !chainId) {
        return undefined
      }
      const depositAmount = JSBI.BigInt(tryParseAmount(depositAmountArg, getVELTToken(chainId))?.raw.toString() ?? '0')
      const totalAmount = JSBI.BigInt(tryParseAmount(totalAmountArg, getVELTToken(chainId))?.raw.toString() ?? '0')
      const veLtAmount = JSBI.BigInt(tryParseAmount(veLtAmountArg, getVELTToken(chainId))?.raw.toString() ?? '0')
      const veLtTotalAmount = JSBI.BigInt(
        tryParseAmount(veLtTotalAmountArg, getVELTToken(chainId))?.raw.toString() ?? '0'
      )

      let lim = JSBI.divide(JSBI.multiply(JSBI.BigInt(depositAmount), JSBI.BigInt(4)), JSBI.BigInt(10))
      if (
        lim &&
        veLtTotalAmount &&
        totalAmount &&
        veLtAmount &&
        JSBI.greaterThan(JSBI.BigInt(veLtTotalAmount), JSBI.BigInt(0))
      ) {
        lim = JSBI.add(
          JSBI.divide(
            JSBI.multiply(
              JSBI.multiply(JSBI.BigInt(veLtAmount), JSBI.add(JSBI.BigInt(totalAmount), JSBI.BigInt(depositAmount))),
              JSBI.BigInt(6)
            ),
            JSBI.multiply(JSBI.BigInt(veLtTotalAmount), JSBI.BigInt(10))
          ),
          lim
        )
      }
      const bu =
        depositAmount && lim
          ? JSBI.greaterThanOrEqual(JSBI.BigInt(depositAmount), lim)
            ? lim
            : JSBI.BigInt(depositAmount)
          : undefined
      return bu
    } catch (error) {
      console.log(error)
      return JSBI.BigInt(0)
    }
  }

  const getBoost = (depositAmountArg: string, workingSupplyArg: string, buMin: JSBI) => {
    try {
      if (!depositAmountArg || !workingSupplyArg || !chainId || !JSBI.greaterThan(JSBI.BigInt(buMin), JSBI.BigInt(0))) {
        return undefined
      }
      const depositAmount = JSBI.BigInt(tryParseAmount(depositAmountArg, getVELTToken(chainId))?.raw.toString() ?? '0')
      const workingSupply = JSBI.BigInt(tryParseAmount(workingSupplyArg, getVELTToken(chainId))?.raw.toString() ?? '0')
      const MIN_ETH: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18))
      const MIN_ETH2: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(20))
      const dividend = JSBI.divide(JSBI.multiply(buMin, MIN_ETH), JSBI.add(JSBI.BigInt(workingSupply), buMin))
      const bu1 = JSBI.divide(JSBI.multiply(JSBI.BigInt(4), JSBI.BigInt(depositAmount)), JSBI.BigInt(10))
      const bu2 = JSBI.add(JSBI.BigInt(workingSupply), bu1)
      const divisor = JSBI.divide(JSBI.multiply(bu1, MIN_ETH2), bu2)
      let boost = new Percent(dividend, divisor).toFixed(2, { groupSeparator: ',' }, 1)
      if (Number(boost) < 1) {
        boost = '1.00'
      }
      if (Number(boost) > 2.5) {
        boost = '2.50'
      }
      return boost
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  return {
    getVeLtAmount,
    getLtRewards,
    getMinVeltAmount,
    getBuMin,
    getBoost,
    rateLoading: rateResult.loading
  }
}
