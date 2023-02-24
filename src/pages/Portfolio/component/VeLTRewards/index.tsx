import React, { useState, useCallback, useEffect, useMemo } from 'react'
import Card from '../Card'
import Detail from './Detail'
import Empty from './Empty'
import List from './List'
import TitleTips from '../TitleTips'
import { Decimal } from 'decimal.js'
import PortfolioApi, { DetailInfo } from 'api/portfolio.api'
import FeesWithdraw from '../../../../components/ahp/FeesWithdraw'
import { Token } from '@uniswap/sdk'
import { ST_HOPE, SUBGRAPH } from '../../../../constants'
import { postQuery } from '../../../../utils/graph'
import { useActiveWeb3React } from '../../../../hooks'
import TransactionConfirmationModal, {
  TransactionErrorContent
} from '../../../../components/TransactionConfirmationModal'
import { useFeeClaim, useGomFeeClaim, useGomFeeManyClaim } from '../../../../hooks/ahp/usePortfolio'
import './index.scss'
import { useDateForLastOccurence } from 'hooks/useDateForLastOccurence'
import usePrice from 'hooks/usePrice'
import { useBlockNumber } from '../../../../state/application/hooks'

export default function VeLTRewards() {
  const { account, chainId } = useActiveWeb3React()
  const blockNumber = useBlockNumber()
  const [curWithType, setCurWithType] = useState<string>('item') // item others all
  const hopePrice = usePrice()
  const [platformFees, setPlatformFees] = useState('')
  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm
  // txn values
  const [txHash, setTxHash] = useState<string>('')
  const [errorStatus, setErrorStatus] = useState<{ code: number; message: string } | undefined>()
  const [claimPendingText, setClaimPendingText] = useState('')
  const [curToken, setCurToken] = useState<Token | undefined>(ST_HOPE[chainId ?? 1])

  // argtime
  const { startTimestamp, endTimestamp } = useDateForLastOccurence()

  const { toFeeClaim } = useFeeClaim()
  const { toGomFeeClaim } = useGomFeeClaim()
  const { toGomFeeManyClaim } = useGomFeeManyClaim()

  const [tableData, setTableData] = useState<any>([])
  const [curTableItem, setCurTableItem] = useState<any>({})
  const [overviewData, setOverviewData] = useState<DetailInfo>({} as DetailInfo)

  const argList = useMemo(() => {
    let res = []
    if (tableData && tableData.length > 0) {
      const arr: any = []
      tableData.forEach((e: any) => {
        if (e && e.gomboc && e.gomboc.gombocAddress) {
          arr.push(e.gomboc.gombocAddress)
        }
      })
      res = arr
    }
    return res
  }, [tableData])

  const withdrawAllFn = () => {
    setCurWithType('all')
    setTxHash('')
    setErrorStatus(undefined)
    setAttemptingTxn(false)
    setShowConfirm(true)
  }

  const withdrawItemFn = (index: number) => {
    let type = 'others'
    if (tableData && tableData.length > 0) {
      const item = tableData[index]
      setCurTableItem(item)
      if (item.gomboc) {
        type = 'item'
      }
    }
    setCurWithType(type)
    setTxHash('')
    setErrorStatus(undefined)
    setAttemptingTxn(false)
    setShowConfirm(true)
  }

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

  const feeClaimCallback = useCallback(async () => {
    if (!account) return
    setCurToken(ST_HOPE[chainId ?? 1])
    onTxStart()
    setClaimPendingText(`Fees Withdraw`)
    toFeeClaim()
      .then(hash => {
        setClaimPendingText('')
        onTxSubmitted(hash)
      })
      .catch((error: any) => {
        setClaimPendingText('')
        onTxError(error)
      })
  }, [account, chainId, onTxError, onTxStart, onTxSubmitted, toFeeClaim])

  const gomFeeClaimCallback = useCallback(async () => {
    if (!account) return
    setCurToken(ST_HOPE[chainId ?? 1])
    onTxStart()
    setClaimPendingText(`Fees Withdraw`)
    const arg = (curTableItem.gomboc && curTableItem.gomboc.gombocAddress) || ''
    toGomFeeClaim(arg)
      .then(hash => {
        setClaimPendingText('')
        onTxSubmitted(hash)
      })
      .catch((error: any) => {
        setClaimPendingText('')
        onTxError(error)
      })
  }, [account, chainId, onTxError, onTxStart, onTxSubmitted, toGomFeeClaim, curTableItem])

  const gomFeeManyClaimCallback = useCallback(async () => {
    if (!account) return
    setCurToken(ST_HOPE[chainId ?? 1])
    onTxStart()
    setClaimPendingText(`Fees Withdraw`)
    toGomFeeManyClaim(argList)
      .then(hash => {
        setClaimPendingText('')
        onTxSubmitted(hash)
      })
      .catch((error: any) => {
        setClaimPendingText('')
        onTxError(error)
      })
  }, [account, chainId, onTxError, onTxStart, onTxSubmitted, toGomFeeManyClaim, argList])

  const initTable = useCallback(async () => {
    try {
      const res = await PortfolioApi.getRewardsList({
        startTimestamp,
        endTimestamp,
        userAddress: account
      })
      if (res.result && res.result) {
        setTableData(res.result)
      }
    } catch (error) {
      console.log(error)
    }
  }, [account, startTimestamp, endTimestamp])

  const initOverview = useCallback(async () => {
    try {
      const res = await PortfolioApi.getRewardsOverview({
        startTimestamp,
        endTimestamp,
        userAddress: account
      })
      if (res.result && res.result) {
        setOverviewData(res.result)
      }
    } catch (error) {
      console.log(error)
    }
  }, [account, startTimestamp, endTimestamp])

  const initPlatform = useCallback(async () => {
    try {
      if (endTimestamp && startTimestamp) {
        const query = `{
          lightswapDayDatas(where:{date_gte: ${startTimestamp}, date_lte: ${endTimestamp}}) {
            id
            date
            dailyVolumeUSD
            dailyVolumeETH
          }
        }`
        const res = await postQuery(SUBGRAPH, query)
        if (res && res.data && res.data.lightswapDayDatas) {
          const arr = res.data.lightswapDayDatas
          if (arr && arr.length > 0) {
            let sub = 0
            arr.forEach((e: any) => {
              if (e.dailyVolumeUSD) {
                sub = new Decimal(sub).add(new Decimal(e.dailyVolumeUSD)).toNumber()
              }
            })
            const num = sub.toFixed(2)
            if (num) {
              setPlatformFees(num)
            }
          }
        }
      }
    } catch (error) {
      console.log(error)
    }
  }, [startTimestamp, endTimestamp])

  useEffect(() => {
    if (account) {
      initTable()
      initOverview()
      initPlatform()
    }
  }, [account, blockNumber, chainId, initTable, initOverview, initPlatform])

  const withdrawSubmit = useCallback(
    (type: string) => {
      if (curWithType === 'item') {
        gomFeeClaimCallback()
      } else if (curWithType === 'others') {
        feeClaimCallback()
      } else {
        if (type === 'all') {
          gomFeeManyClaimCallback()
        } else {
          feeClaimCallback()
        }
      }
    },
    [feeClaimCallback, gomFeeClaimCallback, gomFeeManyClaimCallback, curWithType]
  )

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
          onSubmit={(type: string) => {
            withdrawSubmit(type)
          }}
          onDismiss={() => setShowConfirm(false)}
          curWithType={curWithType}
          totalFee={overviewData?.withdrawable}
          tableData={tableData}
          tableItem={curTableItem}
          hopePrice={hopePrice}
        />
      ),
    [withdrawSubmit, errorStatus, curWithType, overviewData, tableData, curTableItem, hopePrice]
  )
  return (
    <>
      <TransactionConfirmationModal
        isOpen={showConfirm}
        onDismiss={() => setShowConfirm(false)}
        attemptingTxn={attemptingTxn}
        hash={txHash}
        content={confirmationContent}
        pendingText={claimPendingText}
        currencyToAdd={curToken}
      />
      <div className="velt-rewards-wrap">
        <Card>
          <div className="velt-rewards-title">
            <TitleTips
              link=""
              title="veLT Rewards"
              desc="veLT holders will receive 25% of all agreed fee income as an reward, as well as a portion of the Gomboc
              fee income during the voting period if they participate in the weighted vote of a Gomboc."
            />
          </div>
          {JSON.stringify(overviewData) === '{}' ? (
            <Empty />
          ) : (
            <>
              <Detail
                platformFees={platformFees}
                hopePrice={hopePrice}
                overviewData={overviewData}
                withdrawAll={withdrawAllFn}
              />
              <List hopePrice={hopePrice} tableData={tableData} withdrawItem={withdrawItemFn} />
            </>
          )}
        </Card>
      </div>
    </>
  )
}
