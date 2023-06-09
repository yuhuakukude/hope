import React, { useEffect, useCallback, useState, useMemo } from 'react'
import styled from 'styled-components'
import { AutoColumn } from '../../components/Column'
import NumericalInput from '../../components/NumericalInput'
import { useActiveWeb3React } from '../../hooks'
import { Tooltip } from 'antd'
import { useTokenBalance, useStHopeBalance } from '../../state/wallet/hooks'
import StakingApi from '../../api/staking.api'
import { Row, Col } from 'antd'
import HopeCard from '../../components/ahp/card'
import Skeleton from '../../components/Skeleton'
import {
  useStaking,
  useToStaked,
  useToWithdraw,
  useToUnStaked,
  useToClaim,
  stakingFnNameEnum
} from '../../hooks/ahp/useStaking'
import format, { formatMessage } from '../../utils/format'
import { useWalletModalToggle } from '../../state/application/hooks'
import { ButtonPrimary, ButtonOutlined } from '../../components/Button'
import { tryParseAmount } from '../../state/swap/hooks'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import ActionButton from '../../components/Button/ActionButton'
import { Token, TokenAmount } from '@uniswap/sdk'
import './index.scss'
import TransactionConfirmationModal, { TransactionErrorContent } from '../../components/TransactionConfirmationModal'
import { getPermitData, Permit, PERMIT_EXPIRATION, toDeadline } from '../../permit2/domain'
import { ethers } from 'ethers'
import { NavLink } from 'react-router-dom'
import { TransactionResponse } from '@ethersproject/providers'
import { useLocation } from 'react-router-dom'
import { toUsdPrice } from 'hooks/ahp/usePortfolio'
import { useActionPending } from '../../state/transactions/hooks'
import { usePairStakeInfo } from '../../hooks/usePairInfo'
import { useTokenPriceObject } from '../../hooks/liquidity/useBasePairs'
import {
  getHOPEToken,
  getHopeTokenAddress,
  getLTToken,
  getPermit2Address,
  getStakingHopeGaugeAddress,
  getSTHOPEToken
} from 'utils/addressHelpers'
import { useEstimate } from '../../hooks/ahp'
import { DOCS_URL } from '../../constants/config'

const PageWrapper = styled(AutoColumn)`
  max-width: 1340px;
  width: 100%;
  padding: 0 30px;
`

enum ACTION {
  STAKE,
  UNSTAKING,
  WITHDRAW,
  CLAIM
}

export default function Staking() {
  const { account, chainId, library } = useActiveWeb3React()
  const hopeToken = useMemo(() => getHOPEToken(chainId), [chainId])
  const toggleWalletModal = useWalletModalToggle()
  const isEthBalanceInsufficient = useEstimate()
  const [curType, setStakingType] = useState('stake')
  const { search } = useLocation()
  const [curToken, setCurToken] = useState<Token | undefined>(hopeToken)
  const [actionType, setActionType] = useState(ACTION.STAKE)

  // address
  const permit2Address = useMemo(() => getPermit2Address(chainId), [chainId])

  const addresses = useMemo(() => {
    return [getStakingHopeGaugeAddress(chainId) ?? '', getHopeTokenAddress(chainId) ?? '']
  }, [chainId])

  const { result: priceResult, loading: priceLoading } = useTokenPriceObject(addresses)

  const hopePrice = useMemo(() => {
    let pr = '0'
    if (getHopeTokenAddress(chainId) && priceResult) {
      pr = priceResult[`${getHopeTokenAddress(chainId)}`.toLocaleLowerCase()]
    }
    return pr
  }, [chainId, priceResult])
  const stHopePrice = useMemo(() => {
    let pr = '0'
    if (getStakingHopeGaugeAddress(chainId) && priceResult) {
      pr = priceResult[getStakingHopeGaugeAddress(chainId).toLocaleLowerCase()]
    }
    return pr
  }, [chainId, priceResult])

  const [stakePendingText, setStakePendingText] = useState('')
  const [claimPendingText, setClaimPendingText] = useState('')
  const [withdrawPendingText, setWithdrawPendingText] = useState('')

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm
  const { pending: isMintTranPending } = useActionPending(account ? `${account}-${stakingFnNameEnum.Mint}` : '')

  // txn values
  const [txHash, setTxHash] = useState<string>('')

  const [errorStatus, setErrorStatus] = useState<{ code: number; message: string } | undefined>()

  const hopeBal = useTokenBalance(account ?? undefined, hopeToken)
  const stHopeBalance = useStHopeBalance()
  const [apyVal, setApyVal] = useState('0')
  const [apyLoading, setApyLoading] = useState(false)
  const [amount, setAmount] = useState('')

  const inputAmount = tryParseAmount(amount, hopeToken) as TokenAmount | undefined
  const {
    stakedVal,
    lpTotalSupply,
    unstakedVal,
    claRewards,
    unstakingVal,
    gomRelativeWeigh,
    lpTotalSupplyLoading,
    gomRelativeWeighLoading,
    claRewardsLoading,
    unstakedValLoading,
    unstakingValLoading
  } = useStaking()
  const { toStaked } = useToStaked()
  const { toUnStaked } = useToUnStaked()
  const { toWithdraw } = useToWithdraw()
  const { toClaim } = useToClaim()
  const [approvalState, approveCallback] = useApproveCallback(inputAmount, permit2Address)
  const stakingAddr = useMemo(() => {
    return `${getStakingHopeGaugeAddress(chainId)}`.toLocaleLowerCase()
  }, [chainId])
  const { currentBoots, futureBoots, currentBootsLoading, futureBootsLoading } = usePairStakeInfo(stakingAddr)

  const stakeInputError = useMemo(() => {
    if (hopeBal && inputAmount && hopeBal?.lessThan(inputAmount)) {
      return 'Insufficient HOPE'
    }
    return undefined
  }, [hopeBal, inputAmount])

  const unstakeInputError = useMemo(() => {
    if (stakedVal && inputAmount && stakedVal?.lessThan(inputAmount)) {
      return 'Insufficient Balance'
    }
    return undefined
  }, [stakedVal, inputAmount])

  const relWeight = useMemo(() => {
    const res = '0'
    if (gomRelativeWeigh) {
      return gomRelativeWeigh.toFixed(4)
    }
    return res
  }, [gomRelativeWeigh])

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

  const [approvePendingText, setApprovePendingText] = useState('')
  const onApprove = useCallback(() => {
    setActionType(ACTION.STAKE)
    setCurToken(undefined)
    onTxStart()
    setApprovePendingText(`Approving ${hopeToken.symbol}`)
    approveCallback()
      .then((response: TransactionResponse | undefined) => {
        setApprovePendingText('')
        onTxSubmitted(response?.hash)
      })
      .catch(error => {
        setApprovePendingText('')
        onTxError(error)
      })
  }, [approveCallback, hopeToken, onTxError, onTxStart, onTxSubmitted])

  const stakingCallback = useCallback(async () => {
    if (!account || !inputAmount || !library || !chainId) return
    setCurToken(getSTHOPEToken(chainId))
    onTxStart()
    setActionType(ACTION.STAKE)
    const deadline = toDeadline(PERMIT_EXPIRATION)
    const nonce = ethers.utils.randomBytes(32)

    const permit: Permit = {
      permitted: {
        token: hopeToken.address,
        amount: inputAmount.raw.toString()
      },
      nonce: nonce,
      spender: getStakingHopeGaugeAddress(chainId),
      deadline
    }

    const { domain, types, values } = getPermitData(permit, getPermit2Address(chainId), chainId)
    // setStakePendingText(`Approve HOPE`)
    setStakePendingText(`Stake ${inputAmount.toFixed(2)} HOPE`)
    library
      .getSigner(account)
      ._signTypedData(domain, types, values)
      .then(signature => {
        setTimeout(() => {
          toStaked(inputAmount, nonce, deadline, signature)
            .then(hash => {
              setAmount('')
              setStakePendingText('')
              onTxSubmitted(hash)
            })
            .catch((error: any) => {
              setStakePendingText('')
              onTxError(error)
              throw error
            })
        }, 120000)
      })
      .catch(error => {
        setStakePendingText('')
        onTxError(error)
      })
  }, [account, inputAmount, library, chainId, hopeToken, onTxStart, toStaked, onTxSubmitted, onTxError])

  const unStakingCallback = useCallback(async () => {
    if (!amount || !account || !inputAmount) return
    setCurToken(undefined)
    onTxStart()
    setActionType(ACTION.UNSTAKING)
    setStakePendingText(`Unstake ${inputAmount.toFixed(2)} stHOPE`)
    toUnStaked(inputAmount)
      .then(hash => {
        setStakePendingText('')
        onTxSubmitted(hash)
        setAmount('')
      })
      .catch((err: any) => {
        setStakePendingText('')
        onTxError(err)
      })
  }, [amount, account, inputAmount, onTxStart, toUnStaked, onTxSubmitted, onTxError])

  const claimCallback = useCallback(async () => {
    if (!account) return
    setCurToken(getLTToken(chainId))
    onTxStart()
    setClaimPendingText(`Claim LT`)
    setActionType(ACTION.CLAIM)
    toClaim(getStakingHopeGaugeAddress(chainId), claRewards)
      .then(hash => {
        setClaimPendingText('')
        onTxSubmitted(hash)
      })
      .catch((error: any) => {
        setClaimPendingText('')
        onTxError(error)
      })
  }, [account, chainId, onTxError, onTxStart, onTxSubmitted, toClaim, claRewards])

  const toWithdrawCallback = useCallback(async () => {
    if (!account) return
    setCurToken(hopeToken)
    onTxStart()
    setActionType(ACTION.WITHDRAW)
    setWithdrawPendingText('Withdraw')
    toWithdraw()
      .then(hash => {
        setWithdrawPendingText('')
        onTxSubmitted(hash)
      })
      .catch((error: any) => {
        setWithdrawPendingText('')
        onTxError(error)
      })
  }, [account, hopeToken, onTxError, onTxStart, onTxSubmitted, toWithdraw])

  function toMax() {
    const balance = curType === 'stake' ? hopeBal?.toFixed(2) : stakedVal?.toFixed(2)
    const resAmount = balance?.toString().replace(/(?:\.0*|(\.\d+?)0+)$/, '$1') || '0'
    setAmount(resAmount)
  }

  async function initApy() {
    try {
      setApyLoading(true)
      const res = await StakingApi.getApy()
      if (res && res.result) {
        setApyVal(res.result)
      }
      setApyLoading(false)
    } catch (error) {
      console.log(error)
      setApyLoading(false)
    }
  }

  function changeStake(type: string) {
    setAmount('')
    setStakingType(type)
  }

  function changeAmount(val: any) {
    setAmount(val)
  }

  const init = useCallback(async () => {
    await initApy()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    init()
  }, [init])

  useEffect(() => {
    if (account) {
      setAmount('')
    }
  }, [account])

  useEffect(() => {
    if (search) {
      setStakingType('unstake')
    }
  }, [search])

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

  return (
    <>
      <PageWrapper>
        <TransactionConfirmationModal
          isOpen={showConfirm}
          onDismiss={() => setShowConfirm(false)}
          attemptingTxn={attemptingTxn}
          hash={txHash}
          content={confirmationContent}
          pendingText={
            actionType === ACTION.STAKE || actionType === ACTION.UNSTAKING
              ? stakePendingText
              : actionType === ACTION.WITHDRAW
              ? withdrawPendingText
              : claimPendingText
          }
          currencyToAdd={curToken}
        />
        <div className="staking-page">
          <div className="staking-head">
            <Row gutter={30}>
              <Col className="gutter-row" span={14}>
                <div className="flex ai-center">
                  <div>
                    <h3 className="text-white font-28 font-bolder">Stake HOPE</h3>
                    <p className="text-white font-nor m-t-10">
                      Get staking rewards, and use stHOPE across the ecosystem.
                      <a
                        href={DOCS_URL['HopeToken2']}
                        className="text-primary m-l-15 learn-more"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Learn more
                        <i className="iconfont m-l-5 font-14 m-t-2">&#xe619;</i>
                      </a>
                    </p>
                  </div>
                </div>
              </Col>
              <Col className="gutter-row" span={10}>
                <div className="flex ai-center p-l-60">
                  <div className="flex ai-center">
                    <div className="apy-box">
                      <div className="text-white font-nor flex ai-center">
                        APY
                        <Tooltip
                          className="m-l-5"
                          overlayClassName="tips-question"
                          title="The shown APY is calculated based on the current gauge weight and token price. "
                        >
                          <i className="iconfont font-16 cursor-select tips-circle">&#xe620;</i>
                        </Tooltip>
                      </div>
                      <Skeleton loading={apyLoading} width={80} height={28} mt={10}>
                        <h3 className="text-success font-28 font-bold m-t-10">{format.rate(apyVal)}</h3>
                      </Skeleton>
                    </div>
                    <div className="m-l-30">
                      <div className="text-white font-nor flex ai-center">Total Staked</div>
                      <Skeleton loading={lpTotalSupplyLoading} width={150} height={28} mt={10}>
                        <h3 className="text-white font-28 font-bold m-t-10">
                          {lpTotalSupply?.toFixed(2, { groupSeparator: ',' }).toString() || '--'}
                        </h3>
                      </Skeleton>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
          <Row className="m-t-30  font-nor" gutter={30}>
            <Col className="gutter-row" span={14}>
              <div className={['staking-tab', curType === 'unstake' ? 'isActive' : ''].join(' ')}>
                <div className="head flex">
                  <div
                    onClick={() => {
                      setAmount('')
                      changeStake('stake')
                    }}
                    className={curType === 'stake' ? `head-item tab-stake flex-1 active` : 'head-item tab-stake flex-1'}
                  >
                    Stake
                  </div>
                  <div
                    onClick={() => {
                      setAmount('')
                      changeStake('unstake')
                    }}
                    className={curType === 'unstake' ? `head-item flex-1 active` : 'head-item flex-1'}
                  >
                    Unstake
                  </div>
                </div>
                <div className="tab-con p-30">
                  <div className="flex jc-between">
                    <span className="text-normal">
                      {curType === 'stake' ? 'Stake' : 'Unstake (The process takes 28 days)'}
                    </span>
                    <Skeleton
                      loading={
                        curType === 'stake' ? hopeBal === undefined && !!account : stakedVal === undefined && !!account
                      }
                      width={100}
                    >
                      <div className="text-normal font-nor">
                        Available:{' '}
                        {curType === 'stake'
                          ? `${hopeBal?.toFixed(2, { groupSeparator: ',' }).toString() || '--'} HOPE`
                          : `${stakedVal?.toFixed(2, { groupSeparator: ',' }).toString() || '--'} stHOPE`}
                        <span onClick={() => toMax()} className="input-max cursor-select">
                          Max
                        </span>
                      </div>
                    </Skeleton>
                  </div>
                  <div className="hp-amount-box">
                    <NumericalInput
                      className={[
                        'hp-amount',
                        'm-t-10',
                        curType === 'stake' ? stakeInputError && 'error' : unstakeInputError && 'error'
                      ].join(' ')}
                      value={amount}
                      decimals={2}
                      align={'right'}
                      onUserInput={val => {
                        changeAmount(val)
                      }}
                    />
                    <div className="coin-box flex ai-center cursor-select">
                      <div className={curType === 'stake' ? 'hope-icon' : 'sthope-icon'}></div>
                      <div className="currency font-nor text-medium m-l-12">
                        {curType === 'stake' ? 'HOPE' : 'stHOPE'}
                      </div>
                    </div>
                  </div>
                  <div className="flex jc-between m-t-30">
                    <span className="text-white">You'll Receive </span>
                    <span className="text-white">
                      {amount || '--'} {curType !== 'stake' ? 'HOPE' : 'stHOPE'}
                    </span>
                  </div>
                  <div className="action-box m-t-40">
                    {!account ? (
                      <ButtonPrimary className="hp-button-primary" onClick={toggleWalletModal}>
                        Connect Wallet
                      </ButtonPrimary>
                    ) : curType === 'stake' ? (
                      <div className="flex">
                        {(approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING) && (
                          <div className="m-r-15" style={{ whiteSpace: 'nowrap', minWidth: '40%' }}>
                            <ActionButton
                              pendingText={approvePendingText}
                              actionText={`Approve ${hopeToken.symbol}`}
                              pending={!!approvePendingText || approvalState === ApprovalState.PENDING}
                              onAction={onApprove}
                            />
                          </div>
                        )}
                        <ActionButton
                          error={stakeInputError}
                          pendingText="Confirm in your wallet"
                          pending={!!stakePendingText && actionType === ACTION.STAKE}
                          disableAction={
                            !!approvePendingText ||
                            approvalState === ApprovalState.NOT_APPROVED ||
                            approvalState === ApprovalState.PENDING ||
                            !inputAmount ||
                            !hopeBal
                          }
                          actionText={
                            stakeInputError ? stakeInputError : inputAmount ? 'Stake HOPE Get stHOPE' : 'Enter Amount'
                          }
                          onAction={stakingCallback}
                        />
                      </div>
                    ) : (
                      <ActionButton
                        error={unstakeInputError}
                        pendingText={'Confirm in your wallet'}
                        pending={!!stakePendingText && actionType === ACTION.UNSTAKING}
                        disableAction={!inputAmount || !stakedVal}
                        actionText={
                          unstakeInputError ? unstakeInputError : !inputAmount ? 'Enter amount' : 'Commit to unstake'
                        }
                        onAction={unStakingCallback}
                      />
                    )}
                  </div>
                  <div className="staking-tip">
                    {account && isEthBalanceInsufficient && (
                      <div className="flex m-t-15">
                        <i className="text-primary iconfont m-r-5 font-14 m-t-5">&#xe62b;</i>
                        <div>
                          <p className="text-white lh15">
                            Your wallet balance is below 0.001 ETH. The approve action require small transaction fees,
                            so you may have deposit additional funds to complete them.
                          </p>
                        </div>
                      </div>
                    )}

                    {curType === 'unstake' && (
                      <div className="flex m-t-20">
                        <i className="text-primary iconfont m-t-5 m-r-5 font-14">&#xe62b;</i>
                        <div>
                          <p className="text-white lh15">
                            The unstaking process takes 28 days, and you can withdraw the unstaked HOPE afterward.
                          </p>
                          {/* <p className="text-white lh15 m-t-5">
                            Note that you do not receive the $LT bonus when you confirm your submission. You can also
                            try{' '}
                            <NavLink to={'/swap/exchange'}>
                              <span className="text-primary">HopeSwap</span>{' '}
                            </NavLink>
                            to convert $stHOPE to $HOPE or other assets quickly.
                          </p> */}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Col>
            <Col className="gutter-row" span={10}>
              <div>
                <HopeCard title={'My Assets'}>
                  <div className="card-top p-30">
                    <div className="flex jc-between m-b-20">
                      <div className="coin-box flex ai-center">
                        <div className="lt-icon"></div>
                        <div className="currency font-nor text-medium m-l-12">LT Rewards</div>
                      </div>
                      <div className="flex ai-center">
                        <NavLink to={'/dao/locker'}>
                          <span className="text-primary"> Boost </span>
                        </NavLink>
                        <span className="text-normal m-l-5"> your yield up to 2.5x</span>
                      </div>
                    </div>
                    <div className="flex jc-between m-b-20 font-nor">
                      <span className="text-normal">Gauge Relative Weight</span>
                      <Skeleton loading={gomRelativeWeighLoading} width={50}>
                        <span className="text-white text-medium">{format.rate(relWeight)}</span>
                      </Skeleton>
                    </div>
                    <div className="flex jc-between m-b-20 font-nor">
                      <span className="text-normal">My Current Boost</span>
                      <Skeleton loading={currentBootsLoading} width={50}>
                        <span className="text-white text-medium">{currentBoots ? currentBoots.toFixed(2) : '--'}x</span>
                      </Skeleton>
                    </div>
                    <div className="flex jc-between m-b-20 font-nor">
                      <span className="text-normal">
                        My Next Boost
                        <Tooltip
                          className="m-l-5"
                          overlayClassName="tips-question"
                          title="When your veLT holding changes, the values of the Current Boost and Next Boost may be different. To ensure that the Next Boost takes effect, the user needs to actively update the value."
                        >
                          <i className="iconfont font-16 cursor-select tips-circle">&#xe620;</i>
                        </Tooltip>
                      </span>
                      <Skeleton loading={futureBootsLoading} width={50}>
                        <span className="text-white text-medium">{futureBoots ? futureBoots.toFixed(2) : '--'}x</span>
                      </Skeleton>
                    </div>
                    <div className="flex jc-between ai-center m-b-20 font-nor" style={{ height: '23px' }}>
                      <span className="text-normal">Claimable Rewards</span>
                      <Skeleton loading={claRewardsLoading} width={50}>
                        <div className="flex ai-center">
                          <span className="text-white text-medium">
                            {claRewards?.toFixed(2, { groupSeparator: ',' }).toString() || '--'}
                          </span>
                          {account && claRewards && Number(claRewards.toFixed(2)) > 0 && (
                            <ButtonOutlined
                              disabled={isMintTranPending}
                              className="staking-outline m-l-10"
                              onClick={claimCallback}
                            >
                              Claim
                            </ButtonOutlined>
                          )}
                        </div>
                      </Skeleton>
                    </div>
                    <div
                      className="flex ai-center"
                      style={{
                        height:
                          account && currentBoots && futureBoots && currentBoots.toFixed(2) !== futureBoots.toFixed(2)
                            ? '24px'
                            : 0,
                        transition: 'height 0.3s',
                        overflow: 'hidden'
                      }}
                    >
                      <i className="text-primary iconfont m-r-5 font-14">&#xe62b;</i>
                      <p className="text-normal lh15">Claim your rewards to apply your next boost</p>
                    </div>
                  </div>
                  <div className="card-bot p-30">
                    <div className="flex jc-between m-b-20">
                      <div className="coin-box flex ai-center">
                        <div className="hope-icon"></div>
                        <div className="currency font-nor text-medium m-l-12">HOPE</div>
                      </div>
                      <Skeleton loading={(hopeBal === undefined || priceLoading) && !!account} width={80}>
                        <span className="text-normal text-medium">
                          ≈ ${toUsdPrice(hopeBal?.toFixed(2), hopePrice) || '--'}
                        </span>
                      </Skeleton>
                    </div>
                    <div className="flex jc-between m-b-20">
                      <span className="text-white">Available</span>
                      <Skeleton loading={hopeBal === undefined && !!account} width={50}>
                        <span className="text-white text-medium">
                          {hopeBal?.toFixed(2, { groupSeparator: ',' } ?? '-') || '--'}
                        </span>
                      </Skeleton>
                    </div>
                    <div className="flex jc-between">
                      <span className="text-white">Withdrawable</span>
                      <Skeleton loading={unstakedValLoading} width={50}>
                        <div className="flex ai-center">
                          <span className="text-white text-medium">
                            {unstakedVal?.toFixed(2, { groupSeparator: ',' }).toString() || '--'}
                          </span>
                          {account && unstakedVal && Number(unstakedVal.toFixed(2)) > 0 && (
                            <ButtonOutlined className="staking-outline m-l-10" onClick={toWithdrawCallback}>
                              Withdaw
                            </ButtonOutlined>
                          )}
                        </div>
                      </Skeleton>
                    </div>
                    <div className="card-line m-y-30"></div>
                    <div className="flex jc-between m-b-20">
                      <div className="coin-box flex ai-center">
                        <div className="sthope-icon"></div>
                        <div className="currency font-nor text-medium m-l-12">stHOPE</div>
                      </div>
                      <Skeleton loading={(stakedVal === undefined || priceLoading) && !!account} width={80}>
                        <span className="text-normal text-medium">
                          ≈ ${toUsdPrice(stHopeBalance?.toFixed(2), stHopePrice) || '--'}
                        </span>
                      </Skeleton>
                    </div>
                    <div className="flex jc-between m-b-20">
                      <span className="text-white">Available</span>
                      <Skeleton loading={stakedVal === undefined && !!account} width={50}>
                        <span className="text-white text-medium">
                          {stakedVal?.toFixed(2, { groupSeparator: ',' }).toString() || '--'}
                        </span>
                      </Skeleton>
                    </div>
                    <div className="flex jc-between">
                      <span className="text-white">Unstaking</span>
                      <Skeleton loading={unstakingValLoading} width={50}>
                        <span className="text-white text-medium">
                          {unstakingVal?.toFixed(2, { groupSeparator: ',' }).toString() || '--'}
                        </span>
                      </Skeleton>
                    </div>
                  </div>
                </HopeCard>
              </div>
            </Col>
          </Row>
        </div>
      </PageWrapper>
    </>
  )
}
