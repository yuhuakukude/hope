import React, { useEffect, useCallback, useState, useMemo } from 'react'
import styled from 'styled-components'
import { AutoColumn } from '../../components/Column'
import NumericalInput from '../../components/NumericalInput'
import { useActiveWeb3React } from '../../hooks'
import { Tooltip } from 'antd'
import { useETHBalances, useTokenBalance } from '../../state/wallet/hooks'
import {
  HOPE,
  HOPE_STAKING,
  HOPE_UNSTAKING,
  LT,
  PERMIT2_ADDRESS,
  ST_HOPE,
  HOPE_TOKEN_ADDRESS,
  STAKING_HOPE_GOMBOC_ADDRESS
} from '../../constants'
import StakingApi from '../../api/staking.api'
import { Row, Col } from 'antd'
import HopeCard from '../../components/ahp/card'
import {
  useStaking,
  useToStaked,
  useToWithdraw,
  useToUnStaked,
  useToClaim,
  stakingFnNameEnum
} from '../../hooks/ahp/useStaking'
import format from '../../utils/format'
import { useWalletModalToggle } from '../../state/application/hooks'
import { ButtonPrimary, ButtonOutlined } from '../../components/Button'
import { tryParseAmount } from '../../state/swap/hooks'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import ActionButton from '../../components/Button/ActionButton'
import { CurrencyAmount, Token, TokenAmount } from '@uniswap/sdk'
import './index.scss'
import TransactionConfirmationModal, { TransactionErrorContent } from '../../components/TransactionConfirmationModal'
import { getPermitData, Permit, PERMIT_EXPIRATION, toDeadline } from '../../permit2/domain'
import { ethers } from 'ethers'
import { NavLink } from 'react-router-dom'
import { TransactionResponse } from '@ethersproject/providers'
import { useLocation } from 'react-router-dom'
import useGasPrice from '../../hooks/useGasPrice'
import JSBI from 'jsbi'
import { toUsdPrice } from 'hooks/ahp/usePortfolio'
import { useActionPending } from '../../state/transactions/hooks'
import { usePairStakeInfo } from '../../hooks/usePairInfo'
import { useTokenPriceObject } from '../../hooks/liquidity/useBasePairs'

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
  const toggleWalletModal = useWalletModalToggle()
  const gasPrice = useGasPrice()
  const [curType, setStakingType] = useState('stake')
  const { search } = useLocation()
  const [curToken, setCurToken] = useState<Token | undefined>(HOPE[chainId ?? 1])
  const [actionType, setActionType] = useState(ACTION.STAKE)

  const addresses = useMemo(() => {
    return [STAKING_HOPE_GOMBOC_ADDRESS[chainId ?? 1] ?? '', HOPE_TOKEN_ADDRESS[chainId ?? 1] ?? '']
  }, [chainId])

  const { result: priceResult } = useTokenPriceObject(addresses)

  const hopePrice = useMemo(() => {
    let pr = '0'
    if (HOPE_TOKEN_ADDRESS[chainId ?? 1] && priceResult) {
      pr = priceResult[`${HOPE_TOKEN_ADDRESS[chainId ?? 1]}`.toLocaleLowerCase()]
    }
    return pr
  }, [chainId, priceResult])
  const stHopePrice = useMemo(() => {
    let pr = '0'
    if (STAKING_HOPE_GOMBOC_ADDRESS[chainId ?? 1] && priceResult) {
      pr = priceResult[STAKING_HOPE_GOMBOC_ADDRESS[chainId ?? 1].toLocaleLowerCase()]
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

  const hopeBal = useTokenBalance(account ?? undefined, HOPE[chainId ?? 1])
  const stHopeBalance = useTokenBalance(account ?? undefined, ST_HOPE[chainId ?? 1])
  const [apyVal, setApyVal] = useState('0')
  const [amount, setAmount] = useState('')

  const inputAmount = tryParseAmount(amount, HOPE[chainId ?? 1]) as TokenAmount | undefined
  const { stakedVal, lpTotalSupply, unstakedVal, claRewards, unstakingVal, gomRelativeWeigh } = useStaking()
  const { toStaked } = useToStaked()
  const { toUnStaked } = useToUnStaked()
  const { toWithdraw } = useToWithdraw()
  const { toClaim } = useToClaim()
  const [approvalState, approveCallback] = useApproveCallback(inputAmount, PERMIT2_ADDRESS[chainId ?? 1])
  const stakingAddr = useMemo(() => {
    return `${STAKING_HOPE_GOMBOC_ADDRESS[chainId ?? 1]}`.toLocaleLowerCase()
  }, [chainId])
  const { currentBoots, futureBoots } = usePairStakeInfo(stakingAddr)
  const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']
  const gas = useMemo(() => {
    if (!gasPrice) return undefined
    return curType === 'stake'
      ? JSBI.multiply(gasPrice, JSBI.BigInt(HOPE_STAKING))
      : JSBI.multiply(gasPrice, JSBI.BigInt(HOPE_UNSTAKING))
  }, [curType, gasPrice])

  const stakeInputError = useMemo(() => {
    if (hopeBal && inputAmount && hopeBal?.lessThan(inputAmount)) {
      return 'Insufficient Hope'
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
    setErrorStatus({ code: error?.code, message: error.message })
  }, [])

  const onApprove = useCallback(() => {
    setActionType(ACTION.STAKE)
    setCurToken(undefined)
    onTxStart()
    setStakePendingText(`Approve ${HOPE[chainId ?? 1].symbol}`)
    approveCallback()
      .then((response: TransactionResponse | undefined) => {
        setStakePendingText('')
        onTxSubmitted(response?.hash)
      })
      .catch(error => {
        setStakePendingText('')
        onTxError(error)
      })
  }, [approveCallback, chainId, onTxError, onTxStart, onTxSubmitted])

  const stakingCallback = useCallback(async () => {
    if (!account || !inputAmount || !library || !chainId) return
    setCurToken(ST_HOPE[chainId ?? 1])
    onTxStart()
    setActionType(ACTION.STAKE)
    const deadline = toDeadline(PERMIT_EXPIRATION)
    const nonce = ethers.utils.randomBytes(32)

    const permit: Permit = {
      permitted: {
        token: HOPE[chainId ?? 1].address,
        amount: inputAmount.raw.toString()
      },
      nonce: nonce,
      spender: STAKING_HOPE_GOMBOC_ADDRESS[chainId ?? 1],
      deadline
    }

    const { domain, types, values } = getPermitData(permit, PERMIT2_ADDRESS[chainId ?? 1], chainId)
    setStakePendingText(`Approve HOPE`)

    library
      .getSigner(account)
      ._signTypedData(domain, types, values)
      .then(signature => {
        setStakePendingText(`Stake ${inputAmount.toFixed(2)} HOPE`)
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
      })
      .catch(error => {
        setStakePendingText('')
        onTxError(error)
      })
  }, [account, inputAmount, library, chainId, onTxStart, toStaked, onTxSubmitted, onTxError])

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
    setCurToken(LT[chainId ?? 1])
    onTxStart()
    setClaimPendingText(`claim LT`)
    setActionType(ACTION.CLAIM)
    toClaim(STAKING_HOPE_GOMBOC_ADDRESS[chainId ?? 1], claRewards)
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
    setCurToken(HOPE[chainId ?? 1])
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
  }, [account, chainId, onTxError, onTxStart, onTxSubmitted, toWithdraw])

  function toMax() {
    const balance = curType === 'stake' ? hopeBal?.toFixed(2) : stakedVal?.toFixed(2)
    const resAmount = balance?.toString().replace(/(?:\.0*|(\.\d+?)0+)$/, '$1') || '0'
    setAmount(resAmount)
  }

  async function initApy() {
    try {
      const res = await StakingApi.getApy()
      if (res && res.result) {
        setApyVal(res.result)
      }
    } catch (error) {
      console.log(error)
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
                    <h3 className="text-white font-28 font-bolder">Staking $HOPE</h3>
                    <p className="text-white font-nor m-t-10">
                      Stake your $HOPE tokens for an annual percentage yield (APY).
                      <a href="/" className="text-primary m-l-15 learn-more">
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
                          title="The APY value is calculated based on the current data, which consists of the reward tokens by hold stHOPE."
                        >
                          <i className="iconfont font-16 cursor-select tips-circle">&#xe620;</i>
                        </Tooltip>
                      </div>
                      <h3 className="text-success font-28 font-bold m-t-10">{format.rate(apyVal)}</h3>
                    </div>
                    <div className="m-l-30">
                      <p className="text-white font-nor head-total-text">Total Staked </p>
                      <h3 className="text-white font-28 font-bold m-t-10">
                        {lpTotalSupply?.toFixed(2, { groupSeparator: ',' }).toString() || '--'}
                      </h3>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
          <Row className="m-t-30" gutter={30}>
            <Col className="gutter-row" span={14}>
              <div className="staking-tab">
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
                    <span className="text-normal">{curType === 'stake' ? 'Deposit' : 'Withdraw'}</span>
                    <div className="text-normal">
                      Available:{' '}
                      {curType === 'stake'
                        ? `${hopeBal?.toFixed(2, { groupSeparator: ',' }).toString() || '--'} HOPE`
                        : `${stakedVal?.toFixed(2, { groupSeparator: ',' }).toString() || '--'} stHOPE`}
                      <span onClick={() => toMax()} className="input-max cursor-select">
                        Max
                      </span>
                    </div>
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
                      <div className="hope-icon"></div>
                      <div className="currency font-nor text-medium m-l-12">
                        {curType === 'stake' ? 'HOPE' : 'stHOPE'}
                      </div>
                    </div>
                  </div>
                  <div className="flex jc-between m-t-30">
                    <span className="text-white">Est Transaction Fee</span>
                    <span className="text-white">≈{gas ? CurrencyAmount.ether(gas).toSignificant() : '--'} ETH</span>
                  </div>
                  <div className="flex jc-between m-t-20">
                    <span className="text-white">Receive </span>
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
                      <ActionButton
                        error={stakeInputError}
                        pendingText={
                          approvalState === ApprovalState.PENDING ? 'Approving HOPE' : 'Confirm in your wallet'
                        }
                        pending={(approvalState === ApprovalState.PENDING && curType === 'stake') || !!stakePendingText}
                        disableAction={!inputAmount || !hopeBal}
                        actionText={
                          stakeInputError
                            ? stakeInputError
                            : !amount
                            ? 'Enter Amount'
                            : approvalState === ApprovalState.NOT_APPROVED
                            ? 'Approve Hope'
                            : 'Stake HOPE Get stHOPE'
                        }
                        onAction={approvalState === ApprovalState.NOT_APPROVED ? onApprove : stakingCallback}
                      />
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
                    {gas && userEthBalance && userEthBalance?.lessThan(CurrencyAmount.ether(gas)) && (
                      <div className="flex m-t-15">
                        <i className="text-primary iconfont m-r-5 font-14 m-t-5">&#xe61e;</i>
                        <div>
                          <p className="text-white lh15">
                            Your wallet balance is below 0.001 ETH. The approve action require small transaction fees,
                            so you may have deposit additional funds to complete them.
                          </p>
                        </div>
                      </div>
                    )}

                    {curType === 'unstake' && (
                      <div className="flex m-t-15">
                        <i className="text-primary iconfont m-r-5 font-14 m-t-5">&#xe61e;</i>
                        <div>
                          <p className="text-white lh15">
                            The $stHOPE unstake will take 28 days to processing and you can withdraw your $HOPE at any
                            time after it is completed.
                          </p>
                          <p className="text-white lh15 m-t-5">
                            Note that you do not receive the $LT bonus when you confirm your submission. You can also
                            try{' '}
                            <NavLink to={'/swap/exchange'}>
                              <div className="text-primary">HopeSwap</div>{' '}
                            </NavLink>
                            to convert $stHOPE to $HOPE or other assets quickly.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Col>
            <Col className="gutter-row" span={10}>
              <div>
                <HopeCard title={'My Value'}>
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
                    <div className="flex jc-between m-b-20">
                      <span className="text-normal">Gömböc relative weight</span>
                      <span className="text-white">{format.rate(relWeight)}</span>
                    </div>
                    <div className="flex jc-between m-b-20">
                      <span className="text-normal">My Current Boost</span>
                      <span className="text-white">{currentBoots ? currentBoots.toFixed(2) : '--'}x</span>
                    </div>
                    <div className="flex jc-between m-b-20">
                      <span className="text-normal">My Future Boost</span>
                      <span className="text-white">{futureBoots ? futureBoots.toFixed(2) : '--'}x</span>
                    </div>
                    <div className="flex jc-between ai-center m-b-20">
                      <span className="text-normal">Claimable</span>
                      <div className="flex ai-center">
                        <span className="text-white">
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
                    </div>
                    {account && claRewards && Number(claRewards.toFixed(2)) > 0 && (
                      <div className="flex ai-center">
                        <i className="text-primary iconfont m-r-5 font-14">&#xe61e;</i>
                        <p className="text-normal lh15">You can apply future boost by claiming LT</p>
                      </div>
                    )}
                  </div>
                  <div className="card-bot p-30">
                    <div className="flex jc-between m-b-20">
                      <div className="coin-box flex ai-center">
                        <div className="hope-icon"></div>
                        <div className="currency font-nor text-medium m-l-12">HOPE</div>
                      </div>
                      <span className="text-white">≈ ${toUsdPrice(hopeBal?.toFixed(2), hopePrice) || '--'}</span>
                    </div>
                    <div className="flex jc-between m-b-20">
                      <span className="text-white">Available</span>
                      <span className="text-white">{hopeBal?.toFixed(2, { groupSeparator: ',' } ?? '-') || '--'}</span>
                    </div>
                    <div className="flex jc-between">
                      <span className="text-white">Unstaked</span>
                      <div className="flex ai-center">
                        <span className="text-white">
                          {unstakedVal?.toFixed(2, { groupSeparator: ',' }).toString() || '--'}
                        </span>
                        {account && unstakedVal && Number(unstakedVal.toFixed(2)) > 0 && (
                          <ButtonOutlined className="staking-outline m-l-10" onClick={toWithdrawCallback}>
                            Withdaw
                          </ButtonOutlined>
                        )}
                      </div>
                    </div>
                    <div className="card-line m-y-30"></div>
                    <div className="flex jc-between m-b-20">
                      <div className="coin-box flex ai-center">
                        <div className="hope-icon"></div>
                        <div className="currency font-nor text-medium m-l-12">stHOPE</div>
                      </div>
                      <span className="text-white">
                        ≈ ${toUsdPrice(stHopeBalance?.toFixed(2), stHopePrice) || '--'}
                      </span>
                    </div>
                    <div className="flex jc-between m-b-20">
                      <span className="text-white">Available</span>
                      <span className="text-white">
                        {stakedVal?.toFixed(2, { groupSeparator: ',' }).toString() || '--'}
                      </span>
                    </div>
                    <div className="flex jc-between">
                      <span className="text-white">Unstaking</span>
                      <span className="text-white">
                        {unstakingVal?.toFixed(2, { groupSeparator: ',' }).toString() || '--'}
                      </span>
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
