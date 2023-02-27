import Button from 'components/antd/Button'
import Table from 'components/antd/Table'
import Tips from 'components/Tips'
import React from 'react'
import Card from '../Card'
import Item from '../Item'
import SelectTips, { TitleTipsProps } from '../SelectTips'

import './index.scss'

const columns = [
  {
    title: 'Gömböc',
    dataIndex: 'Protocol',
    key: 'Protocol'
  },
  {
    title: 'Composition',
    dataIndex: 'boost',
    key: 'boost',
    render: (text: string, record: any) => {
      return record.a ? (
        <>
          <i className="iconfont"></i>
          {record.b}
        </>
      ) : (
        <Item
          type={2}
          title={
            <>
              <i className="iconfont"></i>
              {record.b}
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
    title: 'Allocated Votes',
    dataIndex: 'balance',
    key: 'balance',
    render: (text: string, record: any) => {
      return <Item type={2} title={text} desc={record.balance} />
    }
  },
  {
    title: (
      <>
        veLT Voting Balance{' '}
        <span className="title-button" onClick={() => {}}>
          Refresh All
        </span>
      </>
    ),
    dataIndex: 'unstaking',
    key: 'unstaking',
    render: (text: string, record: any) => {
      return <Item type={2} title={text} desc={record.unstaking} />
    }
  },
  {
    title: (
      <>
        Voting Rewards
        <i className="iconfont title-button" onClick={() => {}}>
          &#xe60a;
        </i>
      </>
    ),
    dataIndex: 'unstaked',
    key: 'unstaked',
    render: (text: string, record: any) => {
      return <Item type={2} title={text} desc={record.unstaked} />
    }
  },

  {
    title: 'Actions',
    dataIndex: 'actions',
    key: 'actions',
    render: () => {
      const options: TitleTipsProps[] = [
        {
          label: 'Claim Voting Rewards',
          value: 'Claim Voting Rewards',
          onClick: () => {}
        },
        {
          label: 'Refresh Voting Balance',
          value: 'Refresh Voting Balance',
          onClick: () => {}
        },
        {
          label: 'Pool Details',
          value: 'Pool Details',
          onClick: () => {}
        }
      ]
      return <SelectTips options={options} />
    }
  }
]
export default function MyLockedLTAndProfits() {
  return (
    <Card title="My Locked LT & Profits">
      <div className="my-locked-lt-content">
        <div className="my-locked-lt-row">
          <div className="my-locked-lt-col">
            <div className="my-locked-lt-title">Locked LT Amount</div>
            <div className="my-locked-lt-desc">
              <span className="my-locked-lt-value">≈ 123,456,789.00 LT</span>
              <span className="my-locked-lt-value2">Locked Until: 2023-01-20</span>
            </div>
          </div>
          <div className="my-locked-lt-col">
            <div className="my-locked-lt-title">Balance in Voting Escrow</div>
            <div className="my-locked-lt-desc">
              <span className="my-locked-lt-value">≈ 123,456,789.00 veLT</span>
              <span className="my-locked-lt-value2">12.03% share of total</span>
            </div>
            <Button className="my-locked-lt-button" type="ghost">
              Increase veLT
            </Button>
          </div>
        </div>
        <div className="my-locked-lt-row2">
          <div className="my-locked-lt-col">
            <div className="my-locked-lt-title">
              Claimable veLT Held Fees <Tips title="Claimable veLT Held Fees Tips"></Tips>
            </div>
            <div className="my-locked-lt-desc">
              <span className="my-locked-lt-value">≈ 123,456,789.00 stHOPE</span>
              <span className="my-locked-lt-value2">≈ $123,456,789.00</span>
            </div>
            <Button className="my-locked-lt-button" type="ghost">
              Claim All
            </Button>
          </div>
          <div className="my-locked-lt-col">
            <div className="my-locked-lt-title">
              Claimable veLT voting Fees<Tips title="Claimable veLT Held Fees Tips"></Tips>
            </div>
            <div className="my-locked-lt-desc">
              <span className="my-locked-lt-value">≈ 123,456,789.00 stHOPE</span>
              <span className="my-locked-lt-value2">≈ $123,456,789.00</span>
            </div>
            <Button className="my-locked-lt-button" type="ghost">
              Claim All
            </Button>
          </div>
        </div>
      </div>
      <Table columns={columns} pagination={{ total: 500 }}></Table>
    </Card>
  )
}
