import React, { useEffect, useState } from 'react'
import Table from 'components/Table'
import PortfolioApi, { IItem } from 'api/portfolio.api'
import { useActiveWeb3React } from 'hooks'
import { endTimestamp, startTimestamp } from '../Detail'
import Tips from 'components/Tips'
import CopyHelper from 'components/AccountDetails/Copy'

import './index.scss'

const columns = [
  {
    title: 'Pool / Protocol',
    dataIndex: 'gombocName',
    key: 'gombocName',
    render: (text: string, record: IItem) => {
      if (0) {
        return (
          <div className="veLT-rewards-item-title">
            <span className="veLT-rewards-item-other">others</span>
            <Tips title="other tips" />
          </div>
        )
      }
      return (
        <>
          <div className="veLT-rewards-item-title">{record.gomboc.gombocName}</div>
          <div className="veLT-rewards-item-desc">
            {record.gomboc.gombocAddress}
            <span className="veLT-rewards-item-copy">
              <CopyHelper toCopy={record.gomboc.gombocAddress} />
            </span>
          </div>
        </>
      )
    }
  },
  {
    title: () => {
      return (
        <div>
          Total Fees(last period)
          <Tips title="Total Fees(last period)" />
        </div>
      )
    },
    dataIndex: 'totalFees',
    key: 'totalFees',
    render: (text: string, record: IItem) => {
      return (
        <>
          <div className="veLT-rewards-item-title">{text}</div>
          <div className="veLT-rewards-item-desc">≈ ${record.gomboc.IpTokenDecimal}</div>
        </>
      )
    }
  },
  {
    title: 'Withdrawable(all  periods)',
    dataIndex: 'withdrawable',
    key: 'withdrawable',
    render: (text: string, record: IItem) => {
      return (
        <>
          <div className="veLT-rewards-item-title">{text}</div>
          <div className="veLT-rewards-item-desc">≈ ${record.gomboc.IpTokenDecimal}</div>
        </>
      )
    }
  },
  {
    title: 'Actions',
    dataIndex: 'Actions',
    key: 'Actions',
    render: (text: string, record: IItem) => {
      return (
        <span
          className="veLT-rewards-item-button"
          onClick={() => {
            console.log(text, record)
          }}
        >
          Withdraw
        </span>
      )
    }
  }
]

export default function List() {
  const { account } = useActiveWeb3React()
  const [overviewData, setOverviewData] = useState<IItem[]>([])

  useEffect(() => {
    if (!account) {
      return
    }
    PortfolioApi.getRewardsList({
      startTimestamp,
      endTimestamp,
      userAddress: account
    }).then(res => {
      if (res && res.result) {
        setOverviewData(res.result)
      }
    })
  }, [account])
  console.log(overviewData)

  // TODO remove test data
  return (
    <Table
      title={() => 'My List'}
      columns={columns}
      pagination={false}
      dataSource={[
        {
          gomboc: {
            gombocName: 'Protocol HOPE Staking',
            gombocAddress: '0xqw23...Y7dc',
            IpTokenDecimal: '123,456,789.19'
          },
          totalFees: '123,456,789.19 HOPE',
          withdrawable: '≈ 456,000.00 stHOPE'
        } as any
      ]}
    />
  )
}
