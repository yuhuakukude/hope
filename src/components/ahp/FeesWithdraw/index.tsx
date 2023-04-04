import React, { useState } from 'react'
import './index.scss'
import { CloseIcon } from '../../../theme/components'
import { ButtonPrimary } from '../../../components/Button'
// import { Decimal } from 'decimal.js'
import Tips from 'components/Tips'
// import format from 'utils/format'
import { useEstimate } from 'hooks/ahp'
import { useActiveWeb3React } from '../../../hooks'
import { SymbolLogo } from 'components/CurrencyLogo'

interface GaugeClaimProps {
  onSubmit: any
  onDismiss: () => void
  curWithType: string
  allData?: any
  itemData?: any
}

const GaugeClaim = ({ onSubmit, onDismiss, curWithType, allData, itemData }: GaugeClaimProps) => {
  const [drapIndex, setDrapIndex] = useState(true)
  const { account } = useActiveWeb3React()
  const isEthBalanceInsufficient = useEstimate()

  const drapFn = () => {
    setDrapIndex(!drapIndex)
  }

  return (
    <>
      <div className="fee-with-box staking-claim-box w-100">
        <div className="head">
          Fees Withdraw
          <div className="icon-close">
            <CloseIcon onClick={onDismiss} />
          </div>
        </div>
        <div className="claim-con p-x-20 p-b-20">
          {curWithType === 'item' && (
            <div className="feew-item">
              <div className="flex feew-head ai-center">
                <span className="text-white">veLT voting dividends</span>
                <Tips
                  className="m-l-8"
                  title="All users who voted using veLT as their liquidity mining gauge will participate in the distribution of an additional 25% of the platform's fee revenue."
                />
              </div>
              <div className="flex ai-center jc-between feew-con">
                <div className="flex ai-center">
                  <SymbolLogo size={'16px'} symbol={`HOPE`} />
                  <span className="text-white m-l-8">{itemData.value} stHOPE</span>
                </div>
                <span className="text-normal">≈ ${itemData.usdOfValue}</span>
              </div>
            </div>
          )}
          {curWithType === 'others' && (
            <div className="feew-item">
              <div className="flex feew-head ai-center">
                <span className="text-white">veLT hold dividends</span>
                <Tips className="m-l-8" title="25% of the platform fees will be distributed among all veLT holders." />
              </div>
              <div className="flex ai-center jc-between feew-con">
                <div className="flex ai-center">
                  <SymbolLogo size={'16px'} symbol={`HOPE`} />
                  <span className="text-white m-l-8">{itemData.value} stHOPE</span>
                </div>
                <span className="text-normal">≈ ${itemData.usdOfValue}</span>
              </div>
            </div>
          )}
          {curWithType === 'all' && (
            <div>
              {
                <div className="feew-item">
                  <div className="feew-head flex jc-between">
                    <div className="flex ai-center">
                      <span className="text-white">veLT voting dividends</span>
                      <Tips
                        className="m-l-8"
                        title="All users who voted using veLT as their liquidity mining gauge will participate in the distribution of an additional 25% of the platform's fee revenue."
                      />
                    </div>
                    <div className="flex ai-center">
                      <p className="text-normal text-right">≈ {itemData.value} stHOPE</p>
                      <i className={drapIndex ? 'iconfont icon-drap' : 'iconfont icon-drap active'} onClick={drapFn}>
                        &#xe60d;
                      </i>
                    </div>
                  </div>
                  <div className={drapIndex ? 'feew-con hide' : 'feew-con'}>
                    {allData &&
                      allData.length > 0 &&
                      allData.map((data: any, index: number) => {
                        return (
                          <>
                            {data && data.id && (
                              <div key={index} className="flex jc-between m-b-10">
                                <div className="">
                                  <div className="currency text-white text-medium">{data.name}</div>
                                </div>
                                <div>
                                  <p className="text-white text-right">≈ {data.value} stHope</p>
                                  <p className="text-white text-right">≈ $ {data.usdOfValue}</p>
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
          )}
          <ButtonPrimary
            className="hp-button-primary m-t-30"
            onClick={() => {
              onSubmit()
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

export default GaugeClaim
