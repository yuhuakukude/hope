import React, { useState, useEffect, useCallback, useMemo } from 'react'
import './index.scss'
import { Switch, Input, Table, Button } from 'antd'
import dayjs from 'dayjs'
import { JSBI, Token } from '@uniswap/sdk'
import { useWalletModalToggle } from '../../../../state/application/hooks'
import { ButtonPrimary } from '../../../../components/Button'
import GombocApi from '../../../../api/gomboc.api'
import { useActiveWeb3React } from '../../../../hooks'
import { TokenAmount } from '@uniswap/sdk'
import { LT, VELT } from '../../../../constants'
import { CloseIcon } from '../../../../theme/components'
import { useToVote } from '../../../../hooks/ahp/useGomVote'
import format from '../../../../utils/format'
import VoteModal from '../VoteModal'
import TransactionConfirmationModal, {
  TransactionErrorContent
} from '../../../../components/TransactionConfirmationModal'

interface VoteProps {
  votiingData: any
  gombocList: any
}

const GomList = ({ votiingData, gombocList }: VoteProps) => {
  const endDate = dayjs()
    .add(10, 'day')
    .format('YYYY-MM-DD')
  const toggleWalletModal = useWalletModalToggle()
  const { account, chainId } = useActiveWeb3React()
  const [searchValue, setSearchValue] = useState('')
  const [isMyVote, setIsMyVote] = useState(false)
  const [tableData, setTableData] = useState([])
  const [voterAddress, setVoterAddress] = useState('')
  const [curTableItem, setCurTableItem] = useState<any>({})
  const [voteOpen, setVoteOpen] = useState(false)
  const [curToken, setCurToken] = useState<Token | undefined>(VELT[chainId ?? 1])
  const { toVote } = useToVote()
  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm
  // txn values
  const [txHash, setTxHash] = useState<string>('')
  const [errorStatus, setErrorStatus] = useState<{ code: number; message: string } | undefined>()
  const [pendingText, setPendingText] = useState('')

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
        setPendingText(``)
        setAttemptingTxn(false)
        setTxHash(hash)
      })
      .catch((error: any) => {
        setShowConfirm(true)
        setPendingText(``)
        setAttemptingTxn(false)
        setErrorStatus({ code: error?.code, message: error.message })
      })
  }, [account, toVote, curGomAddress])

  function getViewAmount(value: any) {
    let res = ''
    if (value && value !== '0') {
      const ta = new TokenAmount(LT[chainId ?? 1], JSBI.BigInt(value))
      const ra = ta.multiply(JSBI.BigInt(100))
      if (ra.toFixed(2) && Number(ra.toFixed(2)) > 0) {
        res = `${ra.toFixed(2)} %`
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

  function toVoteFn() {
    setVoteOpen(true)
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
            $LT Rewards Claim
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
    [errorStatus, toVoteCallback, curTableItem, endDate]
  )

  const weightNode = (text: any, record: any) => {
    return (
      <>
        <p>This period: {getViewAmount(text) || '--'}</p>
        <p>Next Period: {getViewAmount(record.nextWeight) || '--'}</p>
      </>
    )
  }

  const votesNote = (text: any) => {
    return (
      <>
        <p> {getViewAmount(text) || '--'}</p>
        <p>of my voting power</p>
      </>
    )
  }

  const actionNode = (text: any, record: any) => {
    return (
      <>
        {!account ? (
          <ButtonPrimary className="hp-button-primary" onClick={toggleWalletModal}>
            Connect Wallet
          </ButtonPrimary>
        ) : (
          <div>
            <Button
              className="text-primary font-bold"
              onClick={() => {
                toReset(record)
              }}
              type="link"
            >
              Reset
            </Button>
            <Button
              className="text-primary font-bold"
              onClick={() => {
                toVoteFn()
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
      sorter: (a: any, b: any) => a.weight - b.weight,
      key: 'weight'
    },
    {
      title: 'My votes',
      dataIndex: 'userPower',
      render: votesNote,
      sorter: (a: any, b: any) => a.userPower - b.userPower,
      key: 'userPower'
    },
    {
      title: 'vote',
      dataIndex: 'gomboc',
      render: actionNode,
      key: 'gomboc'
    }
  ]

  function changeSwitch(val: boolean) {
    setIsMyVote(val)
    console.log(isMyVote)
    if (val && account) {
      setVoterAddress(account)
    } else {
      setVoterAddress('')
    }
  }

  function changeVal(val: string) {
    setSearchValue(val)
  }

  function hideVoteModal() {
    setVoteOpen(false)
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
      <VoteModal isOpen={voteOpen} onDismiss={hideVoteModal} votiingData={votiingData} gombocList={gombocList} />
    </>
  )
}

export default GomList
