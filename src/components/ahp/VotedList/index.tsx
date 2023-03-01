import React, { useState, useEffect, useCallback, useMemo } from 'react'
import './index.scss'
import { Table, Button } from 'antd'
import dayjs from 'dayjs'
import { Token, JSBI, Percent } from '@uniswap/sdk'
import { useActiveWeb3React } from '../../../hooks'
import { TokenAmount } from '@uniswap/sdk'
import { VELT, SUBGRAPH, STAKING_HOPE_GOMBOC_ADDRESS, ST_HOPE } from '../../../constants'
import { useToVote } from '../../../hooks/ahp/useGomVote'
// import format from '../../../utils/format'
import { useSingleContractMultipleData } from '../../../state/multicall/hooks'
import { useGomConContract, useGomFeeDisContract } from '../../../hooks/useContract'
import TransactionConfirmationModal, { TransactionErrorContent } from '../../TransactionConfirmationModal'
import { useTokenBalance } from '../../../state/wallet/hooks'
import { postQuery } from '../../../utils/graph'
import { useTokenPrice } from '../../../hooks/liquidity/useBasePairs'
import { toUsdPrice } from 'hooks/ahp/usePortfolio'
import moment from 'moment'

const VotedList = () => {
  const gomConContract = useGomConContract()
  const gomFeeDisContract = useGomFeeDisContract()
  const { account, chainId } = useActiveWeb3React()
  const [searchValue, setSearchValue] = useState('')
  const [tableData, setTableData] = useState<any>([])
  const [curTableItem, setCurTableItem] = useState<any>({})
  const addresses = useMemo(() => {
    return [STAKING_HOPE_GOMBOC_ADDRESS[chainId ?? 1]]
  }, [chainId])
  const { result: priceResult } = useTokenPrice(addresses)
  const [curToken, setCurToken] = useState<Token | undefined>(VELT[chainId ?? 1])
  const { toVote } = useToVote()
  const veltBalance = useTokenBalance(account ?? undefined, VELT[chainId ?? 1])

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm
  // txn values
  const [txHash, setTxHash] = useState<string>('')
  const [errorStatus, setErrorStatus] = useState<{ code: number; message: string } | undefined>()
  const [pendingText, setPendingText] = useState('')

  const curGomAddress = useMemo(() => {
    let res = ''
    if (curTableItem && curTableItem.gomboc && curTableItem.gomboc.id) {
      res = curTableItem.gomboc.id
    }
    return res
  }, [curTableItem])

  const toVoteCallback = useCallback(async () => {
    if (!account || !curGomAddress) return
    setCurToken(undefined)
    setShowConfirm(true)
    setAttemptingTxn(true)
    setPendingText(`Reset voting power`)
    const argAmount = 0
    toVote(curGomAddress, argAmount)
      .then((hash: any) => {
        setShowConfirm(true)
        setAttemptingTxn(false)
        hash && setTxHash(hash)
        setPendingText(``)
        setCurTableItem({})
      })
      .catch((error: any) => {
        setShowConfirm(true)
        setTxHash('')
        setPendingText(``)
        setCurTableItem({})
        setAttemptingTxn(false)
        setErrorStatus({ code: error?.code, message: error.message })
      })
  }, [account, toVote, curGomAddress])

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
        let item = ''
        let usdOfValue = ''
        if (e.result) {
          const tn = new TokenAmount(ST_HOPE[chainId ?? 1], JSBI.BigInt(Number(e.result)) ?? '0')
          item = tn.toFixed(2, { groupSeparator: ',' } ?? '0.00')
          if (priceResult && priceResult[0] && priceResult[0].price) {
            usdOfValue = toUsdPrice(tn.toFixed(2), priceResult[0].price)
          }
        }
        const addr = tableData[index]?.gomboc.id
        res[addr] = {
          value: item,
          usdOfValue: usdOfValue
        }
      })
    }
    return res
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
      lastVoteData.forEach((e: any, index) => {
        let item = false
        if (Number(e.result)) {
          const now = dayjs()
          const end = dayjs.unix(Number(e.result)).add(10, 'day')
          item = now.isBefore(end)
        }
        res[tableData[index]?.gomboc.addr] = item
      })
    }
    return res
  }, [lastVoteData, tableData])

  // function getViewAmount(value: any) {
  //   let res = ''
  //   if (value && value !== '0') {
  //     const ta = new TokenAmount(LT[chainId ?? 1], JSBI.BigInt(value))
  //     const ra = ta.multiply(JSBI.BigInt(100))
  //     if (ra.toFixed(2) && Number(ra.toFixed(2)) > 0) {
  //       res = `${ra.toFixed(2)}`
  //     }
  //   }
  //   return res
  // }

  function toReset(item: any) {
    setCurTableItem(item)
    setTxHash('')
    setErrorStatus(undefined)
    setAttemptingTxn(false)
    setShowConfirm(true)
  }

  function toVoteFn(item: any) {
    const dom = document.getElementById('votepoint')
    if (dom) {
      dom.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }

  const confirmationContent = useCallback(
    () =>
      errorStatus ? (
        <TransactionErrorContent
          errorCode={errorStatus.code}
          message={errorStatus.message}
          onDismiss={() => setShowConfirm(false)}
        />
      ) : (
        <div></div>
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [errorStatus, toVoteCallback, curTableItem]
  )

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
      title: 'veLT Voting Balance',
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
            <p>≈ {rewardsView[record.gomboc.id].value} stHOPE</p>
            <p>≈ ${rewardsView[record.gomboc.id].usdOfValue}</p>
          </>
        )
      }
    },
    {
      title: 'Vote',
      dataIndex: 'gomboc',
      render: actionNode,
      key: 'gomboc'
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
        setTableData(response.data.user.voteGombocs)
      }
    } catch (error) {
      console.log(error)
    }
  }, [account])

  function reset() {
    setSearchValue('')
  }

  useEffect(() => {
    reset()
    init()
  }, [init, account])

  useEffect(() => {
    if (!searchValue) {
      init()
      console.log(toReset)
    }
  }, [searchValue, init])

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
    </>
  )
}
// const GomList = forwardRef(GomListF)
export default VotedList
