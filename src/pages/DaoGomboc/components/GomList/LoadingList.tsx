// @ts-nocheck
import React from 'react'
import './index.scss'
import Table from 'components/antd/Table'
import Skeleton from '../../../../components/Skeleton'
import { ColumnProps } from 'antd/lib/table'

type ITableLoadingItem = {
  name: string
  composition: string
  weight: string
  ltRewards: string
  gauge: string
}

const LoadingList = ({ loading }: { loading: boolean }) => {
  const tableLoadingData: ITableLoadingItem[] = [
    { name: '1', composition: '', weight: '', ltRewards: '', gauge: '' },
    { name: '2', composition: '', weight: '', ltRewards: '', gauge: '' }
  ]

  const loadingColumns: ColumnProps<ITableLoadingItem>[] = [
    {
      title: 'Gauges',
      dataIndex: 'name',
      key: 'name',
      render: () => {
        return <Skeleton loading={loading} width={80}></Skeleton>
      }
    },
    {
      title: 'Composition',
      dataIndex: 'composition',
      key: 'composition',
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
      title: 'Weight',
      dataIndex: 'weight',
      render: () => {
        return (
          <div>
            <Skeleton loading={loading} width={80}></Skeleton>
            <Skeleton loading={loading} width={80} mt={10}></Skeleton>
          </div>
        )
      },
      key: 'weight'
    },
    {
      title: 'Rewards (Last Cycle)',
      dataIndex: 'ltRewards',
      render: () => {
        return (
          <div>
            <Skeleton loading={loading} width={80}></Skeleton>
            <Skeleton loading={loading} width={80} mt={10}></Skeleton>
          </div>
        )
      },
      key: 'ltRewards'
    },
    {
      title: 'Vote',
      align: 'center',
      dataIndex: 'gauge',
      render: () => {
        return (
          <div className="flex jc-center">
            <Skeleton loading={loading} width={85} height={30}></Skeleton>
          </div>
        )
      },
      key: 'gauge'
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
