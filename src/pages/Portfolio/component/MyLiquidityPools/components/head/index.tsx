import Button from 'components/antd/Button'
import Tips from 'components/Tips'
import React from 'react'
import format from 'utils/format'
import { TokenAmount } from '@uniswap/sdk'
import './index.scss'
import { Skeleton2 } from 'components/Skeleton'

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
  ltPrice,
  loading
}: {
  data: any[]
  claimAll: () => void
  ltPrice: any
  totalVal: TokenAmount
  loading: boolean
}) {
  return (
    <div className="pools-head-wrap">
      <div className="pools-head-top">
        Total Claimable Farming Rewards
        <Tips title="Total Claimable Farming Rewards: Showing claimable liquidity farming rewards from LP token staking. Other rewards, such as the $LT rewards obtained by holding $stHOPE are not displayed here and would need to be claimed separately. "></Tips>
        {totalVal.greaterThan('0') && (
          <Button className="pools-head-top-button" type="ghost" onClick={claimAll}>
            Claim All
          </Button>
        )}
      </div>
      <div className="pools-head-bottom flex ai-center">
        <span className="pools-head-bottom-value text-medium">
          <Skeleton2 loading={loading}>{totalVal?.toFixed(2, { groupSeparator: ',' } ?? '0.00')} LT</Skeleton2>
        </span>

        <span className="pools-head-bottom-value2">
          <Skeleton2 loading={loading}>
            ≈ $
            {totalVal && ltPrice
              ? format.amountFormat(Number(totalVal?.toExact().toString()) * Number(ltPrice), 2)
              : '0.00'}
          </Skeleton2>
        </span>
      </div>
    </div>
  )
}
