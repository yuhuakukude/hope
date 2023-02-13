import React, { useEffect, useState } from 'react'
import Table from 'components/Table'
import PortfolioApi, { IItem } from 'api/portfolio.api'
import { useActiveWeb3React } from 'hooks'
import { endTimestamp, startTimestamp } from '../Detail'
import Tips from 'components/Tips'
import CopyHelper from 'components/AccountDetails/Copy'

const columns = [
  {
    title: 'Pool / Protocol',
    dataIndex: 'gombocName',
    key: 'gombocName',
    render: (
      text: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined,
      record: IItem
    ) => {
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
          <div className="veLT-rewards-item-title">{text}</div>
          <div className="veLT-rewards-item-desc">
            <span className="veLT-rewards-item-name">{record.gomboc.gombocAddress}</span>
            <CopyHelper toCopy="gombocName" />
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
          <div className="veLT-rewards-item-desc">{record.gomboc.IpTokenDecimal}</div>
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
          <div className="veLT-rewards-item-desc">{record.gomboc.IpTokenDecimal}</div>
        </>
      )
    }
  },
  {
    title: 'Actions',
    dataIndex: 'Actions',
    key: 'Actions',
    render: (text: string, record: IItem) => {
      console.log(text, record)
      return <span className="veLT-rewards-item-button">Withdraw</span>
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
  return <Table title={() => 'My List'} columns={columns} dataSource={overviewData} />
}
