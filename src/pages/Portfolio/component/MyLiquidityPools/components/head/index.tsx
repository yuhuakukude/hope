import Button from 'components/antd/Button'
import Tips from 'components/Tips'
import React from 'react'
import format from 'utils/format'

import './index.scss'

export interface IHeadItem {
  ltOfReward: string | number
  ltTotalReward: string | number
  gomboc: string
  composition: string
  usdOfReward: string | number
}

export function getCount<T extends object>(list: T[], key: keyof T) {
  let result = 0
  list.forEach(data => (result += Number(data[key])))
  return result
}

export default function Head({ data, claimAll }: { data: IHeadItem[]; claimAll: () => void }) {
  const total = getCount(data, 'ltOfReward')
  const uTotal = getCount(data, 'usdOfReward')
  return (
    <div className="pools-head-wrap">
      <div className="pools-head-top">
        Total Claimable Mining Rewards
        <Tips title="All claimable liquidity mining rewards, but not including additional earned rewards. For example, in the stHOPE/USDT liquidity pool, LT rewards earned due to stHOPE would need to be separately claim."></Tips>
        <Button disabled={total === 0} className="pools-head-top-button" type="ghost" onClick={claimAll}>
          Claim All
        </Button>
      </div>
      <div className="pools-head-bottom flex ai-center">
        <span className="pools-head-bottom-value text-medium">{format.amountFormat(total, 2)} LT</span>
        <span className="pools-head-bottom-value2">≈ ${format.amountFormat(uTotal, 2)}</span>
      </div>
    </div>
  )
}
