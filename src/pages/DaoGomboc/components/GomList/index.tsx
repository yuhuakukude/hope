import React, { useState, useEffect, useCallback } from 'react'
import './index.scss'
import { Switch, Input, Table, Button } from 'antd'
import JSBI from 'jsbi'
import { useWalletModalToggle } from '../../../../state/application/hooks'
import { ButtonPrimary } from '../../../../components/Button'
import GombocApi from '../../../../api/gomboc.api'
import { useActiveWeb3React } from '../../../../hooks'
import { TokenAmount } from '@uniswap/sdk'
import { LT } from '../../../../constants'
const GomList = () => {
  const toggleWalletModal = useWalletModalToggle()
  const { account, chainId } = useActiveWeb3React()
  const [searchValue, setSearchValue] = useState('')
  const [isMyVote, setIsMyVote] = useState(false)
  const [tableData, setTableData] = useState([])
  const [voterAddress, setVoterAddress] = useState('')

  const CompositionNode = (text: any) => <span>{text || '--'}</span>

  function getViewAmount(value: any) {
    let res = ''
    if (value && value !== '0') {
      const ta = new TokenAmount(LT[chainId ?? 1], JSBI.BigInt(value))
      const ra = ta.multiply(JSBI.BigInt(100))
      if (ra.toFixed(2) && Number(ra.toFixed(2)) > 0) {
        res = ra.toFixed(2)
      }
    }
    return res
  }

  function toReset() {}

  function toVote() {}

  const weightNode = (text: any, record: any) => {
    return (
      <>
        <p>This period: {getViewAmount(text) || '--'} %</p>
        <p>Next Period: {getViewAmount(record.nextWeight) || '--'} %</p>
      </>
    )
  }

  const votesNote = (text: any) => {
    return (
      <>
        <p> {getViewAmount(text) || '--'} %</p>
        <p>of my voting power</p>
      </>
    )
  }

  const actionNode = (record: any) => {
    return (
      <>
        {!account ? (
          <ButtonPrimary className="hp-button-primary" onClick={toggleWalletModal}>
            Connect Wallet
          </ButtonPrimary>
        ) : (
          <div>
            <Button
              disabled
              className="text-primary font-bold"
              onClick={() => {
                toReset()
              }}
              type="link"
            >
              Reset
            </Button>
            <Button
              className="text-primary font-bold"
              onClick={() => {
                toVote()
              }}
              type="link"
            >
              Vote
            </Button>
          </div>
        )}
      </>
    )
  }

  const columns = [
    {
      title: 'Gömböc',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Composition',
      dataIndex: 'composition',
      render: CompositionNode,
      key: 'composition'
    },
    {
      title: 'Weight',
      dataIndex: 'weight',
      render: weightNode,
      key: 'weight'
    },
    {
      title: 'My votes',
      dataIndex: 'userPower',
      render: votesNote,
      key: 'userPower'
    },
    {
      title: 'vote',
      dataIndex: 'vote',
      render: actionNode,
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
        token: searchValue
      }
      const res = await GombocApi.getGombocsPoolsList(par)
      if (res.result && res.result && res.result.length > 0) {
        setTableData(res.result)
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
        <Table rowKey={'gomboc'} pagination={false} className="hp-table" columns={columns} dataSource={tableData} />
      </div>
    </div>
  )
}

export default GomList
