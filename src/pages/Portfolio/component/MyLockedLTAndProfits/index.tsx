import Button from 'components/antd/Button'
import Tips from 'components/Tips'
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import Card from '../Card'
import FeesWithdraw from '../../../../components/ahp/FeesWithdraw'
import { useLocker } from '../../../../hooks/ahp/useLocker'
import { usePortfolio, toUsdPrice } from '../../../../hooks/ahp/usePortfolio'
import format, { formatMessage } from '../../../../utils/format'
import { useActiveWeb3React } from '../../../../hooks'
import { useTokenBalance } from '../../../../state/wallet/hooks'
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
import { getStakingHopeGaugeAddress, getSTHOPEToken, getVELTToken } from 'utils/addressHelpers'
import { Skeleton2 } from 'components/Skeleton'

export default function MyLockedLTAndProfits({ getAllVoting }: { getAllVoting: (stHope: string, lt: string) => void }) {
  const { account, chainId } = useActiveWeb3React()
  const { lockerRes, veltTotalAmount, lockerResLoading } = useLocker()
  const { claimableFees } = usePortfolio()
  const veltBalance = useTokenBalance(account ?? undefined, getVELTToken(chainId))
  const [curWithType, setCurWithType] = useState<string>('all')
  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm

  // txn values
  const [txHash, setTxHash] = useState<string>('')
  const [errorStatus, setErrorStatus] = useState<{ code: number; message: string } | undefined>()
  const [claimPendingText, setClaimPendingText] = useState('')
  const [curToken, setCurToken] = useState<Token | undefined>(getSTHOPEToken(chainId))

  const { toFeeClaim } = useFeeClaim()
  const { toGomFeeManyClaim } = useGomFeeManyClaim()

  const [unUseRateVal, setUnUseRateVal] = useState<string>('')
  const [votingFee, setVotingFee] = useState({ stHope: '0.00', toUsd: '0.00' })
  const [allData, setAllData] = useState<any[]>([])
  const addresses = useMemo(() => [getStakingHopeGaugeAddress(chainId) ?? ''], [chainId])
  const { result: priceResult } = useTokenPriceObject(addresses)
  const stHopePrice = useMemo(() => {
    let pr = '0'
    const stakingAddress = getStakingHopeGaugeAddress(chainId)
    if (stakingAddress && priceResult) {
      pr = priceResult[stakingAddress.toLocaleLowerCase()]
    }
    return pr
  }, [chainId, priceResult])
  useEffect(() => {
    if (veltTotalAmount && veltBalance && veltTotalAmount.toFixed(2) && Number(veltTotalAmount.toFixed(2)) > 0) {
      const ra = new Percent(veltBalance?.raw, veltTotalAmount?.raw)
      if (ra.toFixed(2) && Number(ra.toFixed(2)) > 0) {
        setUnUseRateVal(ra.toFixed(2))
      }
    }
  }, [veltTotalAmount, veltBalance, account])

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
    setErrorStatus({ code: error?.code, message: formatMessage(error) ?? error.message })
  }, [])

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

  const feeClaimCallback = useCallback(
    async (amount: string) => {
      if (!account) return
      setCurToken(getSTHOPEToken(chainId))
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
      setCurToken(getSTHOPEToken(chainId))
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
      <Card title="My Locked LT & DAO Rewards">
        {lockerRes?.amount || lockerResLoading ? (
          <>
            <div className="my-locked-lt-content">
              <div className="my-locked-lt-row">
                <div className="my-locked-lt-col">
                  <div className="my-locked-lt-title">Total LT Locked</div>
                  <div className="my-locked-lt-desc">
                    <span className="my-locked-lt-value text-medium">
                      <Skeleton2 loading={lockerResLoading}>
                        ≈ {lockerRes?.amount ? lockerRes?.amount.toFixed(2, { groupSeparator: ',' } ?? '0.00') : '0.00'}
                      </Skeleton2>
                    </span>
                    <span className="my-locked-lt-value2">
                      <Skeleton2 loading={lockerResLoading}>
                        Locked Until: {format.formatUTCDate(Number(`${lockerRes?.end}`), 'YYYY-MM-DD')}
                      </Skeleton2>
                    </span>
                  </div>
                </div>
                <div className="my-locked-lt-col">
                  <div className="my-locked-lt-title flex ai-center jc-between">
                    <span>Current Voting Power</span>
                    <NavLink to={'/dao/locker'}>
                      <Button className="my-locked-lt-button" type="ghost">
                        Increase voting power
                      </Button>
                    </NavLink>
                  </div>
                  <div className="my-locked-lt-desc">
                    <span className="my-locked-lt-value text-medium">
                      <Skeleton2 loading={lockerResLoading}>
                        ≈ {veltBalance?.toFixed(2, { groupSeparator: ',' } ?? '0.00', 0) || '0.00'} veLT
                      </Skeleton2>
                    </span>
                    <span className="my-locked-lt-value2">
                      <Skeleton2 loading={lockerResLoading}>{unUseRateVal || '0.00'}% of Total</Skeleton2>
                    </span>
                  </div>
                </div>
              </div>
              <div className="my-locked-lt-row2">
                <div className="my-locked-lt-col">
                  <div style={{ height: '20px' }} className="my-locked-lt-title flex ai-center jc-between">
                    <div>
                      Claimable Revenue Shares{' '}
                      <Tips title="25% of the platform's revenue will be distributed proportionally among all veLT holders."></Tips>
                    </div>
                    <div>
                      {claimableFees && Number(claimableFees.toFixed(2)) > 0 && (
                        <Button
                          onClick={() => {
                            withdrawFn('others')
                          }}
                          className={[
                            'my-locked-lt-button',
                            !(claimableFees && Number(claimableFees.toFixed(2)) > 0) ? 'disabled' : ''
                          ].join(' ')}
                          type="ghost"
                        >
                          Claim All
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="my-locked-lt-desc">
                    <span className="my-locked-lt-value text-medium">
                      <Skeleton2 loading={lockerResLoading}>
                        ≈ {claimableFees?.toFixed(2, { groupSeparator: ',' } ?? '0.00') || '0.00'} stHOPE
                      </Skeleton2>
                    </span>
                    <span className="my-locked-lt-value2">
                      <Skeleton2 loading={lockerResLoading}>
                        ≈ ${toUsdPrice(claimableFees?.toFixed(2), stHopePrice) || '--'}
                      </Skeleton2>
                    </span>
                  </div>
                </div>
                <div className="my-locked-lt-col">
                  <div style={{ height: '20px' }} className="my-locked-lt-title flex ai-center jc-between">
                    <div>
                      Claiming Voting Rewards{' '}
                      <Tips title="An additional 25% of the platform's revenue will be distributed proportionally among all Gauge voters."></Tips>
                    </div>
                    {claimableFees && Number(votingFee.stHope) > 0 && (
                      <Button
                        onClick={() => {
                          withdrawFn('all')
                        }}
                        className={[
                          'my-locked-lt-button',
                          !(claimableFees && Number(votingFee.stHope) > 0) ? 'disabled' : ''
                        ].join(' ')}
                        type="ghost"
                      >
                        Claim All
                      </Button>
                    )}
                  </div>
                  <div className="my-locked-lt-desc">
                    <span className="my-locked-lt-value text-medium">
                      <Skeleton2 loading={lockerResLoading}>≈ {votingFee.stHope} stHOPE</Skeleton2>
                    </span>
                    <span className="my-locked-lt-value2">
                      <Skeleton2 loading={lockerResLoading}>≈ ${votingFee.toUsd}</Skeleton2>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <VotedList isShowAll={true} setAllData={setAllData} setVotingFee={setVotingFee}></VotedList>
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
                href={DOCS_URL['LightToken2']}
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
