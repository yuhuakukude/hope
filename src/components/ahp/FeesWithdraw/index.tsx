import React, { useState, useEffect, useMemo } from 'react'
import './index.scss'
import { CloseIcon } from '../../../theme/components'
import { ButtonPrimary } from '../../../components/Button'
import { Decimal } from 'decimal.js'
import { Radio } from 'antd'
import Tips from 'components/Tips'

interface GombocClaimProps {
  onSubmit: any
  onDismiss: () => void
  curWithType: string
  totalFee: string
  tableData: any
  tableItem: any
}

const GombocClaim = ({ onSubmit, onDismiss, curWithType, totalFee, tableData, tableItem }: GombocClaimProps) => {
  const [curClaimType, setCurClaimType] = useState('')
  const [otherAmount, setOtherAmount] = useState('')
  console.log(curWithType, totalFee, tableData, tableItem)
  function changeRadio(item: any) {
    setCurClaimType(item)
  }
  const allAmount = useMemo(() => {
    let res = 0
    if (totalFee && otherAmount) {
      res = new Decimal(totalFee).sub(new Decimal(otherAmount)).toNumber()
    }
    return res
  }, [totalFee, otherAmount])

  useEffect(() => {
    if (tableData && tableData.length > 0) {
      tableData.forEach((e: any) => {
        if (e && !e.gomboc) {
          setOtherAmount(e.withdrawable)
        }
      })
    }
  }, [tableData])
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
          {curWithType === 'all' && totalFee && (
            <div className="flex jc-between">
              <span className="text-white">Total Claimable Fees</span>
              <span className="text-white">~ {totalFee}</span>
            </div>
          )}
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
                  <p className="text-white text-right">{tableItem.withdrawable} stHOPE</p>
                  <p className="text-normal text-right">~ $--</p>
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
                  <p className="text-white text-right">{tableItem.withdrawable} stHOPE</p>
                  <p className="text-normal text-right">~ $--</p>
                </div>
              </div>
            )}
            {curWithType === 'all' && (
              <div>
                <div className="radio-item flex jc-between">
                  <div className="flex ai-center">
                    <Radio value={`others`}>
                      <span className="text-white">veLT hold dividends</span>
                    </Radio>
                    <Tips title={`Claimable Rewards`} />
                  </div>
                  <div>
                    <p className="text-white text-right">{otherAmount}</p>
                    <p className="text-normal text-right">~ $--</p>
                  </div>
                </div>
                <div className="m-t-30 radio-item">
                  <div className="radio-box-head flex jc-between">
                    <div className="flex ai-center">
                      <Radio value={`all`}>
                        <span className="text-white">veLT voting dividends</span>
                      </Radio>
                      <Tips title={`Claimable Rewards`} />
                    </div>
                    <div>
                      <p className="text-normal text-right">~ {allAmount} stHOPE</p>
                    </div>
                  </div>
                  <div className="radio-box-con">
                    {tableData &&
                      tableData.length > 0 &&
                      tableData.map((data: any, index: number) => {
                        return (
                          <>
                            {data && data.gomboc && (
                              <div key={index} className="flex jc-between">
                                <div className="">
                                  <div className="currency text-white text-medium">{data.gomboc.gombocName}</div>
                                </div>
                                <div>
                                  <p className="text-white text-right">{data.withdrawable} stHope</p>
                                  <p className="text-white text-right">~$ --</p>
                                </div>
                              </div>
                            )}
                          </>
                        )
                      })}
                  </div>
                </div>
              </div>
            )}
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
