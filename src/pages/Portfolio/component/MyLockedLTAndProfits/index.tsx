import Button from 'components/antd/Button'
import Tips from 'components/Tips'
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import Card from '../Card'
import FeesWithdraw from '../../../../components/ahp/FeesWithdraw'
import { useLocker } from '../../../../hooks/ahp/useLocker'
import { usePortfolio, toUsdPrice } from '../../../../hooks/ahp/usePortfolio'
import format from '../../../../utils/format'
import { useActiveWeb3React } from '../../../../hooks'
import { useTokenBalance } from '../../../../state/wallet/hooks'
import { VELT, ST_HOPE, STAKING_HOPE_GOMBOC_ADDRESS } from '../../../../constants'
import { Percent, Token } from '@uniswap/sdk'
import VotedList from '../../../../components/ahp/VotedList'
import { NavLink, Link } from 'react-router-dom'
import { Decimal } from 'decimal.js'
import { useFeeClaim, useGomFeeManyClaim } from '../../../../hooks/ahp/usePortfolio'
import TransactionConfirmationModal, {
  TransactionErrorContent
} from '../../../../components/TransactionConfirmationModal'
import './index.scss'
import { ButtonPrimary } from '../../../../components/Button'
import { useTokenPriceObject } from '../../../../hooks/liquidity/useBasePairs'
import { DOCS_URL } from 'constants/config'

export default function MyLockedLTAndProfits({ getAllVoting }: { getAllVoting: (stHope: string, lt: string) => void }) {
  const { account, chainId } = useActiveWeb3React()
  const { lockerRes, veltTotalAmounnt } = useLocker()
  const { claimableFees } = usePortfolio()
  const veltBalance = useTokenBalance(account ?? undefined, VELT[chainId ?? 1])
  const [curWithType, setCurWithType] = useState<string>('all')
  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm

  // txn values
  const [txHash, setTxHash] = useState<string>('')
  const [errorStatus, setErrorStatus] = useState<{ code: number; message: string } | undefined>()
  const [claimPendingText, setClaimPendingText] = useState('')
  const [curToken, setCurToken] = useState<Token | undefined>(ST_HOPE[chainId ?? 1])

  const { toFeeClaim } = useFeeClaim()
  const { toGomFeeManyClaim } = useGomFeeManyClaim()

  const [unUseRateVal, setUnUseRateVal] = useState<string>('')
  const [votingFee, setVotingFee] = useState<any>({ stHope: '0.00', toUsd: '0.00' })
  const [allData, setAllData] = useState([])
  const addresses = useMemo(() => {
    return [STAKING_HOPE_GOMBOC_ADDRESS[chainId ?? 1] ?? '']
  }, [chainId])
  const { result: priceResult } = useTokenPriceObject(addresses)
  const stHopePrice = useMemo(() => {
    let pr = '0'
    if (STAKING_HOPE_GOMBOC_ADDRESS[chainId ?? 1] && priceResult) {
      pr = priceResult[STAKING_HOPE_GOMBOC_ADDRESS[chainId ?? 1].toLocaleLowerCase()]
    }
    return pr
  }, [chainId, priceResult])
  useEffect(() => {
    if (veltTotalAmounnt && veltBalance && veltTotalAmounnt.toFixed(2) && Number(veltTotalAmounnt.toFixed(2)) > 0) {
      const ra = new Percent(veltBalance?.raw, veltTotalAmounnt?.raw)
      if (ra.toFixed(2) && Number(ra.toFixed(2)) > 0) {
        setUnUseRateVal(ra.toFixed(2))
      }
    }
  }, [veltTotalAmounnt, veltBalance, account])

  const argList = useMemo(() => {
    let res = []
    if (allData && allData.length > 0) {
      const arr: any = []
      allData.forEach((e: any) => {
        if (e && e.id) {
          arr.push(e.id)
        }
      })
      res = arr
    }
    return res
  }, [allData])

  const curItemData = useMemo(() => {
    let res = {
      value: claimableFees?.toFixed(2, { groupSeparator: ',' } ?? '0.00') || '0.00',
      usdOfValue: toUsdPrice(claimableFees?.toFixed(2), stHopePrice)
    }
    if (curWithType === 'all') {
      res = {
        value: votingFee.stHope,
        usdOfValue: votingFee.toUsd
      }
    }
    return res
  }, [curWithType, claimableFees, stHopePrice, votingFee])

  const withdrawFn = (type: string) => {
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

  const getVotingRewards = (stHope: string, toUsd: string) => {
    setVotingFee({ stHope, toUsd })
  }

  useEffect(() => {
    if (claimableFees) {
      getAllVoting(
        new Decimal(claimableFees?.toFixed(2) || 0)
          .add(new Decimal(votingFee.stHope || 0))
          .toNumber()
          .toFixed(2),
        lockerRes?.amount ? lockerRes?.amount.toFixed(2) : '0'
      )
    }
  }, [votingFee.stHope, claimableFees, getAllVoting, lockerRes])
  const getAllData = (allList: any) => {
    setAllData(allList)
  }

  const feeClaimCallback = useCallback(
    async (amount: string) => {
      if (!account) return
      setCurToken(ST_HOPE[chainId ?? 1])
      onTxStart()
      setClaimPendingText(`Fees Withdraw`)
      toFeeClaim(amount)
        .then(hash => {
          setClaimPendingText('')
          onTxSubmitted(hash)
        })
        .catch((error: any) => {
          setClaimPendingText('')
          onTxError(error)
        })
    },
    [account, chainId, onTxError, onTxStart, onTxSubmitted, toFeeClaim]
  )

  const gomFeeManyClaimCallback = useCallback(
    async (amount: string) => {
      if (!account) return
      setCurToken(ST_HOPE[chainId ?? 1])
      onTxStart()
      setClaimPendingText(`Fees Withdraw`)
      toGomFeeManyClaim(argList, amount)
        .then(hash => {
          setClaimPendingText('')
          onTxSubmitted(hash)
        })
        .catch((error: any) => {
          setClaimPendingText('')
          onTxError(error)
        })
    },
    [account, chainId, onTxError, onTxStart, onTxSubmitted, toGomFeeManyClaim, argList]
  )

  const withdrawSubmit = useCallback(() => {
    if (curWithType === 'all') {
      const aval = votingFee.stHope
      gomFeeManyClaimCallback(aval)
    } else if (curWithType === 'others') {
      const fval = claimableFees?.toFixed(2, { groupSeparator: ',' } ?? '0.00') || '0.00'
      feeClaimCallback(fval)
    }
  }, [feeClaimCallback, gomFeeManyClaimCallback, curWithType, votingFee, claimableFees])

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
            withdrawSubmit()
          }}
          onDismiss={() => setShowConfirm(false)}
          curWithType={curWithType}
          allData={allData}
          itemData={curItemData}
        />
      ),
    [withdrawSubmit, errorStatus, curWithType, allData, curItemData]
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
      <Card title="My Locked LT & Profits">
        {lockerRes?.amount ? (
          <>
            <div className="my-locked-lt-content">
              <div className="my-locked-lt-row">
                <div className="my-locked-lt-col">
                  <div className="my-locked-lt-title">Locked LT Amount</div>
                  <div className="my-locked-lt-desc">
                    <span className="my-locked-lt-value text-medium">
                      ≈ {lockerRes?.amount ? lockerRes?.amount.toFixed(2, { groupSeparator: ',' } ?? '0.00') : '0.00'}
                    </span>
                    <span className="my-locked-lt-value2">
                      Locked Until: {format.formatUTCDate(Number(`${lockerRes?.end}`), 'YYYY-MM-DD')}
                    </span>
                  </div>
                </div>
                <div className="my-locked-lt-col">
                  <div className="my-locked-lt-title">Balance in Voting Escrow</div>
                  <div className="my-locked-lt-desc">
                    <span className="my-locked-lt-value text-medium">
                      ≈ {veltBalance?.toFixed(2, { groupSeparator: ',' } ?? '0.00', 0) || '0.00'} veLT
                    </span>
                    <span className="my-locked-lt-value2">{unUseRateVal || '0.00'}% share of total</span>
                  </div>
                  <NavLink to={'/dao/locker'}>
                    <Button className="my-locked-lt-button" type="ghost">
                      Increase veLT
                    </Button>
                  </NavLink>
                </div>
              </div>
              <div className="my-locked-lt-row2">
                <div className="my-locked-lt-col">
                  <div className="my-locked-lt-title">
                    Claimable veLT Held Fees{' '}
                    <Tips title="25% of the platform fees will be distributed among all veLT holders."></Tips>
                  </div>
                  <div className="my-locked-lt-desc">
                    <span className="my-locked-lt-value text-medium">
                      ≈ {claimableFees?.toFixed(2, { groupSeparator: ',' } ?? '0.00') || '0.00'} stHOPE
                    </span>
                    <span className="my-locked-lt-value2">
                      ≈ ${toUsdPrice(claimableFees?.toFixed(2), stHopePrice) || '--'}
                    </span>
                  </div>
                  <Button
                    onClick={() => {
                      withdrawFn('others')
                    }}
                    disabled={!(claimableFees && Number(claimableFees.toFixed(2)) > 0)}
                    className={[
                      'my-locked-lt-button',
                      !(claimableFees && Number(claimableFees.toFixed(2)) > 0) ? 'disabled' : ''
                    ].join(' ')}
                    type="ghost"
                  >
                    Claim All
                  </Button>
                </div>
                <div className="my-locked-lt-col">
                  <div className="my-locked-lt-title">
                    Claimable veLT voting Fees{' '}
                    <Tips title="All users who voted using veLT as their liquidity mining gauge will participate in the distribution of an additional 25% of the platform's fee revenue."></Tips>
                  </div>
                  <div className="my-locked-lt-desc">
                    <span className="my-locked-lt-value text-medium">≈ {votingFee.stHope} stHOPE</span>
                    <span className="my-locked-lt-value2">≈ ${votingFee.toUsd}</span>
                  </div>
                  <Button
                    onClick={() => {
                      withdrawFn('all')
                    }}
                    disabled={!(claimableFees && Number(votingFee.stHope) > 0)}
                    className={[
                      'my-locked-lt-button',
                      !(claimableFees && Number(votingFee.stHope) > 0) ? 'disabled' : ''
                    ].join(' ')}
                    type="ghost"
                  >
                    Claim All
                  </Button>
                </div>
              </div>
            </div>
            <VotedList isShowAll={true} getAllData={getAllData} getVotingRewards={getVotingRewards}></VotedList>
          </>
        ) : (
          <div className="flex jc-center">
            <div>
              <p className="text-center font-nor">Lock LT to get veLT and gain more investment income</p>
              <ButtonPrimary
                padding={'19px 24px'}
                as={Link}
                to={'/dao/locker'}
                style={{ width: '400px', marginTop: '20px' }}
              >
                Get veLT
              </ButtonPrimary>
              <a
                href={DOCS_URL['LightToken']}
                target="_blank"
                rel="noopener noreferrer"
                className="text-center m-t-20 font-nor text-normal flex ai-center jc-center"
              >
                {/* Learn more Url */}
                Learn more about veLT <i className="iconfont m-l-12">&#xe619;</i>
              </a>
            </div>
          </div>
        )}
      </Card>
    </>
  )
}
