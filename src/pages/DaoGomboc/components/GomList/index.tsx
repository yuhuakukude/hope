import React, { useState, useEffect, useCallback } from 'react'
import './index.scss'
import { Switch, Input, Table } from 'antd'
import { ButtonPrimary } from '../../../../components/Button'
import GombocApi from '../../../../api/gomboc.api'
import { useActiveWeb3React } from '../../../../hooks'
const GomList = () => {
  const { account } = useActiveWeb3React()
  const [searchValue, setSearchValue] = useState('')
  const [isMyVote, setIsMyVote] = useState(false)
  const [tableData, setTableData] = useState([])
  const [voterAddress, setVoterAddress] = useState('')

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

  function changeSwitch(val: boolean) {
    console.log(isMyVote)
    setIsMyVote(val)
    if (val && account) {
      setVoterAddress(account)
    } else {
      setVoterAddress('')
    }
  }

  function changeVal(val: string) {
    setSearchValue(val)
  }

  const init = useCallback(async () => {
    try {
      const par = {
        voter: voterAddress,
        gombocAddress: searchValue
      }
      const res = await GombocApi.getVoteHistoryList(par)
      if (res.result && res.result.content && res.result.content.length > 0) {
        setTableData(res.result.content)
      } else {
        setTableData([])
      }
    } catch (error) {
      console.log(error)
    }
  }, [voterAddress, searchValue])

  function toSearch() {
    init()
  }

  useEffect(() => {
    init()
  }, [init])

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
        <Table rowKey={'id'} pagination={false} className="hp-table" columns={columns} dataSource={tableData} />
      </div>
    </div>
  )
}

export default GomList
