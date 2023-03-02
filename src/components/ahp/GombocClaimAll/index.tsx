import React from 'react'
import './index.scss'
import { CloseIcon } from '../../../theme/components'
import { ButtonPrimary } from '../../Button'
import { useActiveWeb3React } from '../../../hooks'
import { useEstimate } from 'hooks/ahp'
import { IHeadItem } from 'pages/Portfolio/component/MyLiquidityPools/components/head'

export type ITableItem = {
  usdOfTotalReward: string | number
  ltOfReward: string | number
  rewardSymbol: string | number
  usdOfReward: string | number
  gomboc?: string | number
  usdOfExtReward?: string | number
  extRewardList?: { symbol: string | number; amount: string | number; usdOfToken: string | number }[]
}
interface GombocClaimProps {
  onSubmit: any
  onDismiss: () => void
  total: number
  list: IHeadItem[]
}

function GombocClaimAll({ onSubmit, onDismiss, total, list }: GombocClaimProps) {
  const { account } = useActiveWeb3React()
  const isEthBalanceInsufficient = useEstimate()

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
            <span className="text-white">≈ ${total}</span>
          </div>
          <div>
            {list.map((item, index) => {
              console.log(item)
              return (
                <div key={index}>
                  {item.composition} {item.ltOfReward}
                </div>
              )
            })}
          </div>
          <ButtonPrimary className="hp-button-primary m-t-30" onClick={onSubmit}>
            Claim
          </ButtonPrimary>
          {account && isEthBalanceInsufficient && (
            <div className="tip flex m-t-30">
              <div className="icon m-r-15">
                <i className="iconfont font-20 text-primary font-bold">&#xe614;</i>
              </div>
              <p className="text-normal font-nor lh15">
                Your wallet balance is below 0.001 ETH. The approve action require small transaction fees, so you may
                have deposit additional funds to complete them.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default GombocClaimAll
