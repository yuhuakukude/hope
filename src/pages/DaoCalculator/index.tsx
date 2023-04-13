import React, { useState, useEffect, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { AutoColumn } from '../../components/Column'
import Select from 'components/antd/Select'
import GaugeApi from '../../api/gauge.api'
import NumericalInput from '../../components/NumericalInput'
import { ButtonPrimary } from 'components/Button'
import { useGomConContract } from 'hooks/useContract'
import useCurrentBlockTimestamp from 'hooks/useCurrentBlockTimestamp'
import './index.scss'

const PageWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 0 30px;
  max-width: 1340px;
  min-width: 1210px;
`

export default function DaoGauge() {
  const gomContract = useGomConContract()
  const timestamp = useCurrentBlockTimestamp()
  const [curGomAddress, setCurGomAddress] = useState('')
  const [gaugeList, setGaugeList] = useState([])
  const [depositAmount, setDepositAmount] = useState('')
  const [curType, setCurType] = useState('veLT')
  const [totalPoolAmount, setTotalPoolAmount] = useState('')
  const [veLTInputAmount, setVeLTInputAmount] = useState('')
  const [totalVeLTAmount, setTotalVeLTAmount] = useState('')
  // const [relAmount, setRelAmount] = useState('')
  const [time, setTime] = useState('')
  const timeList: any = [
    {
      label: '2 Weeks',
      value: '2'
    },
    {
      label: '4 Weeks',
      value: '2'
    },
    {
      label: '3 Months',
      value: '2'
    },
    {
      label: '6 Months',
      value: '2'
    },
    {
      label: '1 Year',
      value: '2'
    },
    {
      label: '2 Year',
      value: '2'
    },
    {
      label: '3 Year',
      value: '2'
    },
    {
      label: '4 Year',
      value: '2'
    }
  ]
  const { Option } = Select
  function changeTime(val: string) {
    setTime(val)
  }
  function changeDepAmount(val: any) {
    setDepositAmount(val)
  }
  function changeTotalPoolAmount(val: any) {
    setTotalPoolAmount(val)
  }
  function changeVeLTInputAmount(val: any) {
    setVeLTInputAmount(val)
  }
  function changeTotalVeLTAmount(val: any) {
    setTotalVeLTAmount(val)
  }
  async function initGaugeList() {
    try {
      const res = await GaugeApi.getGaugeList()
      if (res && res.result && res.result.length > 0) {
        setGaugeList(res.result)
      }
    } catch (error) {
      console.log(error)
    }
  }
  async function getRelAmount(val: any) {
    if (gomContract) {
      try {
        const res = await gomContract.gaugeRelativeWeight(val, timestamp?.toString())
        if (res) {
          console.log(res)
        }
      } catch (error) {
        console.log(error)
      }
    }
  }
  function changeSel(val: string) {
    setCurGomAddress(val)
    getRelAmount(val)
  }
  const selList = useMemo(() => {
    if (gaugeList) {
      const arr: any = []
      gaugeList.forEach((e: any) => {
        const item = {
          label: e.name,
          value: e.gauge
        }
        arr.push(item)
      })
      return arr
    } else {
      return []
    }
  }, [gaugeList])
  const init = useCallback(async () => {
    await initGaugeList()
  }, [])
  function toCal() {
    console.log('cal')
  }

  useEffect(() => {
    init()
  }, [init])
  return (
    <>
      <PageWrapper>
        <div className="dao-calculator-page">
          <div className="dao-cal-con">
            <div className="cal-head">Gauge Boost Calculator</div>
            <div className="cal-con flex">
              <div className="con-left p-30 flex-1">
                <p className="text-normal">Select a Gauge </p>
                <Select
                  value={curGomAddress ? curGomAddress : undefined}
                  placeholder="Select a Gauge"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.props.children
                      ? `${option.props.children}`.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      : true
                  }
                  onChange={(val: string) => {
                    changeSel(val)
                  }}
                  className="hp-select m-t-10"
                >
                  {selList.map((data: any, index: number) => {
                    return (
                      <Option key={index} value={data.value}>
                        {data.label}
                      </Option>
                    )
                  })}
                </Select>
                <div className="flex jc-between m-t-20">
                  <span className="text-normal">My Deposit Amount </span>
                  <span className="text-primary">Use exsisting deposit</span>
                </div>
                <NumericalInput
                  className="hp-amount m-t-10"
                  value={depositAmount}
                  decimals={2}
                  onUserInput={val => {
                    changeDepAmount(val)
                  }}
                />
                <p className="text-normal m-t-20">Total Amount of Pool</p>
                <NumericalInput
                  className="hp-amount m-t-10"
                  value={totalPoolAmount}
                  decimals={2}
                  onUserInput={val => {
                    changeTotalPoolAmount(val)
                  }}
                />
                <div className="m-t-20">
                  <div className={['add-tab', 'flex', curType === 'LT' ? 'my-active' : ''].join(' ')}>
                    <div
                      className={[
                        'item-tab',
                        'flex-1',
                        'font-nor',
                        'text-medium',
                        curType === 'veLT' ? 'active' : ''
                      ].join(' ')}
                      onClick={() => setCurType('veLT')}
                    >
                      veLT
                    </div>
                    <div
                      className={[
                        'item-tab',
                        'flex-1',
                        'font-nor',
                        'text-medium',
                        curType === 'LT' ? 'active' : ''
                      ].join(' ')}
                      onClick={() => setCurType('LT')}
                    >
                      LT
                    </div>
                  </div>
                </div>
                <p className="text-normal m-t-20">{curType === 'veLT' ? 'My veLT' : 'My LT'}</p>
                {curType === 'veLT' ? (
                  <div>
                    <NumericalInput
                      className="hp-amount m-t-10"
                      value={veLTInputAmount}
                      decimals={2}
                      onUserInput={val => {
                        changeVeLTInputAmount(val)
                      }}
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex ai-center lt-box">
                      <NumericalInput
                        style={{ width: '160px' }}
                        className="hp-amount m-t-10"
                        value={veLTInputAmount}
                        decimals={2}
                        onUserInput={val => {
                          changeVeLTInputAmount(val)
                        }}
                      />
                      <div className="text-center" style={{ width: '85px' }}>
                        locked for
                      </div>
                      <Select
                        value={time ? time : undefined}
                        placeholder="Select"
                        optionFilterProp="children"
                        onChange={(val: string) => {
                          changeTime(val)
                        }}
                        style={{ width: '125px' }}
                        className="hp-select m-t-10"
                      >
                        {timeList.map((data: any, index: number) => {
                          return (
                            <Option key={index} value={data.value}>
                              {data.label}
                            </Option>
                          )
                        })}
                      </Select>
                    </div>
                    <div className="flex jc-end m-t-12">
                      <span>2,139.49 veLT</span>
                    </div>
                  </>
                )}
                <p className="text-normal m-t-20">Total veLT</p>
                <NumericalInput
                  className="hp-amount m-t-10"
                  value={totalVeLTAmount}
                  decimals={2}
                  onUserInput={val => {
                    changeTotalVeLTAmount(val)
                  }}
                />
                <ButtonPrimary className="hp-button-primary m-t-20" onClick={toCal}>
                  Calculate
                </ButtonPrimary>
              </div>
              <div className="con-right p-30 flex-1">
                <div className="gauge-info p-b-30 m-b-30">
                  <h3 className="text-white font-18 font-bolder">Gauge info</h3>
                  <div className="flex jc-between m-t-20">
                    <span className="font-normal">Current cycle relative weight</span>
                    <span className="font-bolder">19.89%</span>
                  </div>
                  <div className="flex jc-between m-t-12">
                    <span className="font-normal">LT rewards per day</span>
                    <span className="font-bolder">23,456,89.10</span>
                  </div>
                </div>
                <div className="summary">
                  <h3 className="text-white font-18 font-bolder">Summary</h3>
                  <div className="flex jc-between m-t-20">
                    <div>
                      <p className="font-normal">Current Boost</p>
                      <p className="text-white font-28 m-t-15 font-bolder">1.00x</p>
                    </div>
                    <div>
                      <p className="font-normal">Max boost passible</p>
                      <p className="text-success font-28 m-t-15 font-bolder">1.00x</p>
                    </div>
                  </div>
                  <div className="m-t-30">
                    <p className="font-normal">Min veLT for Max boost</p>
                    <p className="text-white font-28 m-t-15 font-bolder">278,384,839.49 veLT</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    </>
  )
}
