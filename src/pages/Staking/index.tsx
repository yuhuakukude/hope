import React, { useEffect, useCallback, useState } from 'react'
import styled from 'styled-components'
import { AutoColumn } from '../../components/Column'
import NumericalInput from '../../components/NumericalInput'
import { useActiveWeb3React } from '../../hooks'
import { useTokenBalance } from '../../state/wallet/hooks'
import { HOPE } from '../../constants'
import StakingApi from '../../api/staking.api'
import { Row, Col } from 'antd'
import HopeCard from '../../components/ahp/card'
import { useStaking } from '../../hooks/ahp/useStaking'
import format from '../../utils/format'
import { useWalletModalToggle } from '../../state/application/hooks'
import { ButtonPrimary } from '../../components/Button'
import './index.scss'

const PageWrapper = styled(AutoColumn)`
  max-width: 1280px;
  width: 100%;
`

export default function Staking() {
  const { account } = useActiveWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const [curType, setStakingType] = useState('stake')
  const hopeBal = useTokenBalance(account ?? undefined, HOPE)
  const [apyVal, setApyVal] = useState('0')
  const [amount, setAmount] = useState('0')
  const [receiveAmount, setReceiveAmount] = useState('0')
  // const { stakedVal, lpTotalSupply, unstakedVal, claRewards, mintedVal } = useStaking()
  const { stakedVal, lpTotalSupply, unstakedVal, claRewards } = useStaking()

  // const totalRewards = useMemo(() => {
  //   let res
  //   if (claRewards && mintedVal) {
  //     // res = JSBI.add(JSBI.BigInt(claRewards), JSBI.BigInt(mintedVal))
  //     res = claRewards.add(mintedVal)
  //   }
  //   return res
  // }, [claRewards, mintedVal])

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
    // form.setFieldsValue({ amount: '' })
    // setReceiveAmount('0')
    setStakingType(type)
  }

  function changeAmount(val: any) {
    console.log(val)
    setAmount(val)
    setReceiveAmount(val)
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
                    ) : (
                      <ButtonPrimary className="hp-button-primary">approve</ButtonPrimary>
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
                    <span className="text-white">{unstakedVal?.toFixed(2, { groupSeparator: ',' }).toString()}</span>
                  </div>
                  <div className="flex jc-between m-b-10">
                    <span className="text-white">Total Rewards</span>
                    {/* <span className="text-white">{totalRewards?.toFixed(2, { groupSeparator: ',' }).toString()}</span> */}
                  </div>
                  <div className="flex jc-between m-b-10">
                    <span className="text-white">Claimable Rewards</span>
                    <span className="text-white">{claRewards?.toFixed(2, { groupSeparator: ',' }).toString()}</span>
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
