import React, { useEffect, useCallback, useState, useMemo } from 'react'
import styled from 'styled-components'
import { Button } from 'antd'
import { AutoColumn } from '../../components/Column'
import NumericalInput from '../../components/NumericalInput'
import { useActiveWeb3React } from '../../hooks'
import { useTokenBalance } from '../../state/wallet/hooks'
import { HOPE, PERMIT2_ADDRESS } from '../../constants'
import StakingApi from '../../api/staking.api'
import { Row, Col } from 'antd'
import HopeCard from '../../components/ahp/card'
import { useStaking, useToStaked, useToWithdraw, useToUnStaked } from '../../hooks/ahp/useStaking'
import format from '../../utils/format'
import { useWalletModalToggle } from '../../state/application/hooks'
import { ButtonPrimary } from '../../components/Button'
import { tryParseAmount } from '../../state/swap/hooks'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import ActionButton from '../../components/Button/ActionButton'
import { TokenAmount } from '@uniswap/sdk'
import StakingClaimModal from '../../components/ahp/StakingClaimModal'
import './index.scss'

const PageWrapper = styled(AutoColumn)`
  max-width: 1280px;
  width: 100%;
`

export default function Staking() {
  const { account, chainId } = useActiveWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const [curType, setStakingType] = useState('stake')
  const hopeBal = useTokenBalance(account ?? undefined, HOPE[chainId ?? 1])
  const [apyVal, setApyVal] = useState('0')
  const [amount, setAmount] = useState('')
  const [claimModalFlag, setClaimModalFlag] = useState<boolean>(false)
  const [receiveAmount, setReceiveAmount] = useState('')

  const inputAmount = tryParseAmount(amount, HOPE[chainId ?? 1]) as TokenAmount | undefined
  const { stakedVal, lpTotalSupply, unstakedVal, claRewards, mintedVal, unstakingVal } = useStaking()
  const { toStaked } = useToStaked()
  const { toUnStaked } = useToUnStaked()
  const { toWithdraw } = useToWithdraw()
  const [approvalState, approveCallback] = useApproveCallback(inputAmount, PERMIT2_ADDRESS[chainId ?? 1])
  const totalRewards = useMemo(() => {
    let res
    if (claRewards && mintedVal) {
      res = claRewards.add(mintedVal)
    }
    return res
  }, [claRewards, mintedVal])

  const stakingCallback = useCallback(async () => {
    if (!amount || !account || !inputAmount) return
    // showModal(<TransactionPendingModal />)
    const testData = {
      NONCE: '47317459226169151117060976502302229419756387859583426096766647023563518724591',
      DEADLINE: '1675355171',
      sigVal:
        '0xc5beacf6327fafdbb3a188f1974da1b890e28921b4302b800a6d609c904d001e1669a5e73c18fb749eabb8b74587192c2bbcfe68954f0b18fc479c8a50b667781b'
    }
    toStaked(inputAmount, testData.NONCE, testData.DEADLINE, testData.sigVal)
      .then(() => {
        console.log('success')
        // hideModal()
        // showModal(<TransactionSubmittedModal />)
      })
      .catch((err: any) => {
        // hideModal()
        // showModal(
        //   <MessageBox type="error">{err.error && err.error.message ? err.error.message : err?.message}</MessageBox>
        // )
        console.error(err)
      })
  }, [amount, account, inputAmount, toStaked])

  const unStakingCallback = useCallback(async () => {
    if (!amount || !account || !inputAmount) return
    // showModal(<TransactionPendingModal />)
    toUnStaked(inputAmount)
      .then(() => {
        console.log('success')
        // hideModal()
        // showModal(<TransactionSubmittedModal />)
      })
      .catch((err: any) => {
        // hideModal()
        // showModal(
        //   <MessageBox type="error">{err.error && err.error.message ? err.error.message : err?.message}</MessageBox>
        // )
        console.error(err)
      })
  }, [amount, account, inputAmount, toUnStaked])

  const toWithdrawCallback = useCallback(async () => {
    if (!account) return
    // showModal(<TransactionPendingModal />)
    toWithdraw()
      .then(() => {
        console.log('success')
        // hideModal()
        // showModal(<TransactionSubmittedModal />)
      })
      .catch((err: any) => {
        // hideModal()
        // showModal(
        //   <MessageBox type="error">{err.error && err.error.message ? err.error.message : err?.message}</MessageBox>
        // )
        console.error(err)
      })
  }, [account, toWithdraw])

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
    setReceiveAmount('')
    setStakingType(type)
  }

  function changeAmount(val: any) {
    console.log(val)
    setAmount(val)
    setReceiveAmount(val)
  }

  function toClaim() {
    setClaimModalFlag(true)
  }

  function handleClaimDismiss() {}

  function handleClaimView(view: boolean) {
    setClaimModalFlag(view)
  }

  const init = useCallback(async () => {
    await initApy()
  }, [])

  useEffect(() => {
    init()
  }, [init])

  return (
    <>
      <PageWrapper>
        <div className="staking-page">
          <div className="staking-head">
            <h3 className="text-white font-28 font-bolder">Staking $HOPE</h3>
            <p className="text-white font-nor m-t-10">
              Stake your $HOPE tokens for an annual percentage yield (APY).
              <a href="/" className="text-normal m-l-15">
                Learn more
              </a>
            </p>
          </div>
          <Row className="m-t-40" gutter={30}>
            <Col className="gutter-row" span={16}>
              <div className="staking-tab">
                <div className="head flex">
                  <div
                    onClick={() => {
                      changeStake('stake')
                    }}
                    className={curType === 'stake' ? `head-item tab-stake flex-1 active` : 'head-item tab-stake flex-1'}
                  >
                    Stake
                  </div>
                  <div
                    onClick={() => {
                      changeStake('unstake')
                    }}
                    className={curType === 'unstake' ? `head-item flex-1 active` : 'head-item flex-1'}
                  >
                    Unstake
                  </div>
                </div>
                <div className="tab-con p-20">
                  <div className="flex jc-between">
                    <span className="text-normal">{curType === 'stake' ? 'Deposit' : 'Withdraw'}</span>
                    <div className="text-normal">
                      Available:{' '}
                      {curType === 'stake'
                        ? `${hopeBal?.toFixed(2, { groupSeparator: ',' } ?? '-')} HOPE`
                        : `${stakedVal?.toFixed(2, { groupSeparator: ',' }).toString()} stHOPE`}
                    </div>
                  </div>
                  <NumericalInput
                    className="hp-amount m-t-10"
                    value={amount}
                    onUserInput={val => {
                      changeAmount(val)
                    }}
                  />
                  <div className="flex jc-between m-t-30">
                    <span className="text-white">Est Transaction Fee</span>
                    <span className="text-white">0.0012 ETH</span>
                  </div>
                  <div className="flex jc-between m-t-20">
                    <span className="text-white">Receive </span>
                    <span className="text-white">{receiveAmount} stHOPE</span>
                  </div>
                  <div className="action-box m-t-40">
                    {!account ? (
                      <ButtonPrimary className="hp-button-primary" onClick={toggleWalletModal}>
                        Connect Wallet
                      </ButtonPrimary>
                    ) : curType === 'stake' ? (
                      <ActionButton
                        pending={approvalState === ApprovalState.PENDING}
                        disableAction={!inputAmount}
                        actionText={
                          !inputAmount
                            ? 'Enter amount'
                            : approvalState === ApprovalState.NOT_APPROVED
                            ? 'Allow RamBox to use your USDT'
                            : 'Approve'
                        }
                        onAction={approvalState === ApprovalState.NOT_APPROVED ? approveCallback : stakingCallback}
                      />
                    ) : (
                      <ActionButton
                        pending={approvalState === ApprovalState.PENDING}
                        disableAction={!inputAmount}
                        actionText={
                          !inputAmount
                            ? 'Enter amount'
                            : approvalState === ApprovalState.NOT_APPROVED
                            ? 'Allow RamBox to use your USDT'
                            : 'Commit to unstake'
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
                    <h3 className="text-success font-28 font-bold">{format.rate(apyVal)}</h3>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-nor">Total Staked </p>
                    <h3 className="text-white font-28 font-bold">
                      {lpTotalSupply?.toFixed(2, { groupSeparator: ',' }).toString()}
                    </h3>
                  </div>
                </div>
              </HopeCard>
              <div className="m-t-30">
                <HopeCard title={'Stake'}>
                  <div className="flex jc-between m-b-10">
                    <span className="text-white">Available</span>
                    <span className="text-white">{hopeBal?.toFixed(2, { groupSeparator: ',' } ?? '-')}</span>
                  </div>
                  <div className="flex jc-between m-b-10">
                    <span className="text-white">Staked</span>
                    <span className="text-white">{stakedVal?.toFixed(2, { groupSeparator: ',' }).toString()}</span>
                  </div>
                  <div className="flex jc-between m-b-10">
                    <span className="text-white">Unstaking</span>
                    <span className="text-white">{unstakingVal?.toFixed(2, { groupSeparator: ',' }).toString()}</span>
                  </div>
                  <div className="flex jc-between">
                    <span className="text-white">Unstaked</span>
                    <span className="text-white">{unstakedVal?.toFixed(2, { groupSeparator: ',' }).toString()}</span>
                  </div>
                  {!(
                    account &&
                    unstakedVal &&
                    Number(unstakedVal.toFixed(2, { groupSeparator: ',' }).toString()) > 0
                  ) && (
                    <div className="flex jc-end m-b-10">
                      <Button className="text-primary cursor-select p-x-0" onClick={toWithdrawCallback} type="link">
                        Withdraw
                      </Button>
                    </div>
                  )}
                  <div className="flex jc-between m-b-10">
                    <span className="text-white">Total Rewards</span>
                    <span className="text-white">{totalRewards?.toFixed(2, { groupSeparator: ',' }).toString()}</span>
                  </div>
                  <div className="flex jc-between">
                    <span className="text-white">Claimable Rewards</span>
                    <span className="text-white">{claRewards?.toFixed(2, { groupSeparator: ',' }).toString()}</span>
                  </div>
                  {!(
                    account &&
                    claRewards &&
                    Number(claRewards.toFixed(2, { groupSeparator: ',' }).toString()) > 0
                  ) && (
                    <div className="flex jc-end m-b-10">
                      <Button className="text-primary cursor-select p-x-0" onClick={toClaim} type="link">
                        Claim
                      </Button>
                    </div>
                  )}
                </HopeCard>
              </div>
            </Col>
          </Row>
        </div>
        <StakingClaimModal
          rewardsInfo={{
            claRewards: claRewards?.toFixed(2, { groupSeparator: ',' }).toString(),
            totalRewards: totalRewards?.toFixed(2, { groupSeparator: ',' }).toString()
          }}
          isOpen={claimModalFlag}
          onDismiss={handleClaimDismiss}
          setModalView={handleClaimView}
        />
      </PageWrapper>
    </>
  )
}
