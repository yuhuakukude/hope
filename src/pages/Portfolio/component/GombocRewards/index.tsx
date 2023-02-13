import { IPortfolioReward } from 'api/portfolio.api'
import Table from 'components/Table'
import Tips from 'components/Tips'
import React, { useCallback } from 'react'
import Card from '../Card'
import SelectTips, { ITitleTips } from '../SelectTips'
import TitleTips from '../TitleTips'

import './index.scss'

const isNotNull = (val: string | number | null) => {
  return val && Number(val) !== 0
}

const columns = [
  {
    title: 'Rewards Gömböc',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: (
      <div>
        APR
        <Tips title="The APR (USD denominated) is calculated using token prices denominated in USD. Prices are fetched either from HopeSwap pools. Also, the APR is a 365 day projection based on each pool's performance over the last 24h. See Hope Ecosystem Disclaimers & Disclosures for more details " />
      </div>
    ),
    dataIndex: 'apr',
    key: 'apr',
    render: (text: string, record: IPortfolioReward) => {
      return (
        <div>
          <div>{text}</div>
          <div style={{ color: 'rgba(168, 168, 170, 1)', fontSize: '14px' }}>
            <span>
              <span>{record.boost}</span>
              <span style={{ margin: '0 4px', whiteSpace: 'nowrap' }}>-&gt;</span>
              <span style={{ color: 'rgba(14, 203, 129, 1)' }}>{record.maxBoost}</span>
            </span>
          </div>
        </div>
      )
    }
  },
  {
    title: (
      <div>
        Staked
        <Tips title="Staked refers to the number of LP tokens that have been invested in a Gömböc for liquidity mining. The value of estimated (USD denominated) is calculated using token prices denominated in USD. Prices are fetched either from HopeSwap pools. " />
      </div>
    ),
    dataIndex: 'staked',
    key: 'staked',
    render: (text: string, record: IPortfolioReward) => {
      return (
        <div>
          <div>{text + ' ' + record.stakeSymbol}</div>
          <div style={{ color: 'rgba(14, 203, 129, 1)' }}>~ ${record.ustOfStaked}</div>
        </div>
      )
    }
  },
  {
    title: 'Stakeable',
    dataIndex: 'stakeable',
    key: 'stakeable',
    render: (text: string, record: IPortfolioReward) => {
      return (
        <div>
          <div>{text + ' ' + record.stakeSymbol}</div>
          <div style={{ color: 'rgba(14, 203, 129, 1)' }}>~ ${record.usdOfStakeable}</div>
        </div>
      )
    }
  },
  {
    title: 'Reward',
    dataIndex: 'reward',
    key: 'reward',
    render: (text: string, record: IPortfolioReward) => {
      return (
        <div>
          <div>{text + ' ' + record.rewardSymbol}</div>
          <div style={{ color: 'rgba(14, 203, 129, 1)' }}>~ ${record.usdOfReward}</div>
        </div>
      )
    }
  },
  {
    title: 'Actions',
    dataIndex: 'Actions',
    key: 'Actions',
    render: (text: string, record: IPortfolioReward) => {
      const options: ITitleTips[] = []
      console.log(options)
      if (isNotNull(record.stakeable)) {
        options.push({
          label: 'Stake',
          value: 'Stake',
          onClick: item => {
            console.log(item)
          }
        })
      }
      if (isNotNull(record.staked)) {
        options.push({
          label: 'Unstake',
          value: 'Unstake',
          onClick: item => {
            console.log(item)
          }
        })
      }
      if (isNotNull(record.reward)) {
        options.push({
          label: 'Claim',
          value: 'Claim',
          onClick: item => {
            console.log(item)
          }
        })
      }

      if (record.name !== 'HOPE Staking') {
        if (isNotNull(record.stakeable)) {
          options.push({
            label: 'Withdraw',
            value: 'Withdraw',
            onClick: item => {
              console.log(item)
            }
          })
        }
        options.push({
          label: 'Provide',
          value: 'Provide',
          onClick: item => {
            console.log(item)
          }
        })
        options.push({
          label: 'Boost',
          value: 'Boost',
          onClick: item => {
            console.log(item)
          }
        })
      }

      if (!options.length) {
        return ''
      }

      return <SelectTips options={options} />
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
