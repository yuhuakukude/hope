import React, { useEffect, useCallback, useState, useMemo } from 'react'
import styled from 'styled-components'
import { Button } from 'antd'
import { AutoColumn } from '../../components/Column'
import NumericalInput from '../../components/NumericalInput'
import { useActiveWeb3React } from '../../hooks'
import { useTokenBalance } from '../../state/wallet/hooks'
import { HOPE, LT, PERMIT2_ADDRESS, ST_HOPE, STAKING_HOPE_GOMBOC_ADDRESS } from '../../constants'
import StakingApi from '../../api/staking.api'
import { Row, Col } from 'antd'
import HopeCard from '../../components/ahp/card'
import { useStaking, useToStaked, useToWithdraw, useToUnStaked, useToClaim } from '../../hooks/ahp/useStaking'
import format from '../../utils/format'
import { useWalletModalToggle } from '../../state/application/hooks'
import { ButtonPrimary } from '../../components/Button'
import { tryParseAmount } from '../../state/swap/hooks'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import ActionButton from '../../components/Button/ActionButton'
import { CloseIcon } from '../../theme/components'
import { Token, TokenAmount } from '@uniswap/sdk'
import './index.scss'
import TransactionConfirmationModal, { TransactionErrorContent } from '../../components/TransactionConfirmationModal'
import { getPermitData, Permit, PERMIT_EXPIRATION, toDeadline } from '../../permit2/domain'
import { ethers } from 'ethers'

const PageWrapper = styled(AutoColumn)`
  max-width: 1280px;
  width: 100%;
`

export default function Staking() {
  const { account, chainId, library } = useActiveWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const [curType, setStakingType] = useState('stake')
  const [curToken, setCurToken] = useState<Token | undefined>(HOPE[chainId ?? 1])

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm

  // Subscribed
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false)
  // txn values
  const [txHash, setTxHash] = useState<string>('')

  const [errorMessage, setErrorMessage] = useState<string | undefined>()

  const hopeBal = useTokenBalance(account ?? undefined, HOPE[chainId ?? 1])
  const [apyVal, setApyVal] = useState('0')
  const [amount, setAmount] = useState('')
  const [receiveAmount, setReceiveAmount] = useState('')

  const inputAmount = tryParseAmount(amount, HOPE[chainId ?? 1]) as TokenAmount | undefined
  const { stakedVal, lpTotalSupply, unstakedVal, claRewards, mintedVal, unstakingVal } = useStaking()
  const { toStaked } = useToStaked()
  const { toUnStaked } = useToUnStaked()
  const { toWithdraw } = useToWithdraw()
  const { toClaim } = useToClaim()
  const [approvalState, approveCallback] = useApproveCallback(inputAmount, PERMIT2_ADDRESS[chainId ?? 1])

  const totalRewards = useMemo(() => {
    let res
    if (claRewards && mintedVal) {
      res = claRewards.add(mintedVal)
    }
    return res
  }, [claRewards, mintedVal])

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

  const stakingCallback = useCallback(async () => {
    if (!account || !inputAmount || !library || !chainId) return

    setCurToken(ST_HOPE[chainId ?? 1])

    setShowConfirm(true)
    setAttemptingTxn(true)

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
    const signature = await library.getSigner(account)._signTypedData(domain, types, values)
    toStaked(inputAmount, nonce, deadline, signature)
      .then(hash => {
        setAttemptingTxn(false)
        setTxHash(hash)
        setAmount('')
      })
      .catch((err: any) => {
        setErrorMessage(err.message)
      })
  }, [account, inputAmount, library, chainId, toStaked])

  const unStakingCallback = useCallback(async () => {
    if (!amount || !account || !inputAmount) return
    setCurToken(undefined)
    setShowConfirm(true)
    setAttemptingTxn(true)
    toUnStaked(inputAmount)
      .then(hash => {
        setAttemptingTxn(false)
        setTxHash(hash)
        setAmount('')
      })
      .catch((err: any) => {
        setErrorMessage(err.message)
      })
  }, [amount, account, inputAmount, toUnStaked])

  const claimCallback = useCallback(async () => {
    if (!account) return
    setCurToken(LT[chainId ?? 1])
    setAttemptingTxn(true)
    toClaim()
      .then(hash => {
        setAttemptingTxn(false)
        setTxHash(hash)
        setAmount('')
      })
      .catch((err: any) => {
        setErrorMessage(err.message)
      })
  }, [account, chainId, toClaim])

  const toWithdrawCallback = useCallback(async () => {
    if (!account) return
    setCurToken(HOPE[chainId ?? 1])
    setShowConfirm(true)
    setAttemptingTxn(true)
    toWithdraw()
      .then(hash => {
        setAttemptingTxn(false)
        setTxHash(hash)
      })
      .catch((err: any) => {
        setErrorMessage(err.message)
        console.error(err)
      })
  }, [account, chainId, toWithdraw])

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

  const getIsSub = useCallback(async () => {
    try {
      const res = await StakingApi.getSubscriptionInfo({
        address: account
      })
      if (res && res.result === false) {
        console.log(res)
        setIsSubscribed(true)
      }
    } catch (error) {
      console.log(error)
    }
  }, [account])

  function changeStake(type: string) {
    setAmount('')
    setReceiveAmount('')
    setStakingType(type)
  }

  function changeAmount(val: any) {
    console.log(val)
    setAmount(val)
    setReceiveAmount(val)
  }

  const init = useCallback(async () => {
    await initApy()
    if (account) {
      await getIsSub()
    }
  }, [account, getIsSub])

  useEffect(() => {
    init()
  }, [init])

  const confirmationContent = useCallback(
    () =>
      errorMessage ? (
        <TransactionErrorContent onDismiss={() => setShowConfirm(false)} message={errorMessage} />
      ) : (
        <div className="staking-claim-box w-100">
          <div className="head">
            $LT Rewards Claim
            <div className="icon-close">
              <CloseIcon onClick={claimCallback} />
            </div>
          </div>
          <div className="claim-con p-30">
            <div className="flex jc-between">
              <span className="text-white">Total Rewards</span>
              <span className="text-white">
                {claRewards ? claRewards?.toFixed(2, { groupSeparator: ',' }).toString() : '--'}
              </span>
            </div>
            <div className="flex jc-between m-t-20 m-b-40">
              <span className="text-white">Claimable Rewards</span>
              <span className="text-white">
                {totalRewards ? totalRewards?.toFixed(2, { groupSeparator: ',' }).toString() : '--'}
              </span>
            </div>
            <ButtonPrimary className="hp-button-primary" onClick={claimCallback}>
              Claim
            </ButtonPrimary>
          </div>
        </div>
      ),
    [claRewards, claimCallback, errorMessage, totalRewards]
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
          pendingText={''}
          currencyToAdd={curToken}
          isShowSubscribe={isSubscribed}
        />
        <div className="staking-page">
          <div className="staking-head">
            <h3 className="text-white font-28 font-bolder">Staking $HOPE</h3>
            <p className="text-white font-nor m-t-10">
              Stake your $HOPE tokens for an annual percentage yield (APY).
              <a href="/" className="text-normal m-l-15 learn-more">
                Learn more
                <i className="iconfont m-l-5 font-14 m-t-2">&#xe619;</i>
              </a>
            </p>
          </div>
          <Row className="m-t-40" gutter={30}>
            <Col className="gutter-row" span={16}>
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
                      <div className="currency font-nor text-medium m-l-12">HOPE</div>
                    </div>
                    <span onClick={() => toMax()} className="input-max cursor-select">
                      Max
                    </span>
                  </div>
                  <div className="flex jc-between m-t-30">
                    <span className="text-white">Est Transaction Fee</span>
                    <span className="text-white">0.0012 ETH</span>
                  </div>
                  <div className="flex jc-between m-t-20">
                    <span className="text-white">Receive </span>
                    <span className="text-white">{receiveAmount || '--'} stHOPE</span>
                  </div>
                  <div className="action-box m-t-40">
                    {!account ? (
                      <ButtonPrimary className="hp-button-primary" onClick={toggleWalletModal}>
                        Connect Wallet
                      </ButtonPrimary>
                    ) : curType === 'stake' ? (
                      <ActionButton
                        error={stakeInputError}
                        pendingText={'Approving'}
                        pending={approvalState === ApprovalState.PENDING}
                        disableAction={!inputAmount || !hopeBal}
                        actionText={
                          stakeInputError
                            ? stakeInputError
                            : !amount
                            ? 'Enter Amount'
                            : approvalState === ApprovalState.NOT_APPROVED
                            ? 'Allow RamBox to use your USDT'
                            : 'Stake'
                        }
                        onAction={approvalState === ApprovalState.NOT_APPROVED ? approveCallback : stakingCallback}
                      />
                    ) : (
                      <ActionButton
                        error={unstakeInputError}
                        pending={approvalState === ApprovalState.PENDING}
                        disableAction={!inputAmount || !stakedVal}
                        actionText={
                          unstakeInputError ? unstakeInputError : !inputAmount ? 'Enter amount' : 'Commit to unstake'
                        }
                        onAction={unStakingCallback}
                      />
                    )}
                  </div>
                </div>
              </div>
            </Col>
            <Col className="gutter-row" span={8}>
              <HopeCard title={'Stake'}>
                <div className="flex">
                  <div className="apy-box">
                    <p className="text-white font-nor">APR</p>
                    <h3 className="text-success font-28 font-bold m-t-10">{format.rate(apyVal)}</h3>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-nor">Total Staked </p>
                    <h3 className="text-white font-28 font-bold m-t-10">
                      {lpTotalSupply?.toFixed(2, { groupSeparator: ',' }).toString() || '--'}
                    </h3>
                  </div>
                </div>
              </HopeCard>
              <div className="m-t-30">
                <HopeCard title={'Stake'}>
                  <div className="flex jc-between m-b-10">
                    <span className="text-white">Available</span>
                    <span className="text-white">{hopeBal?.toFixed(2, { groupSeparator: ',' } ?? '-') || '--'}</span>
                  </div>
                  <div className="flex jc-between m-b-10">
                    <span className="text-white">Staked</span>
                    <span className="text-white">
                      {stakedVal?.toFixed(2, { groupSeparator: ',' }).toString() || '--'}
                    </span>
                  </div>
                  <div className="flex jc-between m-b-10">
                    <span className="text-white">Unstaking</span>
                    <span className="text-white">
                      {unstakingVal?.toFixed(2, { groupSeparator: ',' }).toString() || '--'}
                    </span>
                  </div>
                  <div className="flex jc-between m-b-10">
                    <span className="text-white">Unstaked</span>
                    <span className="text-white">
                      {unstakedVal?.toFixed(2, { groupSeparator: ',' }).toString() || '--'}
                    </span>
                  </div>
                  {account && unstakedVal && Number(unstakedVal.toFixed(2)) > 0 && (
                    <div className="flex jc-end withdaw-box">
                      <Button className="text-primary cursor-select p-x-0" onClick={toWithdrawCallback} type="link">
                        Withdaw
                      </Button>
                    </div>
                  )}
                  <div className="flex jc-between m-b-10">
                    <span className="text-white">Total Rewards</span>
                    <span className="text-white">
                      {totalRewards?.toFixed(2, { groupSeparator: ',' }).toString() || '--'}
                    </span>
                  </div>
                  <div className="flex jc-between">
                    <span className="text-white">Claimable Rewards</span>
                    <span className="text-white">
                      {claRewards?.toFixed(2, { groupSeparator: ',' }).toString() || '--'}
                    </span>
                  </div>
                  {account && claRewards && Number(claRewards.toFixed(2)) > 0 && (
                    <div className="flex jc-end m-b-10">
                      <Button
                        className="text-primary cursor-select p-x-0"
                        onClick={() => {
                          setTxHash('')
                          setShowConfirm(true)
                        }}
                        type="link"
                      >
                        Claim
                      </Button>
                    </div>
                  )}
                </HopeCard>
              </div>
            </Col>
          </Row>
        </div>
      </PageWrapper>
    </>
  )
}
