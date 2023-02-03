import styled from 'styled-components'
import { AutoColumn } from '../../components/Column'
import { useActiveWeb3React } from '../../hooks'
import { useTokenBalance } from '../../state/wallet/hooks'
import { USDT } from '../../constants'
import React, { useState } from 'react'
// import { Row, Col } from 'antd'

import './index.scss'
import { Input as NumericalInput } from '../../components/NumericalInput'

const PageWrapper = styled(AutoColumn)`
  max-width: 1280px;
  width: 100%;
`

export default function Staking() {
  const [pay, setPay] = useState('')
  const [receive, setReceive] = useState('')
  const { account, chainId } = useActiveWeb3React()
  console.log(USDT)
  const usdtBalance = useTokenBalance(account ?? undefined, USDT)
  console.log(usdtBalance?.toFixed(2, { groupSeparator: ',' } ?? '-'), chainId)
  // const usdtBalance = useTokenBalance(account ?? undefined, USDT[chainId ?? 56])
  const onUserPayInput = (value: string) => {
    setPay(value)
  }
  const onUserReceiveInput = (value: string) => {
    setReceive(value)
  }
  return (
    <>
      <PageWrapper>
        <div className="buy-hope-page">
          <div className="title text-medium font-18">Buy HOPE to your wallet</div>
          <div className="box m-t-40">
            <div className="flex jc-between">
              <div className="input-title text-medium font-18 text-normal">You Pay</div>
              <div className="balance text-normal font-16">
                Available: 500.00 <span className="text-primary m-l-8 cursor-select">Max</span>
              </div>
            </div>
            <div className="input-box m-t-12 p-x-32 flex ai-center">
              <div className="coin-box flex ai-center cursor-select">
                <div className="icon"></div>
                <div className="currency font-16 text-medium m-l-12">USDT</div>
                <div className="drop m-l-30">
                  <i className="iconfont">&#xe60d;</i>
                </div>
              </div>
              <NumericalInput
                className="input m-l-10"
                value={pay}
                align={'right'}
                onUserInput={(val: any) => {
                  onUserPayInput(val)
                }}
              />
            </div>
          </div>
          <div className="i-box flex jc-center m-t-50 m-b-30">
            <i className="iconfont font-28 text-normal">&#xe617;</i>
          </div>
          <div className="box">
            <div className="input-title text-medium font-18 text-normal">You Receive</div>
            <div className="input-box m-t-12 p-x-32 flex ai-center">
              <div className="coin-box flex ai-center cursor-select">
                <div className="icon"></div>
                <div className="currency font-16 text-medium m-l-12">HOPE</div>
              </div>
              <NumericalInput
                className="input m-l-10"
                value={receive}
                align={'right'}
                onUserInput={(val: any) => {
                  onUserReceiveInput(val)
                }}
              />
            </div>
          </div>
          <div className="btn-box m-t-30">
            <p className="font-16 text-normal">1.00 USDT = 2.00 HOPE</p>
          </div>
          <div className="gas flex jc-between p-y-30 m-t-30">
            <div className="label font-16 text-normal">Gas Fee</div>
            <div className="value font-16 text-medium">≈0.001 ETH</div>
          </div>
          <div className="tip flex m-t-30">
            <div className="icon m-r-15">
              <i className="iconfont font-28">&#xe614;</i>
            </div>
            <p className="text-normal font-16">
              Your wallet balance is below 0.001 ETH. The approve action require small transaction fees, so you may have
              deposit additional funds to complete them.
            </p>
          </div>
        </div>
      </PageWrapper>
    </>
  )
}
