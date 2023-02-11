import { IPortfolioReward } from 'api/portfolio.api'
import Select from 'components/Select'
import Table from 'components/Table'
import Tips from 'components/Tips'
import React, { useCallback } from 'react'
import Card from '../Card'
import TitleTips from '../TitleTips'

import './index.scss'

const columns = [
  {
    title: 'Rewards Gömböc',
    dataIndex: 'gomboc',
    key: 'gomboc'
  },
  {
    title: (
      <div>
        APR
        <Tips title="The APR (USD denominated) is calculated using token prices denominated in USD. Prices are fetched either from HopeSwap pools. Also, the APR is a 365 day projection based on each pool's performance over the last 24h. See Hope Ecosystem Disclaimers & Disclosures for more details " />
      </div>
    ),
    dataIndex: 'apr',
    key: 'apr'
  },
  {
    title: (
      <div>
        Staked
        <Tips title="Staked refers to the number of LP tokens that have been invested in a Gömböc for liquidity mining. The value of estimated (USD denominated) is calculated using token prices denominated in USD. Prices are fetched either from HopeSwap pools. " />
      </div>
    ),
    dataIndex: 'staked',
    key: 'staked'
  },
  {
    title: 'Stakeable',
    dataIndex: 'stakeable',
    key: 'stakeable'
  },
  {
    title: 'Reward',
    dataIndex: 'reward',
    key: 'reward'
  },
  {
    title: 'Actions',
    dataIndex: 'Actions',
    key: 'Actions',
    render: () => {
      return (
        <Select
          defaultValue={''}
          options={[
            { label: 'More', value: '' },
            { label: 'Provide', value: 12 },
            { label: 'Withdraw', value: 1 },
            { label: 'Stake', value: 2 },
            { label: 'Unstake', value: 11 },
            { label: 'Claim', value: 22 },
            { label: 'Boost', value: 111 }
          ]}
        ></Select>
      )
    }
  }
]

export default function Rewards({ data }: { data: IPortfolioReward[] }) {
  const getTitle = useCallback(
    () => (
      <TitleTips
        title="Gömböc Rewards"
        desc="Stake the HOPE 、Liquidity Position in Gomboc and receive LT rewards. You can also use veLT to increase LT
  yield to a maximum of 2.5x."
        link=""
      />
    ),
    []
  )
  return (
    <div className="rewards-wrap">
      <Card>
        <Table dataSource={data} columns={columns} title={getTitle} pagination={false} />
      </Card>
    </div>
  )
}
