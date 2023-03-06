import React, { useState, useCallback, useEffect, useMemo } from 'react'
import './index.scss'
import Table from 'components/antd/Table'
import dayjs from 'dayjs'
import { Pagination } from 'antd'
import { Token, JSBI, Percent } from '@uniswap/sdk'
import { useActiveWeb3React } from '../../../hooks'
import { TokenAmount } from '@uniswap/sdk'
import { VELT, SUBGRAPH, STAKING_HOPE_GOMBOC_ADDRESS, ST_HOPE } from '../../../constants'
import { useToVote, useToVoteAll } from '../../../hooks/ahp/useGomVote'
// import format from '../../../utils/format'
import { useSingleContractMultipleData } from '../../../state/multicall/hooks'
import { useGomConContract, useGomFeeDisContract } from '../../../hooks/useContract'
import TransactionConfirmationModal, { TransactionErrorContent } from '../../TransactionConfirmationModal'
import { useTokenBalance } from '../../../state/wallet/hooks'
import { postQuery } from '../../../utils/graph'
import { useTokenPrice } from '../../../hooks/liquidity/useBasePairs'
import { toUsdPrice } from 'hooks/ahp/usePortfolio'
import moment from 'moment'
import SelectTips, { TitleTipsProps } from 'pages/Portfolio/component/SelectTips'
import FeesWithdraw from '../FeesWithdraw'
import { useGomFeeClaim } from '../../../hooks/ahp/usePortfolio'
import Row from '../../../components/Row'
import { Decimal } from 'decimal.js'
import format from '../../../utils/format'
import { useHistory } from 'react-router-dom'

const VotedList = ({
  getVotingRewards,
  getAllData,
  isShowAll
}: {
  getVotingRewards?: (stHope: string, toUsd: string) => void
  getAllData?: (list: any) => void
  isShowAll: boolean
}) => {
  const gomConContract = useGomConContract()
  const gomFeeDisContract = useGomFeeDisContract()
  const { account, chainId } = useActiveWeb3React()
  const [tableData, setTableData] = useState<any>([])
  const [allTableData, setAllTableData] = useState<any>([])
  const [curTableItem, setCurTableItem] = useState<any>({})
  const [curItemData, setCurItemData] = useState<any>({})
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(5)
  const [pageTotal, setPageTotal] = useState<number>(0)
  const history = useHistory()
  const addresses = useMemo(() => {
    return [STAKING_HOPE_GOMBOC_ADDRESS[chainId ?? 1]]
  }, [chainId])
  const { result: priceResult } = useTokenPrice(addresses)
  const [curToken, setCurToken] = useState<Token | undefined>(VELT[chainId ?? 1])
  const { toVote } = useToVote()
  const { toVoteAll } = useToVoteAll()
  const { toGomFeeClaim } = useGomFeeClaim()
  const veltBalance = useTokenBalance(account ?? undefined, VELT[chainId ?? 1])

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm
  // txn values
  const [txHash, setTxHash] = useState<string>('')
  const [errorStatus, setErrorStatus] = useState<{ code: number; message: string } | undefined>()
  const [pendingText, setPendingText] = useState('')

  const argList = useMemo(() => {
    let res: any = []
    const arr: any = []
    if (tableData && tableData.length > 0) {
      tableData.forEach((e: any) => {
        if (e.gomboc.id && account) {
          arr.push([account, e.gomboc.id])
        }
      })
      res = arr
    }
    return res
  }, [tableData, account])

  const claArgList = useMemo(() => {
    let res: any = []
    const arr: any = []
    if (tableData && tableData.length > 0) {
      tableData.forEach((e: any) => {
        if (e.gomboc.id && account) {
          arr.push([e.gomboc.id, account])
        }
      })
      res = arr
    }
    return res
  }, [tableData, account])

  const lastEpochList = useSingleContractMultipleData(gomConContract, 'lastVoteVeLtPointEpoch', argList)
  const lastEpochData = useMemo(() => {
    const res: any = []
    if (tableData.length > 0 && lastEpochList.length > 0 && tableData.length === lastEpochList.length) {
      lastEpochList.forEach((e: any, index) => {
        res.push(Number(e.result))
      })
    }
    return res
  }, [lastEpochList, tableData])

  const epoArgList = useMemo(() => {
    let res: any = []
    const arr: any = []
    if (tableData && tableData.length > 0 && lastEpochData.length > 0) {
      tableData.forEach((e: any, index: number) => {
        if (e.gomboc.id && account && lastEpochData[index]) {
          arr.push([account, e.gomboc.id, lastEpochData[index]])
        }
      })
      res = arr
    }
    return res
  }, [tableData, account, lastEpochData])

  const lastVoteData = useSingleContractMultipleData(gomConContract, 'lastUserVote', argList)
  const allocatedData = useSingleContractMultipleData(gomConContract, 'voteUserSlopes', argList)
  const pointData = useSingleContractMultipleData(gomConContract, 'voteVeLtPointHistory', epoArgList)
  const rewardsData = useSingleContractMultipleData(gomFeeDisContract, 'claimableTokens', claArgList)
  const rewardsView = useMemo(() => {
    const res: any = {}
    if (tableData.length > 0 && rewardsData.length > 0 && tableData.length === rewardsData.length) {
      rewardsData.forEach((e: any, index) => {
        let view = ''
        let usdOfValue = ''
        let value = ''
        if (e.result) {
          const tn = new TokenAmount(ST_HOPE[chainId ?? 1], JSBI.BigInt(Number(e.result)) ?? '0')
          view = tn.toFixed(2, { groupSeparator: ',' } ?? '0.00')
          value = tn.toFixed(2)
          if (priceResult && priceResult[0] && priceResult[0].price) {
            usdOfValue = toUsdPrice(tn.toFixed(2), priceResult[0].price)
          }
        }
        const addr = tableData[index]?.gomboc.id
        res[addr] = {
          view,
          value: format.amountFormat(value, 2),
          usdOfValue: format.amountFormat(usdOfValue, 2)
        }
      })
    }
    let stHope = 0
    let toUsd = 0
    Object.values(res).forEach((item: any) => {
      stHope = new Decimal(stHope).add(new Decimal(Number(item.value))).toNumber()
      toUsd = new Decimal(toUsd).add(new Decimal(Number(item.usdOfValue))).toNumber()
    })
    getVotingRewards && getVotingRewards(format.amountFormat(stHope, 2), format.amountFormat(toUsd, 2))
    const arr: any = []
    tableData.forEach((e: any) => {
      const addr = e.gomboc.id
      const item: any = {
        name: '',
        value: '',
        usdOfValue: '',
        id: ''
      }
      if (e.gomboc && e.gomboc.pair) {
        const pa = e.gomboc.pair
        let token0 = ''
        let token1 = ''
        if (pa.token0 && pa.token1) {
          token0 = pa.token0.symbol
          token1 = pa.token1.symbol
        }
        item.name = `Pool - ${token0}/${token1}`
      } else {
        item.name = `Staking $HOP`
      }
      item.value = res[addr].view
      item.usdOfValue = res[addr].usdOfValue
      item.id = addr
      if (res[addr].value && Number(res[addr].value) > 0) {
        arr.push(item)
      }
    })
    getAllData && getAllData(arr)
    return res
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rewardsData, tableData, priceResult, chainId])

  const allocatedView = useMemo(() => {
    const res: any = {}
    if (tableData.length > 0 && allocatedData.length > 0 && tableData.length === allocatedData.length) {
      allocatedData.forEach((e: any, index) => {
        let item = ''
        let po = 0
        let fu = ''
        if (e.result && e.result.power) {
          po = e.result.power
          const cp = JSBI.BigInt(Number(po))
          const ra = new Percent(cp, JSBI.BigInt(10000))
          item = `${ra.toFixed(2)}`
          if (veltBalance) {
            fu = veltBalance
              ?.multiply(cp)
              .divide(JSBI.BigInt(10000))
              .toFixed(2, { groupSeparator: ',' } ?? '0.00', 0)
          }
        }
        const addr = tableData[index]?.gomboc.id
        res[addr] = {
          value: po,
          view: item,
          future: fu
        }
      })
    }
    return res
  }, [allocatedData, tableData, veltBalance])

  const pointView = useMemo(() => {
    const res: any = {}
    if (tableData.length > 0 && pointData.length > 0 && tableData.length === pointData.length) {
      pointData.forEach((e: any, index) => {
        if (e.result && e.result.ts) {
          const nre = e.result
          const now = moment().unix()
          const ti = Number(now) - Number(nre.ts)
          const sl = JSBI.multiply(JSBI.BigInt(Number(nre.slope)), JSBI.BigInt(ti))
          const sub = JSBI.subtract(JSBI.BigInt(Number(nre.bias)), JSBI.BigInt(Number(sl)))
          const num = JSBI.lessThan(JSBI.BigInt(Number(sub)), JSBI.BigInt('0'))
            ? JSBI.BigInt('0')
            : JSBI.BigInt(Number(sub))
          const tn = new TokenAmount(VELT[chainId ?? 1], JSBI.BigInt(Number(num)) ?? '0')
          const ftn = tn.toFixed(2, { groupSeparator: ',' })
          const addr = tableData[index]?.gomboc.id
          res[addr] = ftn
        }
      })
    }
    return res
  }, [pointData, tableData, chainId])

  const isTimeDis = useMemo(() => {
    const res: any = {}
    if (tableData.length > 0 && lastVoteData.length > 0 && tableData.length === lastVoteData.length) {
      const addArr: any = []
      const amountArr: any = []
      lastVoteData.forEach((e: any, index) => {
        let item = false
        if (Number(e.result)) {
          const now = dayjs()
          const end = dayjs.unix(Number(e.result)).add(10, 'day')
          item = now.isBefore(end)
        }
        const addr = tableData[index]?.gomboc.id
        if (!item && allocatedView[addr].value) {
          addArr.push(addr)
          amountArr.push(allocatedView[addr].value)
        }
        res[addr] = item
      })
      if (addArr.length === amountArr.length) {
        // setAllArgAdd(addArr)
        // setAllArgAmount(amountArr)
      }
    }
    return res
  }, [lastVoteData, tableData, allocatedView])

  const allArg = useMemo(() => {
    const res: any = {
      add: [],
      amount: []
    }
    if (tableData.length > 0) {
      tableData.forEach((e: any) => {
        const arr = e.gomboc.id
        if (!isTimeDis[arr]) {
          res.add.push(arr)
          res.amount.push(allocatedView[arr].value)
        }
      })
    }
    return res
  }, [isTimeDis, tableData, allocatedView])

  const toVoteCallback = useCallback(
    async (item: any) => {
      if (!account) return
      setCurToken(undefined)
      setShowConfirm(true)
      setAttemptingTxn(true)
      setPendingText(`Refresh Voting Balance`)
      const argAmount = allocatedView[item.gomboc.id].value
      const curAdd = item.gomboc.id
      toVote(curAdd, argAmount)
        .then((hash: any) => {
          setShowConfirm(true)
          setAttemptingTxn(false)
          hash && setTxHash(hash)
          setPendingText(``)
        })
        .catch((error: any) => {
          setShowConfirm(true)
          setTxHash('')
          setPendingText(``)
          setAttemptingTxn(false)
          setErrorStatus({ code: error?.code, message: error.message })
        })
    },
    [account, toVote, allocatedView]
  )

  const toVoteAllCallback = useCallback(async () => {
    if (!account) return
    setCurToken(undefined)
    setShowConfirm(true)
    setAttemptingTxn(true)
    setPendingText(`Refresh All`)
    const curAdd = allArg.add && allArg.add.length > 0 ? allArg.add : []
    const argAmount: any = allArg.amount && allArg.amount.length > 0 ? allArg.amount : []
    toVoteAll(curAdd, argAmount)
      .then((hash: any) => {
        setShowConfirm(true)
        setAttemptingTxn(false)
        hash && setTxHash(hash)
        setPendingText(``)
      })
      .catch((error: any) => {
        setShowConfirm(true)
        setTxHash('')
        setPendingText(``)
        setAttemptingTxn(false)
        setErrorStatus({ code: error?.code, message: error.message })
      })
  }, [account, toVoteAll, allArg])

  const onTxStart = useCallback(() => {
    setShowConfirm(true)
    setAttemptingTxn(true)
  }, [])

  const onTxSubmitted = useCallback((hash: string | undefined) => {
    setShowConfirm(true)
    setAttemptingTxn(false)
    hash && setTxHash(hash)
  }, [])

  const onTxError = useCallback(error => {
    setShowConfirm(true)
    setTxHash('')
    setAttemptingTxn(false)
    setErrorStatus({ code: error?.code, message: error.message })
  }, [])

  const gomFeeClaimCallback = useCallback(async () => {
    if (!account) return
    setCurToken(ST_HOPE[chainId ?? 1])
    onTxStart()
    setPendingText(`Fees Withdraw`)
    const arg = curTableItem.gomboc.id
    const amount = curItemData.value
    toGomFeeClaim(arg, amount)
      .then(hash => {
        setPendingText('')
        onTxSubmitted(hash)
      })
      .catch((error: any) => {
        setPendingText('')
        onTxError(error)
      })
  }, [account, chainId, onTxError, onTxStart, onTxSubmitted, toGomFeeClaim, curTableItem, curItemData])

  const withdrawItemFn = (item: any) => {
    if (tableData && tableData.length > 0) {
      setCurTableItem(item)
      setCurItemData({
        value: rewardsView[item.gomboc.id].view,
        usdOfValue: rewardsView[item.gomboc.id].usdOfValue
      })
    }
    setTxHash('')
    setErrorStatus(undefined)
    setAttemptingTxn(false)
    setShowConfirm(true)
  }

  const confirmationContent = useCallback(
    () =>
      errorStatus ? (
        <TransactionErrorContent
          errorCode={errorStatus.code}
          onDismiss={() => setShowConfirm(false)}
          message={errorStatus.message}
        />
      ) : (
        <FeesWithdraw
          onSubmit={() => {
            gomFeeClaimCallback()
          }}
          onDismiss={() => setShowConfirm(false)}
          curWithType={'item'}
          itemData={curItemData}
        />
      ),
    [errorStatus, curItemData, gomFeeClaimCallback]
  )

  const columns = [
    {
      title: 'Gömböc',
      dataIndex: 'id',
      render: (text: string, record: any) => {
        if (record.gomboc && record.gomboc.pair) {
          const pa = record.gomboc.pair
          let token0 = ''
          let token1 = ''
          if (pa.token0 && pa.token1) {
            token0 = pa.token0.symbol
            token1 = pa.token1.symbol
          }
          return <span>{`Pool - ${token0}/${token1}`}</span>
        }
        return <span>Staking $HOPE</span>
      },
      key: 'id'
    },
    {
      title: 'Composition',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => {
        if (record.gomboc && record.gomboc.pair) {
          const pa = record.gomboc.pair
          let token0 = ''
          let token1 = ''
          if (pa.token0 && pa.token1) {
            token0 = pa.token0.symbol
            token1 = pa.token1.symbol
          }
          return (
            <>
              <p>{token0}</p>
              <p>{token1}</p>
            </>
          )
        }
        return <span>HOPE</span>
      }
    },
    {
      title: 'Allocated Votes',
      dataIndex: 'allocated',
      key: 'allocated',
      render: (text: string, record: any) => {
        return (
          <>
            <p>{`${allocatedView[record.gomboc.id].view} %`}</p>
            <p>of my voting power</p>
          </>
        )
      }
    },
    {
      title: (
        <>
          veLT Voting Balance{' '}
          {isShowAll && allArg && allArg.add && allArg.add.length > 0 && (
            <span
              className="title-button"
              onClick={() => {
                toVoteAllCallback()
              }}
            >
              Refresh All
            </span>
          )}
        </>
      ),
      width: 235,
      dataIndex: 'voting',
      key: 'voting',
      render: (text: string, record: any) => {
        return (
          <>
            <p>Future: {allocatedView[record.gomboc.id].future}</p>
            <p>Current: {pointView[record.gomboc.id]}</p>
          </>
        )
      }
    },
    {
      title: 'Voting Rewards',
      dataIndex: 'rewards',
      key: 'rewards',
      render: (text: string, record: any) => {
        return (
          <>
            <p>≈ {rewardsView[record.gomboc.id].view} stHOPE</p>
            <p>≈ ${rewardsView[record.gomboc.id].usdOfValue}</p>
          </>
        )
      }
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
      width: 150,
      render: (text: string, record: any) => {
        const options: TitleTipsProps[] = [
          {
            label: 'Pool Details',
            value: 'Pool',
            onClick: () => {
              history.push(`/swap/liquidity/pool-detail/${record.gomboc.pair.id}`)
            }
          }
        ]
        const val = rewardsView[record.gomboc.id].value
        if (val && Number(val) > 0) {
          options.unshift({
            label: 'Claim Voting Rewards',
            value: 'Claim',
            onClick: () => {
              withdrawItemFn(record)
            }
          })
        }
        if (!isTimeDis[record.gomboc.id]) {
          options.unshift({
            label: 'Refresh Voting Balance',
            value: 'Refresh',
            onClick: () => {
              toVoteCallback(record)
            }
          })
        }
        return <SelectTips options={options} />
      }
    }
  ]

  const init = useCallback(async () => {
    const par = account ? `${account}`.toLocaleLowerCase() : ''
    const query = `{
      user(id:"${par}") {
        voteGombocs{
          gomboc{
            id
            pair {
              id
              token0 {
                id
                symbol
                name
              }
              token1 {
                id
                symbol
                name
              }
            }
          }
        }
      }
    }`
    try {
      const response = await postQuery(SUBGRAPH, query)
      if (response && response.data && response.data.user && response.data.user.voteGombocs) {
        const listData = response.data.user.voteGombocs
        setPageTotal(listData.length || 0)
        setAllTableData(listData)
        setTableData(listData.slice(0, pageSize))
      } else {
        setTableData([])
      }
    } catch (error) {
      console.log(error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account])

  useEffect(() => {
    if (account) {
      init()
    }
  }, [init, account])

  const setPageSearch = (page: number, pagesize: number) => {
    const resList = allTableData?.slice((page - 1) * pagesize, Number(pagesize) + (page - 1) * pagesize)
    setTableData(resList)
  }

  const onPagesChange = (page: any, pageSize: any) => {
    setCurrentPage(Number(page))
    setPageSize(Number(pageSize))
    setPageSearch(page, pageSize)
  }

  return (
    <>
      <TransactionConfirmationModal
        isOpen={showConfirm}
        onDismiss={() => setShowConfirm(false)}
        attemptingTxn={attemptingTxn}
        hash={txHash}
        content={confirmationContent}
        pendingText={pendingText}
        currencyToAdd={curToken}
      />
      <div className="my-list-box">
        <Table rowKey={'id'} pagination={false} className="hp-table" columns={columns} dataSource={tableData} />
      </div>
      {pageTotal > 0 && (
        <Row justify="center">
          <Pagination
            showQuickJumper
            total={pageTotal}
            current={currentPage}
            pageSize={pageSize}
            showSizeChanger
            pageSizeOptions={['5', '10', '20', '30', '40']}
            onChange={onPagesChange}
            onShowSizeChange={onPagesChange}
          />{' '}
          <span className="m-l-15" style={{ color: '#868790' }}>
            Total {pageTotal}
          </span>
        </Row>
      )}
    </>
  )
}
// const GomList = forwardRef(GomListF)
export default VotedList
