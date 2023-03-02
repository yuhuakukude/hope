import Button from 'components/antd/Button'
import Tips from 'components/Tips'
import React from 'react'

import './index.scss'

export interface IHeadItem {
  ltOfReward: string | number
  ltTotalReward: string | number
  gomboc: string
  composition: string
}

export function getCount<T extends object>(list: T[], key: keyof T) {
  let result = 0
  list.forEach(data => (result += Number(data[key])))
  return result
}

export default function Head({ data, claimAll }: { data: IHeadItem[]; claimAll: () => void }) {
  console.log('Head====>', data)
  return (
    <div className="pools-head-wrap">
      <div className="pools-head-top">
        Total Claimable Mining Rewards
        <Tips title="Total tips"></Tips>
        <Button className="pools-head-top-button" type="ghost" onClick={claimAll}>
          Claim All
        </Button>
      </div>
      <div className="pools-head-bottom">
        <span className="pools-head-bottom-value">≈ {getCount(data, 'ltOfReward')} stHOPE</span>
        <span className="pools-head-bottom-value2">≈ ${getCount(data, 'ltTotalReward')}</span>
      </div>
    </div>
  )
}
