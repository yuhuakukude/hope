import Button from 'components/antd/Button'
import Tips from 'components/Tips'
import React from 'react'
import format from 'utils/format'
import { TokenAmount } from '@uniswap/sdk'
import './index.scss'

export interface IHeadItem {
  ltOfReward: string | number
  ltTotalReward: string | number
  gauge: string
  composition: string
  usdOfReward: string | number
}

export function getCount<T extends object>(list: T[], key: keyof T) {
  let result = 0
  list.forEach(data => (result += Number(data[key])))
  return result
}

export default function Head({
  totalVal,
  claimAll,
  ltPrice
}: {
  data: any[]
  claimAll: () => void
  ltPrice: any
  totalVal: TokenAmount
}) {
  return (
    <div className="pools-head-wrap">
      <div className="pools-head-top">
        Total Claimable Mining Rewards
        <Tips title="All claimable liquidity mining rewards, but not including additional earned rewards. For example, in the stHOPE/USDT liquidity pool, LT rewards earned due to stHOPE would need to be separately claim."></Tips>
        <Button disabled={false} className="pools-head-top-button" type="ghost" onClick={claimAll}>
          Claim All
        </Button>
      </div>
      <div className="pools-head-bottom flex ai-center">
        <span className="pools-head-bottom-value text-medium">
          {totalVal?.toFixed(2, { groupSeparator: ',' } ?? '0.00')} LT
        </span>
        <span className="pools-head-bottom-value2">
          ≈ $
          {totalVal && ltPrice
            ? format.amountFormat(Number(totalVal?.toExact().toString()) * Number(ltPrice), 2)
            : '0.00'}
        </span>
      </div>
    </div>
  )
}
