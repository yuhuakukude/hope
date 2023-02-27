import Table from 'components/antd/Table'
import React from 'react'
import Card from '../Card'
import Item from '../Item'
import SelectTips, { TitleTipsProps } from '../SelectTips'

const columns = [
  {
    title: 'Pools',
    dataIndex: 'Pools',
    key: 'Pools',
    render: (text: string, record: any) => {
      return (
        <Item
          title={
            <>
              <span>
                <i className="iconfont"></i>
                <i className="iconfont"></i>
              </span>
              <span>
                {record.a}/{record.b}
              </span>
            </>
          }
          desc={<>Fee Rate: {record.balance}%</>}
        />
      )
    }
  },
  {
    title: 'My Composition',
    dataIndex: 'composition',
    key: 'composition',
    render: (text: string, record: any) => {
      return (
        <Item
          type={2}
          title={
            <>
              <i className="iconfont"></i>
              {text}
            </>
          }
          desc={
            <>
              <i className="iconfont"></i>
              {record.b}
            </>
          }
        />
      )
    }
  },
  {
    title: 'LP Tokens',
    dataIndex: 'LP',
    key: 'LP',
    render: (text: string, record: any) => {
      return <Item title={text} desc={record.balance} />
    }
  },
  {
    title: 'Staked LP Tokens',
    dataIndex: 'LP',
    key: 'LP',
    render: (text: string, record: any) => {
      return <Item title={text} desc={record.balance} />
    }
  },
  {
    title: 'APR',
    dataIndex: 'APR',
    key: 'APR',
    render: (text: string, record: any) => {
      return <Item type={3} title={text} desc={record.unstaking} />
    }
  },
  {
    title: 'Claimable Rewards',
    dataIndex: 'claimable',
    key: 'claimable',
    render: (text: string, record: any) => {
      return <Item title={text} desc={record.claimable} />
    }
  },
  {
    title: 'Actions',
    dataIndex: 'actions',
    key: 'actions',
    render: () => {
      const options: TitleTipsProps[] = [
        {
          label: 'Stake',
          value: 'Stake',
          onClick: () => {}
        },
        {
          label: 'Unstake',
          value: 'Unstake',
          onClick: () => {}
        },
        {
          label: 'Claim Rewards',
          value: 'Claim Rewards',
          onClick: () => {}
        },
        {
          label: 'Yield Boost',
          value: 'Yield Boost',
          onClick: () => {}
        }
      ]
      return <SelectTips options={options} />
    }
  }
]
export default function MyLiquidityPools() {
  return (
    <Card title="My Liquidity Pools">
      <Table columns={columns}></Table>
    </Card>
  )
}
