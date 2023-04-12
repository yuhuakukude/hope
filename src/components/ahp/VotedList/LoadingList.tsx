// @ts-nocheck
import React from 'react'
import './index.scss'
import Table from 'components/antd/Table'
import Skeleton from '../../Skeleton'
import { ColumnProps } from 'antd/lib/table'

type ITableLoadingItem = {
  id: string
  name: string
  allocated: string
  voting: string
  rewards: string
  actions: string
}

const LoadingList = ({ loading }: { loading: boolean }) => {
  const tableLoadingData: ITableLoadingItem[] = [
    { id: '1', name: '1', allocated: '', voting: '', rewards: '', actions: '' },
    { id: '2', name: '2', allocated: '', voting: '', rewards: '', actions: '' }
  ]

  const loadingColumns: ColumnProps<ITableLoadingItem>[] = [
    {
      title: 'Gauges',
      dataIndex: 'id',
      render: () => {
        return <Skeleton loading={loading} width={80}></Skeleton>
      },
      key: 'id'
    },
    {
      title: 'Composition',
      dataIndex: 'name',
      key: 'name',
      render: () => {
        return (
          <div className="flex">
            <Skeleton loading={loading} width={16} height={16}></Skeleton>
            <Skeleton loading={loading} width={50} ml={6}></Skeleton>
          </div>
        )
      }
    },
    {
      title: 'Votes Allocation',
      dataIndex: 'allocated',
      key: 'allocated',
      render: () => {
        return (
          <div>
            <Skeleton loading={loading} width={80}></Skeleton>
            <Skeleton loading={loading} width={80} mt={10}></Skeleton>
          </div>
        )
      }
    },
    {
      title: 'veLT Balance',
      width: 235,
      dataIndex: 'voting',
      key: 'voting',
      render: () => {
        return (
          <div>
            <Skeleton loading={loading} width={80}></Skeleton>
            <Skeleton loading={loading} width={80} mt={10}></Skeleton>
          </div>
        )
      }
    },
    {
      title: 'Voting Rewards',
      dataIndex: 'rewards',
      key: 'rewards',
      render: () => {
        return (
          <div>
            <Skeleton loading={loading} width={80}></Skeleton>
            <Skeleton loading={loading} width={80} mt={10}></Skeleton>
          </div>
        )
      }
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
      align: 'center',
      width: 160,
      render: () => {
        return (
          <div className="flex jc-center">
            <Skeleton loading={loading} width={85} height={30}></Skeleton>
          </div>
        )
      }
    }
  ]

  return (
    <Table
      rowKey={'name'}
      pagination={false}
      className="hp-table"
      columns={loadingColumns}
      dataSource={tableLoadingData}
    />
  )
}

export default LoadingList
