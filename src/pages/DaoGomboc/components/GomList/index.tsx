import React, { useState } from 'react'
import './index.scss'
import { Switch, Input, Table } from 'antd'
import { ButtonPrimary } from '../../../../components/Button'
// import GombocApi from '../../../../../api/gomboc.api'

const GomList = () => {
  const [searchValue, setSearchValue] = useState('')
  const [isMyVote, setIsMyVote] = useState(false)
  // const [tableData, setTableData] = useState([])

  function changeSwitch(val: boolean) {
    console.log(isMyVote)
    setIsMyVote(val)
  }

  function changeVal(val: string) {
    setSearchValue(val)
  }

  function toSearch() {
    console.log(searchValue)
  }

  const dataSource: any = []

  const columns = [
    {
      title: 'Gömböc',
      dataIndex: 'gombocName',
      key: 'gombocName'
    },
    {
      title: 'Composition',
      dataIndex: 'Composition',
      key: 'Composition'
    },
    {
      title: 'Weight',
      dataIndex: 'Weight',
      key: 'Weight'
    },
    {
      title: 'My votes',
      dataIndex: 'votes',
      key: 'votes'
    },
    {
      title: 'vote',
      dataIndex: 'vote',
      key: 'vote'
    }
  ]

  return (
    <div className="gom-list-box">
      <div className="flex jc-between">
        <div className="flex ai-center">
          <span className="text-white">My voted Only</span>
          <Switch className="m-l-10" onChange={changeSwitch} />
        </div>
        <div className="flex ai-center">
          <Input
            onChange={e => {
              changeVal(e.target.value)
            }}
            prefix={<i className="iconfont text-normal font-16 m-r-12">&#xe61b;</i>}
            className="search-input"
            placeholder="Search Token Symbol / Pool Address"
            value={searchValue}
            defaultValue="mysite"
          />
          <ButtonPrimary
            className="m-l-20 search-btn "
            onClick={() => {
              toSearch()
            }}
          >
            Search
          </ButtonPrimary>
        </div>
      </div>
      <div className="m-t-30">
        <Table pagination={false} className="text-white" columns={columns} dataSource={dataSource} />
      </div>
    </div>
  )
}

export default GomList
