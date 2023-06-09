import React, { useEffect, useRef, useState, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react'
import './index.scss'
import dayjs from 'dayjs'
import { Tooltip } from 'antd'
import NumericalInput from '../../../../components/NumericalInput'
import { ButtonPrimary } from '../../../../components/Button'
import { useActiveWeb3React } from '../../../../hooks'
import { useWalletModalToggle } from '../../../../state/application/hooks'
import { useTokenBalance } from '../../../../state/wallet/hooks'
import { useGomConContract } from '../../../../hooks/useContract'
import Select from 'components/antd/Select'
import { useToVote, conFnNameEnum } from '../../../../hooks/ahp/useGomVote'
import { JSBI, Percent, Token } from '@uniswap/sdk'
import { useSingleCallResult } from '../../../../state/multicall/hooks'
import ActionButton from '../../../../components/Button/ActionButton'
import { useLocation } from 'react-router-dom'
import { isAddress } from '../../../../utils'
import TransactionConfirmationModal, {
  TransactionErrorContent
} from '../../../../components/TransactionConfirmationModal'

import { useActionPending } from '../../../../state/transactions/hooks'
import { Decimal } from 'decimal.js'
import { formatMessage } from '../../../../utils/format'
import Skeleton from '../../../../components/Skeleton'

import moment from 'moment'
import format from 'utils/format'
import { useLocker } from 'hooks/ahp/useLocker'
import { getVELTToken } from 'utils/addressHelpers'
import { useHistory } from 'react-router-dom'

interface VoteProps {
  votiingData: any
  gaugeList: any
  isNoVelt: boolean
  loading?: boolean
  updateTable: () => void
}

const VoteF = ({ votiingData, gaugeList, isNoVelt, loading, updateTable }: VoteProps, ref: any) => {
  const { account, chainId } = useActiveWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const gomConContract = useGomConContract()
  const { toVote } = useToVote()
  const location = useLocation()
  const history = useHistory()
  const searchParams = new URLSearchParams(location.search)
  const veLTToken = useMemo(() => getVELTToken(chainId), [chainId])
  const [curToken, setCurToken] = useState<Token | undefined>(veLTToken)
  const veLtBal = useTokenBalance(account ?? undefined, veLTToken)
  const [voteAmount, setVoteAmount] = useState('')
  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm
  // txn values
  const [txHash, setTxHash] = useState<string>('')
  const [errorStatus, setErrorStatus] = useState<{ code: number; message: string } | undefined>()
  const [pendingText, setPendingText] = useState('')
  const { pending: isTranPending } = useActionPending(account ? `${account}-${conFnNameEnum.VoteForGaugeWeights}` : '')

  const { lockerRes } = useLocker()
  const isShowTip = useMemo(() => {
    const lockerEndDate = lockerRes?.end
    if (!lockerEndDate || lockerEndDate === '--') {
      return false
    }
    return moment(format.formatDate(Number(`${lockerEndDate}`))).diff(moment(), 'days') < 7
  }, [lockerRes])

  const { Option } = Select
  const endDate = dayjs()
    .add(10, 'day')
    .format('YYYY-MM-DD 00:00')
  const [amount, setAmount] = useState('')
  const [curGomAddress, setCurGomAddress] = useState('')
  const [endTimeData, setEndTimeData] = useState({
    d: '00',
    h: '00',
    m: '00',
    s: '00'
  })
  const timer = useRef<any>(null)
  const cd = useRef<number>(0)
  const dealData = () => {
    if (cd.current <= 0) {
      setEndTimeData({
        d: '00',
        h: '00',
        m: '00',
        s: '00'
      })
      return timer.current && clearTimeout(timer.current)
    }
    const d = parseInt(`${cd.current / (24 * 60 * 60)}`)
    const h = parseInt(`${(cd.current / (60 * 60)) % 24}`)
    const m = parseInt(`${(cd.current / 60) % 60}`)
    const s = parseInt(`${cd.current % 60}`)
    const pd = Number(d) > 9 ? `${d}` : `0${d}`
    const ph = Number(h) > 9 ? `${h}` : `0${h}`
    const pm = Number(m) > 9 ? `${m}` : `0${m}`
    const ps = Number(s) > 9 ? `${s}` : `0${s}`
    setEndTimeData({
      d: pd,
      h: ph,
      m: pm,
      s: ps
    })
    cd.current--
    timer.current = setTimeout(() => {
      dealData()
    }, 1000)
  }

  const selList = useMemo(() => {
    if (gaugeList) {
      const arr: any = []
      gaugeList.forEach((e: any) => {
        const item = {
          label: e.name,
          value: e.gauge
        }
        arr.push(item)
      })
      return arr
    } else {
      return []
    }
  }, [gaugeList])

  const lastArg = useMemo(() => {
    let res: any = [undefined]
    if (account && curGomAddress) {
      res = [account, curGomAddress]
    }
    return res
  }, [account, curGomAddress])

  useImperativeHandle(ref, () => ({
    setSel: (selGom: string) => {
      if (selList && selList.length > 0) {
        setCurGomAddress(selGom)
      }
    }
  }))

  const votePowerAmount = useSingleCallResult(gomConContract, 'voteUserPower', [account ?? undefined])
  const lastVoteData = useSingleCallResult(gomConContract, 'lastUserVote', lastArg)
  const curPower = useSingleCallResult(gomConContract, 'voteUserSlopes', lastArg)

  const curLastVote = useMemo(() => {
    let res = false
    const ld = Number(lastVoteData.result)
    if (lastVoteData && ld && curGomAddress) {
      const now = dayjs()
      const end = dayjs.unix(ld).add(10, 'day')
      res = now.isBefore(end)
    }
    return res
  }, [lastVoteData, curGomAddress])

  const hasVote = useMemo(() => {
    let res = false
    const ld = Number(lastVoteData.result)
    if (lastVoteData && ld && curGomAddress) {
      res = true
    }
    return res
  }, [lastVoteData, curGomAddress])

  const unUseRateVal = useMemo(() => {
    let res = ''
    if (votePowerAmount && (Number(votePowerAmount.result) || Number(votePowerAmount.result) === 0)) {
      const total = JSBI.BigInt(10000)
      const apo = JSBI.BigInt(Number(votePowerAmount.result))
      const unUseVal = JSBI.subtract(total, apo)
      const ra = new Percent(unUseVal, JSBI.BigInt(10000))
      if (ra.toFixed(2) && Number(ra.toFixed(2)) > 0) {
        res = ra.toFixed(2)
      }
    }
    return res
  }, [votePowerAmount])

  const subAmount = useMemo(() => {
    let sub = 0
    if (curPower.result && curPower.result.power) {
      const unNum = Number(unUseRateVal) || 0
      const cp = JSBI.BigInt(Number(curPower.result.power))
      const ra = new Percent(cp, JSBI.BigInt(10000))
      sub = new Decimal(Number(ra.toFixed(2))).add(new Decimal(unNum)).toNumber()
    }
    return sub
  }, [unUseRateVal, curPower])

  const viewSubAmount = useMemo(() => {
    let vsub = subAmount
    if (curGomAddress) {
      if (amount && subAmount) {
        const am = Number(amount) || 0
        const resn = new Decimal(Number(subAmount)).sub(new Decimal(am)).toNumber()
        if (Number(resn) >= 0) {
          vsub = resn
        }
      }
    } else {
      if (unUseRateVal) {
        vsub = Number(unUseRateVal)
      }
    }
    return vsub
  }, [amount, subAmount, unUseRateVal, curGomAddress])

  const curPowerAmount = useMemo(() => {
    let sub = 0
    if (curPower.result && curPower.result.power) {
      const cp = JSBI.BigInt(Number(curPower.result.power))
      const ra = new Percent(cp, JSBI.BigInt(10000))
      sub = Number(ra.toFixed(2))
    }
    return sub
  }, [curPower])

  const voteInputError = useMemo(() => {
    if (curLastVote) {
      return 'No voting within ten days'
    }
    if (curGomAddress && amount && Number(amount) > 100) {
      return 'Insufficient Value'
    }
    if (curGomAddress && !hasVote && amount && Number(amount) === 0) {
      return 'Insufficient Value'
    }
    if (curGomAddress && amount && Number(subAmount) < Number(amount)) {
      return 'Surplus deficiency'
    }
    return undefined
  }, [amount, curLastVote, subAmount, curGomAddress, hasVote])

  const getActionText = useMemo(() => {
    if (isNoVelt) {
      return 'need to LT locked'
    } else if (isShowTip) {
      return 'lock expires soon'
    } else if (!curGomAddress) {
      return 'Select a Gauge for Vote'
    } else if (!amount) {
      return 'Enter amount'
    } else if (voteInputError) {
      return voteInputError
    } else {
      return 'Confirm Vote'
    }
  }, [voteInputError, amount, curGomAddress, isNoVelt, isShowTip])

  const toVoteCallback = useCallback(async () => {
    if (!amount || !account) return
    setCurToken(undefined)
    setShowConfirm(true)
    setAttemptingTxn(true)
    setTxHash('')
    setPendingText(`Vote with ${amount}% voting power`)
    const argAmount = Math.floor(Number(amount) * 100)
    toVote(curGomAddress, argAmount)
      .then((hash: any) => {
        setShowConfirm(true)
        setPendingText(``)
        setAttemptingTxn(false)
        setTxHash(hash)
        setAmount('')
        setCurGomAddress('')
      })
      .catch((error: any) => {
        setTxHash('')
        setShowConfirm(true)
        setPendingText(``)
        setAttemptingTxn(false)
        setErrorStatus({ code: error?.code, message: formatMessage(error) ?? error.message })
      })
  }, [amount, curGomAddress, account, toVote])

  useEffect((): any => {
    cd.current = votiingData.votingEndSeconds
    dealData()
    return () => {
      timer.current && clearTimeout(timer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [votiingData])

  useEffect(() => {
    if (txHash && isTranPending === false) {
      setTxHash('')
      setShowConfirm(false)
      updateTable()
    }
  }, [updateTable, txHash, isTranPending])

  useEffect(() => {
    if (selList && selList.length > 0 && searchParams.get('gauge') && isAddress(searchParams.get('gauge'))) {
      setCurGomAddress(`${searchParams?.get('gauge')}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selList])

  function changeAmount(val: any) {
    setAmount(val)
    if (val && veLtBal && Number(veLtBal.toFixed(2)) > 0 && Number(val) <= 100) {
      const rate = Math.floor(Number(val) * 100)
      const bal = veLtBal.multiply(JSBI.BigInt(rate)).divide(JSBI.BigInt(10000))
      setVoteAmount(bal?.toFixed(2, { groupSeparator: ',' }, 0))
    } else {
      setVoteAmount('')
    }
  }

  useEffect((): any => {
    if (curPowerAmount && curGomAddress) {
      changeAmount(`${curPowerAmount}`)
    } else {
      changeAmount('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curGomAddress, curPowerAmount])

  function changeSel(val: string) {
    setCurGomAddress(val)
  }

  function subValueFn() {
    const newVal = new Decimal(Number(amount)).sub(new Decimal(1)).toNumber()
    if (newVal < 0) {
      changeAmount(`0`)
    } else {
      changeAmount(`${newVal}`)
    }
  }

  function addValueFn() {
    const newVal = new Decimal(Number(amount)).add(new Decimal(1)).toNumber()
    if (Number(newVal) > Number(100)) {
      changeAmount(`100`)
    } else {
      changeAmount(`${newVal}`)
    }
  }

  function toMax() {
    if (Number(subAmount) > 0 && curGomAddress && !isNoVelt) {
      changeAmount(`${subAmount}`)
    }
  }

  const confirmationContent = useCallback(
    () =>
      errorStatus && (
        <TransactionErrorContent
          errorCode={errorStatus.code}
          onDismiss={() => setShowConfirm(false)}
          message={errorStatus.message}
        />
      ),
    [errorStatus]
  )

  const goLocker = () => {
    history.push(`/dao/locker`)
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
      <div className="gom-vote-box font-nor">
        <h3 className="font-bolder text-white font-20">Vote for A Gauge</h3>
        <p className="m-t-20 text-white lh15">
          - Your vote will affect the LT rewards distribution for the next voting cycle.
        </p>
        <p className="m-t-10 text-white lh15">
          - Your voting power is fixed once you cast your vote. You can resubmit your vote later with more veLT to
          increase your voting power.
        </p>
        <p className="m-t-10 text-white lh15">
          - All votes are subjected to a 10-day cooling period. If you vote now, no new votes can be made until{' '}
          <span className="text-primary">{endDate}</span> UTC.
        </p>
        <div className="text-center text-normal m-t-20 flex jc-center ai-center">
          Voting cycle ends in:
          <Tooltip
            className="m-l-5"
            overlayClassName="tips-question"
            title="There are currently 7 days in every voting cycle."
          >
            <i className="iconfont font-14 cursor-select tips-circle">&#xe620;</i>
          </Tooltip>
        </div>
        <div className="end-time-box flex m-t-20 w-100">
          <div className="flex-1">
            <p className="text-center text-gray">Day</p>
            <div className="flex jc-center m-t-8">
              <Skeleton loading={loading || false} width={86} height={56} radius={'10px'}>
                <div className="end-item">{cd.current > 0 && endTimeData.d ? endTimeData.d : '00'}</div>
              </Skeleton>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-center text-gray">Hour</p>
            <div className="flex jc-center m-t-8">
              <Skeleton loading={loading || false} width={86} height={56} radius={'10px'}>
                <div className="end-item">{cd.current > 0 && endTimeData.h ? endTimeData.h : '00'}</div>
              </Skeleton>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-center text-gray">Min</p>
            <div className="flex jc-center m-t-8">
              <Skeleton loading={loading || false} width={86} height={56} radius={'10px'}>
                <div className="end-item">{cd.current > 0 && endTimeData.m ? endTimeData.m : '00'}</div>
              </Skeleton>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-center text-gray">Sec</p>
            <div className="flex jc-center m-t-8">
              <Skeleton loading={loading || false} width={86} height={56} radius={'10px'}>
                <div className="end-item">{cd.current > 0 && endTimeData.s ? endTimeData.s : '00'}</div>
              </Skeleton>
            </div>
          </div>
        </div>
        <div className="form-box m-t-20">
          <p className="text-normal">Select a Gauge </p>
          <Select
            value={curGomAddress ? curGomAddress : undefined}
            placeholder="Select a Gauge"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.props.children ? `${option.props.children}`.toLowerCase().indexOf(input.toLowerCase()) >= 0 : true
            }
            onChange={(val: string) => {
              changeSel(val)
            }}
            className="hp-select m-t-10"
          >
            {selList.map((data: any, index: number) => {
              return (
                <Option key={index} value={data.value}>
                  {data.label}
                </Option>
              )
            })}
          </Select>
          <div className="flex jc-between m-t-30 m-b-10">
            <span className="text-normal">Vote Weight:</span>
            {account && (
              <Skeleton loading={curPower.loading || loading || false} width={200}>
                <p>
                  Unallocated Votes : {isNoVelt ? '0.00' : `${viewSubAmount}%`}
                  <span onClick={toMax} className="text-primary m-l-5 cursor-select">
                    Max
                  </span>
                </p>
              </Skeleton>
            )}
          </div>
          <div className="hp-amount-box vote-input-con">
            <NumericalInput
              className={['hp-amount', voteInputError && 'error'].join(' ')}
              value={amount}
              decimals={2}
              onUserInput={val => {
                changeAmount(val)
              }}
            />
            <div className="vote-input-left">
              <i className={['iconfont'].join(' ')} onClick={subValueFn}>
                &#xe622;
              </i>
            </div>
            <div className="vote-input-right flex ai-center">
              <i className={['iconfont'].join(' ')} onClick={addValueFn}>
                &#xe623;
              </i>
              <span className="input-tip">% of your voting power</span>
            </div>
          </div>
          <p className="text-normal m-t-10">{voteAmount || '0.00'} to this gauge.</p>
          <div className="action-box m-t-40">
            {!account ? (
              <ButtonPrimary className="hp-button-primary" onClick={toggleWalletModal}>
                Connect Wallet
              </ButtonPrimary>
            ) : isNoVelt ? (
              <ButtonPrimary className="hp-button-primary" onClick={goLocker}>
                Get veLT to vote
              </ButtonPrimary>
            ) : (
              <ActionButton
                error={voteInputError}
                pending={!!pendingText || isTranPending}
                pendingText={'Waitting'}
                disableAction={!amount || !curGomAddress || curLastVote || isNoVelt || isShowTip}
                actionText={getActionText}
                onAction={toVoteCallback}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
const Vote = forwardRef(VoteF)
export default Vote
