import React from 'react'
import './index.scss'
import { CloseIcon } from '../../../theme/components'
import { ButtonPrimary } from '../../../components/Button'

interface ClaimConProps {
  onSubmit: () => void
  onDismiss: () => void
  totalRewards: any
  claRewards: any
}

const ClaimCon = ({ onSubmit, onDismiss, totalRewards, claRewards }: ClaimConProps) => {
  return (
    <>
      <div className="staking-claim-box w-100">
        <div className="head">
          LT Rewards Claim
          <div className="icon-close">
            <CloseIcon onClick={onDismiss} />
          </div>
        </div>
        <div className="claim-con p-30">
          <div className="flex jc-between">
            <span className="text-white">Total Rewards</span>
            <span className="text-white">
              {totalRewards ? totalRewards?.toFixed(2, { groupSeparator: ',' }).toString() : '--'}
            </span>
          </div>
          <div className="flex jc-between m-t-20 m-b-40">
            <span className="text-white">Claimable Rewards</span>
            <span className="text-white">
              {claRewards ? claRewards?.toFixed(2, { groupSeparator: ',' }).toString() : '--'}
            </span>
          </div>
          <ButtonPrimary className="hp-button-primary" onClick={onSubmit}>
            Claim
          </ButtonPrimary>
        </div>
      </div>
    </>
  )
}

export default ClaimCon
