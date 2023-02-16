import React, { useState, useEffect, useMemo } from 'react'
import './index.scss'
import { CloseIcon } from '../../../theme/components'
import { ButtonPrimary } from '../../../components/Button'
import { Decimal } from 'decimal.js'
import { Radio } from 'antd'
import Tips from 'components/Tips'
import { toUsdPrice } from 'hooks/ahp/usePortfolio'
import format from 'utils/format'

interface GombocClaimProps {
  onSubmit: any
  onDismiss: () => void
  curWithType: string
  totalFee: string
  tableData: any
  tableItem: any
  hopePrice: string
}

const GombocClaim = ({
  onSubmit,
  onDismiss,
  curWithType,
  totalFee,
  tableData,
  tableItem,
  hopePrice
}: GombocClaimProps) => {
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

  function isDis(val: any) {
    let res = false
    if (!val) {
      res = true
    }
    return res
  }

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
              <span className="text-white">~ {format.amountFormat(totalFee, 2)}</span>
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
                  <Radio
                    disabled={tableItem && tableItem.withdrawable && Number(tableItem.withdrawable) <= 0}
                    value={`item`}
                  >
                    <span className="text-white">veLT voting dividends</span>
                  </Radio>
                  <Tips title={`Claimable Rewards`} />
                </div>
                <div>
                  <p className="text-white text-right">{format.amountFormat(tableItem.withdrawable, 2)} stHOPE</p>
                  <p className="text-normal text-right">~ ${toUsdPrice(tableItem.withdrawable, hopePrice) || '--'}</p>
                </div>
              </div>
            )}
            {curWithType === 'others' && (
              <div className="radio-item flex jc-between">
                <div className="flex ai-center">
                  <Radio
                    disabled={tableItem && tableItem.withdrawable && Number(tableItem.withdrawable) <= 0}
                    value={`others`}
                  >
                    <span className="text-white">veLT hold dividends</span>
                  </Radio>
                  <Tips title={`Claimable Rewards`} />
                </div>
                <div>
                  <p className="text-white text-right">{format.amountFormat(tableItem.withdrawable, 2)} stHOPE</p>
                  <p className="text-normal text-right">~ ${toUsdPrice(tableItem.withdrawable, hopePrice) || '--'}</p>
                </div>
              </div>
            )}
            {curWithType === 'all' && (
              <div>
                <div className="radio-item flex jc-between">
                  <div className="flex ai-center">
                    <Radio disabled={isDis(otherAmount)} value={`others`}>
                      <span className="text-white">veLT hold dividends</span>
                    </Radio>
                    <Tips title={`Claimable Rewards`} />
                  </div>
                  <div>
                    <p className="text-white text-right">{format.amountFormat(otherAmount, 2)}</p>
                    <p className="text-normal text-right">~ ${toUsdPrice(otherAmount, hopePrice) || '--'}</p>
                  </div>
                </div>
                <div className="m-t-30 radio-item">
                  <div className="radio-box-head flex jc-between">
                    <div className="flex ai-center">
                      <Radio disabled={isDis(allAmount)} value={`all`}>
                        <span className="text-white">veLT voting dividends</span>
                      </Radio>
                      <Tips title={`Claimable Rewards`} />
                    </div>
                    <div>
                      <p className="text-normal text-right">~ {format.amountFormat(allAmount, 2)} stHOPE</p>
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
                                  <p className="text-white text-right">
                                    {format.amountFormat(data.withdrawable, 2)} stHope
                                  </p>
                                  <p className="text-white text-right">
                                    ~$ {toUsdPrice(data.withdrawable, hopePrice) || '--'}
                                  </p>
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
            disabled={!curClaimType}
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
