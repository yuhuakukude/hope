import Table from 'components/antd/Table'
import React from 'react'
import Card from '../Card'
import Item from '../Item'
import SelectTips, { TitleTipsProps } from '../SelectTips'

const columns = [
  {
    title: 'Protocol',
    dataIndex: 'Protocol',
    key: 'Protocol'
  },
  {
    title: 'My Boost',
    dataIndex: 'boost',
    key: 'boost'
  },
  {
    title: 'Balance',
    dataIndex: 'balance',
    key: 'balance',
    render: (text: string, record: any) => {
      return <Item title={text} desc={record.balance} />
    }
  },
  {
    title: 'Unstaking',
    dataIndex: 'unstaking',
    key: 'unstaking',
    render: (text: string, record: any) => {
      return <Item title={text} desc={record.unstaking} />
    }
  },
  {
    title: 'Unstaked',
    dataIndex: 'unstaked',
    key: 'unstaked',
    render: (text: string, record: any) => {
      return <Item title={text} desc={record.unstaked} />
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
export default function MyHOPEStaking() {
  return (
    <Card title="My HOPE Staking">
      <Table columns={columns}></Table>
    </Card>
  )
}
