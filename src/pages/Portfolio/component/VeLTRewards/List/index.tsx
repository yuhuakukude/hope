import React from 'react'
import Table from 'components/Table'
import { Item } from 'api/portfolio.api'
// import { useActiveWeb3React } from 'hooks'
import Tips from 'components/Tips'
import CopyHelper from 'components/AccountDetails/Copy'
import { toUsdPrice } from '../../../../../hooks/ahp/usePortfolio'

import './index.scss'

interface ListProps {
  withdrawItem: (index: number) => void
  tableData: any
  hopePrice: string
}

export default function List({ withdrawItem, tableData, hopePrice }: ListProps) {
  const columns = [
    {
      title: 'Pool / Protocol',
      dataIndex: 'gombocName',
      key: 'gombocName',
      render: (text: string, record: Item) => {
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
            <div className="veLT-rewards-item-title">{record.gomboc?.gombocName}</div>
            <div className="veLT-rewards-item-desc">
              {record.gomboc?.gombocAddress}
              <span className="veLT-rewards-item-copy">
                <CopyHelper toCopy={record.gomboc?.gombocAddress} />
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
      render: (text: string) => {
        return (
          <>
            <div className="veLT-rewards-item-title">{text}</div>
            <div className="veLT-rewards-item-desc">≈ ${toUsdPrice(text, hopePrice) || '--'}</div>
          </>
        )
      }
    },
    {
      title: 'Withdrawable(all  periods)',
      dataIndex: 'withdrawable',
      key: 'withdrawable',
      render: (text: string) => {
        return (
          <>
            <div className="veLT-rewards-item-title">{text}</div>
            <div className="veLT-rewards-item-desc">≈ ${toUsdPrice(text, hopePrice) || '--'}</div>
          </>
        )
      }
    },
    {
      title: 'Actions',
      dataIndex: 'Actions',
      key: 'Actions',
      render: (text: string, record: Item, index: number) => {
        return (
          <span
            className="veLT-rewards-item-button"
            onClick={() => {
              console.log(text, record)
              withdrawItem(index)
            }}
          >
            Withdraw
          </span>
        )
      }
    }
  ]

  // TODO remove test data
  return <Table title={() => 'My List'} columns={columns} pagination={false} dataSource={tableData} />
}
