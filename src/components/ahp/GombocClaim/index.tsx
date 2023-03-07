import React, { useState } from 'react'
import './index.scss'
import { CloseIcon } from '../../../theme/components'
import { ButtonPrimary } from '../../../components/Button'
import format from 'utils/format'
import { Radio } from 'antd'
import Tips from 'components/Tips'
// import { STAKING_HOPE_GOMBOC_ADDRESS } from '../../../constants'
import { useActiveWeb3React } from '../../../hooks'
import { useEstimate } from 'hooks/ahp'

export type ITableItem = {
  usdOfTotalReward?: string | number
  ltOfReward: string | number
  rewardSymbol?: string | number
  usdOfReward: string | number
  gomboc?: string | number
  usdOfExtReward?: string | number
  extRewardList?: { symbol: string | number; amount: string | number; usdOfToken: string | number }[]
}
interface GombocClaimProps {
  onSubmit: any
  onDismiss: () => void
  tableItem: ITableItem
}

const GombocClaim = ({ onSubmit, onDismiss, tableItem = {} as ITableItem }: GombocClaimProps) => {
  const { account } = useActiveWeb3React()
  const isEthBalanceInsufficient = useEstimate()
  const [curClaimType, setCurClaimType] = useState('')
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
          {tableItem?.usdOfTotalReward && (
            <div className="flex jc-between">
              <span className="text-white">Total Claimable Rewards</span>
              <span className="text-white">≈ ${format.amountFormat(tableItem?.usdOfTotalReward, 2)}</span>
            </div>
          )}
          <Radio.Group
            className="m-t-30 w-100"
            onChange={(e: any) => {
              changeRadio(e.target.value)
            }}
            value={curClaimType}
          >
            <div className="radio-item flex jc-between">
              <div className="flex ai-center">
                <Radio
                  disabled={tableItem && !!tableItem?.ltOfReward && Number(tableItem?.ltOfReward) <= 0}
                  value={`normal`}
                >
                  <span className="text-white">Claimable Rewards</span>
                </Radio>
                <Tips title={`Claimable Rewards`} />
              </div>
              <div>
                <p className="text-white text-right">
                  {format.amountFormat(tableItem?.ltOfReward, 2)} {tableItem?.rewardSymbol}
                </p>
                <p className="text-normal text-right">≈ ${format.amountFormat(tableItem?.usdOfReward, 2)}</p>
              </div>
            </div>
            {tableItem && tableItem?.extRewardList && tableItem?.extRewardList.length > 0 && (
              <div className="m-t-30 radio-item">
                <div className="radio-box-head flex jc-between">
                  <div className="flex ai-center">
                    <Radio
                      disabled={tableItem && !!tableItem?.usdOfExtReward && Number(tableItem?.usdOfExtReward) <= 0}
                      value={`pool`}
                    >
                      <span className="text-white">Claimable Rewards</span>
                    </Radio>
                    <Tips title={`Claimable Rewards`} />
                  </div>
                  <div>
                    <p className="text-normal text-right">≈ ${format.amountFormat(tableItem?.usdOfExtReward, 2)}</p>
                  </div>
                </div>
                {tableItem && tableItem?.extRewardList && tableItem?.extRewardList.length > 0 && (
                  <div className="radio-box-con">
                    {tableItem?.extRewardList.map((data, index) => {
                      return (
                        <div key={index} className="flex jc-between">
                          <div className="coin-box flex ai-center cursor-select">
                            {/* <div className="hope-icon"></div> */}
                            <div className="currency text-white text-medium m-l-12">{data.symbol}</div>
                          </div>
                          <div>
                            <p className="text-white text-right">
                              {format.amountFormat(data.amount, 2)} {data.symbol}
                            </p>
                            <p className="text-white text-right">≈ ${format.amountFormat(data.usdOfToken, 2)}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </Radio.Group>
          <ButtonPrimary
            className="hp-button-primary m-t-30"
            disabled={!curClaimType}
            onClick={() => {
              onSubmit(curClaimType)
            }}
          >
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

export default GombocClaim
