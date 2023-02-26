import React from 'react'
import { Table as ATable } from 'antd'
import { TableProps } from 'antd/es/table'

import './index.scss'
import { PaginationProps } from 'antd/lib/pagination'
export default function Table<T>(props: TableProps<T>) {
  let pagination: PaginationProps | undefined
  if (props.pagination) {
    pagination = {
      showSizeChanger: true,
      defaultCurrent: 1,
      showQuickJumper: true,
      showTotal: total => {
        return <div>{total} in total</div>
      },
      ...props.pagination
    }
  }
  return (
    <div className="hope-dapp-table">
      <ATable {...props} pagination={pagination} />
    </div>
  )
}

Table.Column = ATable.Column
Table.ColumnGroup = ATable.ColumnGroup
