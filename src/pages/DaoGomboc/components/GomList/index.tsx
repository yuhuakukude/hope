import React, { useState, useEffect, useCallback, useMemo, useImperativeHandle, forwardRef } from 'react'
import './index.scss'
import Table from 'components/antd/Table'
import { Input, Button } from 'antd'
import dayjs from 'dayjs'
import { JSBI } from '@uniswap/sdk'
import { ButtonPrimary } from '../../../../components/Button'
import GombocApi from '../../../../api/gomboc.api'
import { useActiveWeb3React } from '../../../../hooks'
import { TokenAmount } from '@uniswap/sdk'
import { LT, ST_HOPE, STAKING_HOPE_GOMBOC_ADDRESS } from '../../../../constants'

import { useSingleContractMultipleData } from '../../../../state/multicall/hooks'
import { useGomConContract } from '../../../../hooks/useContract'
import VotedList from '../../../../components/ahp/VotedList'

interface ListProps {
  toSetSelGom: (gomboc: string) => void
}

const GomListF = ({ toSetSelGom }: ListProps, ref: any) => {
  const gomConContract = useGomConContract()
  const { account, chainId } = useActiveWeb3React()
  const [searchValue, setSearchValue] = useState('')
  const [tableData, setTableData] = useState<any>([])
  const [curType, setCurType] = useState('all')
  const stakingAddress = `${STAKING_HOPE_GOMBOC_ADDRESS[chainId ?? 1]}`.toLocaleLowerCase()
  const argList = useMemo(() => {
    let res: any = []
    const arr: any = []
    if (tableData && tableData.length > 0) {
      tableData.forEach((e: any) => {
        if (e.gomboc && account) {
          arr.push([account, e.gomboc])
        }
      })
      res = arr
    }
    return res
  }, [tableData, account])

  const lastVoteData = useSingleContractMultipleData(gomConContract, 'lastUserVote', argList)
  const isTimeDis = useMemo(() => {
    const res: any = {}
    if (tableData.length > 0 && lastVoteData.length > 0 && tableData.length === lastVoteData.length) {
      lastVoteData.forEach((e: any, index) => {
        let item = false
        if (Number(e.result)) {
          const now = dayjs()
          const end = dayjs.unix(Number(e.result)).add(10, 'day')
          item = now.isBefore(end)
        }
        res[tableData[index]?.gomboc] = item
      })
    }
    return res
  }, [lastVoteData, tableData])

  function getViewAmount(value: any) {
    let res = ''
    if (value && value !== '0') {
      const ta = new TokenAmount(LT[chainId ?? 1], JSBI.BigInt(value))
      const ra = ta.multiply(JSBI.BigInt(100))
      if (ra.toFixed(2) && Number(ra.toFixed(2)) > 0) {
        res = `${ra.toFixed(2)}`
      }
    }
    return res
  }

  function getReAmount(value: any) {
    let res = ''
    if (value && value !== '0') {
      const ta = new TokenAmount(LT[chainId ?? 1], JSBI.BigInt(value))
      if (ta.toFixed(2) && Number(ta.toFixed(2)) > 0) {
        res = `${ta.toFixed(2)}`
      }
    }
    return res
  }

  function getFeeAmount(value: any) {
    let res = ''
    if (value && value !== '0') {
      const ta = new TokenAmount(ST_HOPE[chainId ?? 1], JSBI.BigInt(value))
      if (ta.toFixed(2) && Number(ta.toFixed(2)) > 0) {
        res = `${ta.toFixed(2)}`
      }
    }
    return res
  }

  function toVoteFn(item: any) {
    const dom = document.getElementById('votepoint')
    if (dom) {
      dom.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
    if (item && item.gomboc) {
      toSetSelGom(item.gomboc)
    }
  }

  const weightNode = (text: any, record: any) => {
    return (
      <>
        <p>This Period: {getViewAmount(text) ? `${getViewAmount(text)} %` : '--'}</p>
        <p>Next Period: {getViewAmount(record.nextWeight) ? `${getViewAmount(record.nextWeight)} %` : '--'}</p>
      </>
    )
  }

  const rewardsNode = (text: any, record: any) => {
    return (
      <>
        <p>Mining Rewards: {getReAmount(text) ? `${getReAmount(text)} LT` : '--'}</p>
        <p>Fee Rewards: {getFeeAmount(record.feeRewards) ? `${getFeeAmount(record.feeRewards)} stHOPE` : '--'}</p>
      </>
    )
  }

  const actionNode = (text: any, record: any) => {
    return (
      <>
        {!account ? (
          <span>--</span>
        ) : (
          <div>
            <Button
              className="text-primary font-bold"
              disabled={isTimeDis[record.gomboc]}
              onClick={() => {
                toVoteFn(record)
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
      key: 'name',
      render: (text: string, record: any) => {
        if (record.gomboc && stakingAddress === record.gomboc) {
          return <span>Staking $HOPE</span>
        } else {
          return <span>{`pool - ${text}`}</span>
        }
      }
    },
    {
      title: 'Composition',
      dataIndex: 'composition',
      key: 'composition',
      render: (text: string, record: any) => {
        if (record.gomboc && stakingAddress === record.gomboc) {
          return <span>HOPE</span>
        } else {
          const [token0, token1] = text.split('/')
          return (
            <>
              <p>{token0}</p>
              <p>{token1}</p>
            </>
          )
        }
      }
    },
    {
      title: 'Weight',
      dataIndex: 'weight',
      render: weightNode,
      sorter: (a: any, b: any) => a.weight - b.weight,
      key: 'weight'
    },
    {
      title: 'Rewards(Last Period)',
      dataIndex: 'ltRewards',
      render: rewardsNode,
      sorter: (a: any, b: any) => a.ltRewards - b.ltRewards,
      key: 'ltRewards'
    },
    {
      title: 'Vote',
      dataIndex: 'gomboc',
      render: actionNode,
      key: 'gomboc'
    }
  ]

  const init = useCallback(async () => {
    try {
      const res = await GombocApi.getGombocsAllPools()
      if (res.result && res.result && res.result.length > 0) {
        res.result.sort((a: any, b: any) => {
          return b.weight - a.weight
        })
        setTableData(res.result)
      } else {
        setTableData([])
      }
    } catch (error) {
      console.log(error)
    }
  }, [])

  function changeVal(val: string) {
    setSearchValue(val)
  }

  function toSearch() {
    if (tableData && tableData.length > 0) {
      const arr: any = []
      tableData.forEach((e: any) => {
        const val = `${searchValue}`.toUpperCase()
        if (`${e.name}`.includes(val)) {
          arr.push(e)
        }
      })
      setTableData(arr)
    }
  }

  function reset() {
    setCurType('all')
    setSearchValue('')
  }

  useImperativeHandle(ref, () => ({
    initTableData: () => {
      reset()
      init()
    }
  }))

  useEffect(() => {
    setSearchValue('')
    init()
  }, [init, account])

  useEffect(() => {
    if (!searchValue) {
      init()
    }
  }, [searchValue, init])

  return (
    <>
      <div className="gom-list-box">
        <div className="flex jc-between">
          <div className="flex">
            <div className={['add-tab', 'flex', curType === 'my' ? 'my-active' : ''].join(' ')}>
              <div
                className={['item-tab', 'flex-1', 'font-nor', 'text-medium', curType === 'all' ? 'active' : ''].join(
                  ' '
                )}
                onClick={() => setCurType('all')}
              >
                All
              </div>
              <div
                className={['item-tab', 'flex-1', 'font-nor', 'text-medium', curType === 'my' ? 'active' : ''].join(
                  ' '
                )}
                onClick={() => setCurType('my')}
              >
                My Voted
              </div>
            </div>
          </div>
          {curType === 'all' ? (
            <div className="flex ai-center">
              <Input
                onChange={e => {
                  changeVal(e.target.value)
                }}
                allowClear={true}
                onPressEnter={() => {
                  toSearch()
                }}
                prefix={<i className="iconfont text-normal font-16 m-r-12">&#xe61b;</i>}
                className="search-input"
                placeholder="Search Token Symbol"
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
          ) : (
            <div></div>
          )}
        </div>
        <div className="m-t-30">
          {curType === 'all' && (
            <Table rowKey={'gomboc'} pagination={false} className="hp-table" columns={columns} dataSource={tableData} />
          )}
          {curType === 'my' && <VotedList isShowAll={false} />}
        </div>
      </div>
    </>
  )
}
const GomList = forwardRef(GomListF)
export default GomList
