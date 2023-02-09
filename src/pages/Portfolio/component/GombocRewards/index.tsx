import Table from 'components/Table'
import React, { useCallback } from 'react'
import Card from '../Card'
import TitleTips from '../TitleTips'

import './index.scss'

const dataSource: any[] | undefined = []

const columns = [
  {
    title: 'Rewards Gömböc',
    dataIndex: 'Gömböc',
    key: 'Gömböc'
  },
  {
    title: 'APR',
    dataIndex: 'APR',
    key: 'APR'
  },
  {
    title: 'Staked',
    dataIndex: 'Staked',
    key: 'Staked'
  },
  {
    title: 'Stakeable',
    dataIndex: 'Stakeable',
    key: 'Stakeable'
  },
  {
    title: 'Reward',
    dataIndex: 'Reward',
    key: 'Reward'
  },
  {
    title: 'Actions',
    dataIndex: 'Actions',
    key: 'Actions'
  }
]

export default function Rewards() {
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
        <Table dataSource={dataSource} columns={columns} title={getTitle} pagination={false} />
      </Card>
    </div>
  )
}
