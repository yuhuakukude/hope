import React, { useState } from 'react'
import './index.scss'
import { CloseIcon } from '../../../theme/components'
import { ButtonPrimary } from '../../../components/Button'

import { Radio } from 'antd'
import Tips from 'components/Tips'

interface GombocClaimProps {
  onSubmit: any
  onDismiss: () => void
  feeInfo: any
  feeType: string
  withdrawType: string
}

const GombocClaim = ({ onSubmit, onDismiss, feeInfo, feeType, withdrawType }: GombocClaimProps) => {
  const [curClaimType, setCurClaimType] = useState()
  console.log(feeInfo, feeType, withdrawType)
  function changeRadio(item: any) {
    setCurClaimType(item)
  }
  return (
    <>
      <div className="gomboc-claim-box staking-claim-box w-100">
        <div className="head">
          Rewards Claim
          <div className="icon-close">
            <CloseIcon onClick={onDismiss} />
          </div>
        </div>
        <div className="claim-con p-30">
          <div className="flex jc-between">
            <span className="text-white">Total Claimable Rewards</span>
            <span className="text-white">~ 12312</span>
          </div>
          <Radio.Group
            className="m-t-30 w-100"
            onChange={(e: any) => {
              changeRadio(e.target.value)
            }}
            value={curClaimType}
          >
            <div className="radio-item flex jc-between">
              <div className="flex ai-center">
                <Radio value={`normal`}>
                  <span className="text-white">Claimable Rewards</span>
                </Radio>
                <Tips title={`Claimable Rewards`} />
              </div>
              <div>
                <p className="text-white">1231</p>
                <p className="text-normal">~ 12312</p>
              </div>
            </div>
            <div className="m-t-30 radio-item">
              <div className="radio-box-head flex jc-between">
                <div className="flex ai-center">
                  <Radio value={`pool`}>
                    <span className="text-white">Claimable Rewards</span>
                  </Radio>
                  <Tips title={`Claimable Rewards`} />
                </div>
                <div>
                  <p className="text-normal">~ 123</p>
                </div>
              </div>
            </div>
          </Radio.Group>
          <ButtonPrimary
            className="hp-button-primary m-t-30"
            onClick={() => {
              onSubmit(curClaimType)
            }}
          >
            Claim
          </ButtonPrimary>
        </div>
      </div>
    </>
  )
}

export default GombocClaim
