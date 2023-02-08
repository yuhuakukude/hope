import Table from 'components/Table'
import React from 'react'

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
  return (
    <div className="rewards-wrap">
      <Table dataSource={dataSource} columns={columns} title={() => 'Gömböc Rewards'} pagination={false} />
    </div>
  )
}
