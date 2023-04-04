import React, { useState } from 'react'
import './index.scss'
import { CloseIcon } from '../../../theme/components'
import { ButtonPrimary } from '../../Button'
import { useActiveWeb3React } from '../../../hooks'
import { useEstimate } from 'hooks/ahp'
import format from '../../../utils/format'
import { IHeadItem } from 'pages/Portfolio/component/MyLiquidityPools/components/head'
import { TokenAmount } from '@uniswap/sdk'

export type ITableItem = {
  usdOfTotalReward: string | number
  ltOfReward: string | number
  rewardSymbol: string | number
  usdOfReward: string | number
  gauge?: string | number
  usdOfExtReward?: string | number
  extRewardList?: { symbol: string | number; amount: string | number; usdOfToken: string | number }[]
}
interface GaugeClaimProps {
  onSubmit: any
  onDismiss: () => void
  total: TokenAmount
  list: IHeadItem[] | null
  ltPrice: any
}

function GaugeClaimAll({ onSubmit, onDismiss, total, list, ltPrice }: GaugeClaimProps) {
  const { account } = useActiveWeb3React()
  const isEthBalanceInsufficient = useEstimate()
  const [drapIndex, setDrapIndex] = useState(true)
  const drapFn = () => {
    setDrapIndex(!drapIndex)
  }

  return (
    <>
      <div className="gauge-claim-box staking-claim-box w-100">
        <div className="head text-medium font-18">
          Rewards Claim
          <div className="icon-close">
            <CloseIcon onClick={onDismiss} />
          </div>
        </div>
        <div className="claim-con p-20">
          <div>
            {
              <div className="radio-item">
                <div onClick={drapFn} className="radio-box-head flex jc-between">
                  <div className="flex ai-center">Total Claimable Rewards</div>
                  <div className="flex ai-center">
                    <p className="text-normal text-right">{total?.toFixed(2, { groupSeparator: ',' } ?? '0.00')} LT</p>
                    <i className={drapIndex ? 'iconfont icon-drap ' : 'iconfont icon-drap active'}>&#xe60d;</i>
                  </div>
                </div>
                <div className={drapIndex ? 'radio-box-con hide' : 'radio-box-con'}>
                  {list &&
                    list.length > 0 &&
                    list.map((item: any, index: number) => {
                      return (
                        <>
                          {item && (
                            <div key={index} className="flex jc-between m-b-10">
                              <div className="font-nor text-medium">
                                <div className="currency text-white text-medium">{item.composition}</div>
                              </div>
                              <div>
                                <p className="text-white text-right font-nor lh1">
                                  {item.conReward?.toFixed(2, { groupSeparator: ',' } ?? '0.00')} LT
                                </p>
                                <p className="text-normal text-right lh1 m-t-12">
                                  ≈ ${' '}
                                  {item.conReward && ltPrice
                                    ? format.amountFormat(
                                        Number(item.conReward?.toExact().toString()) * Number(ltPrice),
                                        2
                                      )
                                    : '0.00'}
                                </p>
                              </div>
                            </div>
                          )}
                        </>
                      )
                    })}
                </div>
              </div>
            }
          </div>
          {/* <div className="flex jc-between font-nor">
            <span className="text-normal">Total Claimable Rewards</span>
            <span className="text-white">{total} LT</span>
          </div>
          <div>
            {list.map((item, index) => {
              return (
                <div key={index}>
                  {item.composition} {item.ltOfReward}
                </div>
              )
            })}
          </div> */}
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

export default GaugeClaimAll
