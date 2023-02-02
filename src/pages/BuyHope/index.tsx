import React from 'react'
import styled from 'styled-components'
import { AutoColumn } from '../../components/Column'
import { useActiveWeb3React } from '../../hooks'
import { useTokenBalance } from '../../state/wallet/hooks'
import { USDT } from '../../constants'
import { Row, Col } from 'antd'

import './index.scss'
import HopeCard from '../../components/ahp/card'

const PageWrapper = styled(AutoColumn)`
  max-width: 1280px;
  width: 100%;
`

export default function Staking() {
  const { account, chainId } = useActiveWeb3React()
  console.log(USDT)
  const usdtBalance = useTokenBalance(account ?? undefined, USDT)
  console.log(usdtBalance?.toFixed(2, { groupSeparator: ',' } ?? '-'), chainId)
  // const usdtBalance = useTokenBalance(account ?? undefined, USDT[chainId ?? 56])
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
              1
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
