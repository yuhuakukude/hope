import React, { useEffect, useCallback, useState } from 'react'
import styled from 'styled-components'
import { AutoColumn } from '../../components/Column'
import { useActiveWeb3React } from '../../hooks'
import { useTokenBalance } from '../../state/wallet/hooks'
import { HOPE } from '../../constants'
import StakingApi from '../../api/staking.api'
import { Row, Col } from 'antd'

import './index.scss'
import HopeCard from '../../components/ahp/card'
import { useStaking } from '../../hooks/ahp/useStaking'
const PageWrapper = styled(AutoColumn)`
  max-width: 1280px;
  width: 100%;
`

export default function Staking() {
  const { account } = useActiveWeb3React()
  const [curType, setStakingType] = useState('stake')
  const hopeBal = useTokenBalance(account ?? undefined, HOPE)
  const { stakedVal } = useStaking()

  async function initApy() {
    try {
      const res = await StakingApi.getApy()
      if (res && res.result) {
        console.log(res)
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
                </div>
              </div>
            </Col>
            <Col className="gutter-row" span={8}>
              <HopeCard title={'Overview'}>
                <div className="flex">
                  <div className="apy-box"></div>
                  <p className="">APY</p>
                </div>
              </HopeCard>
            </Col>
          </Row>
        </div>
      </PageWrapper>
    </>
  )
}
