import React, { useState } from 'react'
import './index.scss'
import { CloseIcon } from '../../../theme/components'
import { ButtonPrimary } from '../../../components/Button'
// import { Decimal } from 'decimal.js'
import { Radio } from 'antd'
import Tips from 'components/Tips'
// import format from 'utils/format'
import { useEstimate } from 'hooks/ahp'
import { useActiveWeb3React } from '../../../hooks'
interface GombocClaimProps {
  onSubmit: any
  onDismiss: () => void
  curWithType: string
  allData?: any
  itemData?: any
}

const GombocClaim = ({ onSubmit, onDismiss, curWithType, allData, itemData }: GombocClaimProps) => {
  const [drapIndex, setDrapIndex] = useState(true)
  const { account } = useActiveWeb3React()
  const isEthBalanceInsufficient = useEstimate()
  const [curClaimType, setCurClaimType] = useState('')
  function changeRadio(item: any) {
    setCurClaimType(item)
  }
  // const allAmount = useMemo(() => {
  //   const res = 0
  //   return res
  // }, [])

  console.log(allData)

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
        <div className="claim-con p-30">
          <Radio.Group
            className="m-t-30 w-100"
            onChange={(e: any) => {
              changeRadio(e.target.value)
            }}
            value={curClaimType}
          >
            {curWithType === 'item' && (
              <div className="radio-item flex jc-between">
                <div className="flex ai-center">
                  <Radio value={`item`}>
                    <span className="text-white">veLT voting dividends</span>
                  </Radio>
                  <Tips title={`Claimable Rewards`} />
                </div>
                <div>
                  <p className="text-white text-right">{itemData.value} stHOPE</p>
                  <p className="text-normal text-right">≈ ${itemData.usdOfValue}</p>
                </div>
              </div>
            )}
            {curWithType === 'others' && (
              <div className="radio-item flex jc-between">
                <div className="flex ai-center">
                  <Radio value={`others`}>
                    <span className="text-white">veLT hold dividends</span>
                  </Radio>
                  <Tips title={`Claimable Rewards`} />
                </div>
                <div>
                  <p className="text-white text-right">{itemData.value} stHOPE</p>
                  <p className="text-normal text-right">≈ ${itemData.usdOfValue}</p>
                </div>
              </div>
            )}
            {curWithType === 'all' && (
              <div>
                {
                  <div className="radio-item">
                    <div className="radio-box-head flex jc-between">
                      <div className="flex ai-center">
                        <Radio value={`all`}>
                          <span className="text-white">veLT voting dividends</span>
                        </Radio>
                        <Tips title={`Claimable Rewards`} />
                      </div>
                      <div className="flex ai-center">
                        <p className="text-normal text-right">≈ {itemData.value} stHOPE</p>
                        <i className={drapIndex ? 'iconfont icon-drap ' : 'iconfont icon-drap active'} onClick={drapFn}>
                          &#xe60d;
                        </i>
                      </div>
                    </div>
                    <div className={drapIndex ? 'radio-box-con hide' : 'radio-box-con'}>
                      {allData &&
                        allData.length > 0 &&
                        allData.map((data: any, index: number) => {
                          return (
                            <>
                              {data && data.id && (
                                <div key={index} className="flex jc-between">
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
          </Radio.Group>
          <ButtonPrimary
            className="hp-button-primary m-t-30"
            disabled={!curClaimType}
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

export default GombocClaim
