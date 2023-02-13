import React from 'react'
import { Table as ATable } from 'antd'
import { TableProps } from 'antd/es/table'

import './index.scss'

export default function Table<T>(props: TableProps<T>) {
  return (
    <div className="hope-dapp-table">
      <ATable {...props} />
    </div>
  )
}
