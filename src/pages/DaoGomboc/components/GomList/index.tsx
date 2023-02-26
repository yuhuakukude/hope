import React, { useState, useEffect, useCallback, useMemo, useImperativeHandle, forwardRef } from 'react'
import './index.scss'
import { Switch, Input, Table, Button } from 'antd'
import dayjs from 'dayjs'
import { JSBI, Token, Percent } from '@uniswap/sdk'
// import { useWalletModalToggle } from '../../../../state/application/hooks'
import { ButtonPrimary } from '../../../../components/Button'
import GombocApi from '../../../../api/gomboc.api'
import { useActiveWeb3React } from '../../../../hooks'
import { TokenAmount } from '@uniswap/sdk'
import { LT, VELT } from '../../../../constants'
import { CloseIcon } from '../../../../theme/components'
// import { useToVote } from '../../../../hooks/ahp/useGomVote'
import { useToVote, conFnNameEnum } from '../../../../hooks/ahp/useGomVote'
import format from '../../../../utils/format'
import { useSingleContractMultipleData } from '../../../../state/multicall/hooks'
import { useGomConContract } from '../../../../hooks/useContract'
import TransactionConfirmationModal, {
  TransactionErrorContent
} from '../../../../components/TransactionConfirmationModal'
import { useActionPending } from '../../../../state/transactions/hooks'

interface ListProps {
  toSetSelGom: (gomboc: string) => void
}

const GomListF = ({ toSetSelGom }: ListProps, ref: any) => {
  const endDate = dayjs()
    .add(10, 'day')
    .format('YYYY-MM-DD')
  const gomConContract = useGomConContract()
  // const toggleWalletModal = useWalletModalToggle()
  const { account, chainId } = useActiveWeb3React()
  const [searchValue, setSearchValue] = useState('')
  const [isMyVote, setIsMyVote] = useState(false)
  const [tableData, setTableData] = useState<any>([])
  const [voterAddress, setVoterAddress] = useState('')
  const [curTableItem, setCurTableItem] = useState<any>({})
  const [curToken, setCurToken] = useState<Token | undefined>(VELT[chainId ?? 1])
  const { toVote } = useToVote()
  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm
  // txn values
  const [txHash, setTxHash] = useState<string>('')
  const [errorStatus, setErrorStatus] = useState<{ code: number; message: string } | undefined>()
  const [pendingText, setPendingText] = useState('')
  const { pending: isTranPending } = useActionPending(account ? `${account}-${conFnNameEnum.VoteForGombocWeights}` : '')

  const CompositionNode = (text: any) => <span>{text || '--'}</span>

  const curGomAddress = useMemo(() => {
    let res = ''
    if (curTableItem && curTableItem.gomboc) {
      res = curTableItem.gomboc
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

  function getMyVoteAmount(value: any) {
    let res = ''
    if (value && value !== '0') {
      const ta = JSBI.BigInt(value)
      const ra = new Percent(ta, JSBI.BigInt(10000))
      if (ra.toFixed(2) && Number(ra.toFixed(2)) > 0) {
        res = `${ra.toFixed(2)}`
      }
    }
    return res
  }

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
    if (item && item.gomboc) {
      toSetSelGom(item.gomboc)
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
        <div className="reset-box w-100">
          <div className="head">
            Reset To Vote
            <div className="icon-close">
              <CloseIcon onClick={() => setShowConfirm(false)} />
            </div>
          </div>
          <div className="reset-con p-x-30 p-b-30">
            <div className="flex m-t-15">
              <i className="text-primary iconfont m-r-5 font-14 m-t-5">&#xe61e;</i>
              <div>
                <p className="text-white lh15">
                  Votes are time locked for 10 days. If you vote now, no edits can be made until {endDate}
                </p>
              </div>
            </div>
            <div className="flex jc-between m-t-40">
              <span className="text-white">Target Gömböc</span>
              <div className="text-white">
                <p className="text-right">{curTableItem?.name}</p>
                <p className="text-right font-12 m-t-8">{format.addressDes(curTableItem?.gomboc)}</p>
              </div>
            </div>
            <div className="flex jc-between m-t-15 m-b-40">
              <span className="text-white">My Votes</span>
              <span className="text-white">{getViewAmount(curTableItem?.userPower)}of my voting power</span>
            </div>
            <ButtonPrimary className="hp-button-primary" onClick={toVoteCallback}>
              Reset
            </ButtonPrimary>
          </div>
        </div>
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [errorStatus, toVoteCallback, curTableItem]
  )

  const weightNode = (text: any, record: any) => {
    return (
      <>
        <p>This period: {getViewAmount(text) ? `${getViewAmount(text)} %` : '--'}</p>
        <p>Next Period: {getViewAmount(record.nextWeight) ? `${getViewAmount(record.nextWeight)} %` : '--'}</p>
      </>
    )
  }

  const votesNote = (text: any) => {
    return (
      <>
        <p> {getMyVoteAmount(text) ? `${getMyVoteAmount(text)} %` : '--'}</p>
        <p>of my voting power</p>
      </>
    )
  }

  const actionNode = (text: any, record: any, index: number) => {
    return (
      <>
        {!account ? (
          <span>--</span>
        ) : (
          <div>
            {Number(getMyVoteAmount(record.userPower)) > 0 && (
              <Button
                className="text-primary font-bold"
                disabled={isTimeDis[record.gomboc]}
                onClick={() => {
                  toReset(record)
                }}
                type="link"
              >
                Reset
              </Button>
            )}
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
      dataIndex: 'composition',
      key: 'composition'
    },
    {
      title: 'Composition',
      dataIndex: 'name',
      render: CompositionNode,
      key: 'name'
    },
    {
      title: 'Weight',
      dataIndex: 'weight',
      render: weightNode,
      sorter: (a: any, b: any) => a.weight - b.weight,
      key: 'weight'
    },
    {
      title: 'My votes',
      dataIndex: 'userPower',
      render: votesNote,
      sorter: account && isMyVote ? (a: any, b: any) => a.userPower - b.userPower : false,
      key: 'userPower'
    },
    {
      title: 'Vote',
      dataIndex: 'gomboc',
      render: actionNode,
      key: 'gomboc'
    }
  ]

  const init = useCallback(async (voter = '', token = '') => {
    try {
      const par = {
        voter: voter,
        token: token
      }
      const res = await GombocApi.getGombocsPoolsList(par)
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

  function changeSwitch(val: boolean) {
    setIsMyVote(val)
    let res = ''
    if (val && account) {
      res = account
    }
    setVoterAddress(res)
    init(res)
  }

  function changeVal(val: string) {
    setSearchValue(val)
  }

  function toSearch() {
    init(voterAddress, searchValue)
  }

  useEffect(() => {
    if (txHash && isTranPending === false) {
      setTxHash('')
      setShowConfirm(false)
      init(voterAddress, searchValue)
    }
  }, [init, txHash, isTranPending, voterAddress, searchValue])

  useImperativeHandle(ref, () => ({
    initTableData: () => {
      init(voterAddress, searchValue)
    }
  }))

  useEffect(() => {
    init()
  }, [init, account])

  useEffect(() => {
    if (!searchValue) {
      init()
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
      <div className="gom-list-box">
        <div className="flex jc-between">
          <div className="flex ai-center">
            {account && (
              <>
                <span className="text-white">My voted Only</span>
                <Switch className="m-l-10" onChange={changeSwitch} />
              </>
            )}
          </div>
          <div className="flex ai-center">
            <Input
              onChange={e => {
                changeVal(e.target.value)
              }}
              allowClear={true}
              onPressEnter={() => {
                init(voterAddress, searchValue)
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
    </>
  )
}
const GomList = forwardRef(GomListF)
export default GomList
