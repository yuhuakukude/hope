import React, { useState, useEffect, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import moment from 'moment'
import momentTz from 'moment-timezone'
import { AutoColumn } from '../../components/Column'
import Select from 'components/antd/Select'
import GaugeApi from '../../api/gauge.api'
import NumericalInput from '../../components/NumericalInput'
import { ButtonPrimary } from 'components/Button'
import { useGomConContract, useStakingContract, useLockerContract } from 'hooks/useContract'
import format from '../../utils/format'
import useCurrentBlockTimestamp from 'hooks/useCurrentBlockTimestamp'
import { useCalculator } from '../../hooks/ahp/useCalculator'
import Skeleton from '../../components/Skeleton'
import { useActiveWeb3React } from '../../hooks'
import './index.scss'
import { CurrencyAmount, JSBI, TokenAmount } from '@uniswap/sdk'

const PageWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 0 30px;
  max-width: 1340px;
  min-width: 1210px;
`

export default function DaoGauge() {
  const { account } = useActiveWeb3React()
  const gomContract = useGomConContract()
  const lockerContract = useLockerContract()
  const [curGomAddress, setCurGomAddress] = useState('')
  const stakingContract = useStakingContract(curGomAddress)
  const timestamp = useCurrentBlockTimestamp()
  const [gaugeList, setGaugeList] = useState([])
  const [depositAmount, setDepositAmount] = useState('')
  const [curType, setCurType] = useState('veLT')
  const [totalPoolAmount, setTotalPoolAmount] = useState('')
  const [workingSupply, setWorkingSupply] = useState('')
  const [veLTInputAmount, setVeLTInputAmount] = useState('')
  const [ltInputAmount, setltInputAmount] = useState('')
  const [totalVeLTAmount, setTotalVeLTAmount] = useState('')
  const [weight, setWeight] = useState<CurrencyAmount>()
  const [minVelt, setMinVelt] = useState<TokenAmount>()
  const [currentBoost, setCurrentBoost] = useState<any>()
  const [maxBoost, setMaxBoost] = useState<any>()
  const { getVeLtAmount, getLtRewards, getMinVeltAmount, getBuMin, getBoost, rateLoading } = useCalculator()

  // loading
  const [gaugeListLoading, setGaugeListLoading] = useState(false)
  const [depositLoading, setDepositLoading] = useState(false)
  const [totalLoading, setTotalLoading] = useState(false)
  const [veltTotalLoading, setVeltTotalLoading] = useState(false)
  const [weightLoading, setWeightLoading] = useState(false)

  // const [relAmount, setRelAmount] = useState('')
  const [time, setTime] = useState('2')
  const timeList: any = [
    { label: '2 Weeks', value: '2' },
    { label: '4 Weeks', value: '4' },
    { label: '3 Months', value: '13' },
    { label: '6 Months', value: '26' },
    { label: '1 Year', value: '52' },
    { label: '2 Year', value: '104' },
    { label: '3 Year', value: '156' },
    { label: '4 Year', value: '208' }
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
  function changeTotalVeLTAmount(val: any) {
    setTotalVeLTAmount(val)
  }

  const getUserDepositAmount = async () => {
    if (stakingContract) {
      try {
        setDepositLoading(true)
        const res = await stakingContract.lpBalanceOf(account ?? undefined)
        if (res) {
          setDepositAmount(
            CurrencyAmount.ether(res)
              .toFixed(2)
              .replace(/(?:\.0*|(\.\d+?)0+)$/, '$1')
          )
        } else {
          setDepositAmount('')
        }
        setDepositLoading(false)
      } catch (error) {
        console.log(error)
        setDepositAmount('')
        setDepositLoading(false)
      }
    }
  }

  const lockTimeArg = useMemo(() => {
    const weekDate = moment().day() === 0 ? 7 : moment().day()
    let week4
    if (weekDate >= 4) {
      week4 = moment()
        .subtract(weekDate - 4, 'day')
        .format('YYYY-MM-DD')
    } else {
      week4 = moment()
        .subtract(7 - 4 + weekDate, 'day')
        .format('YYYY-MM-DD')
    }
    return momentTz(moment(week4).add(Number(time), 'week'))
      .tz('Africa/Bissau', true)
      .unix()
  }, [time])

  const veLtAmount = useMemo(() => {
    if (!lockTimeArg || !ltInputAmount) return undefined
    return getVeLtAmount(ltInputAmount, format.formatDate(lockTimeArg))
  }, [ltInputAmount, getVeLtAmount, lockTimeArg])

  const ltRewards = useMemo(() => {
    if (!weight) return undefined
    return getLtRewards(weight)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weight, getLtRewards])

  async function initGaugeList() {
    try {
      setGaugeListLoading(true)
      const res = await GaugeApi.getGaugeList()
      if (res && res.result && res.result.length > 0) {
        setGaugeList(
          res.result.map((e: any) => {
            return { label: e.name, value: e.gauge }
          })
        )
      }
      setGaugeListLoading(false)
    } catch (error) {
      console.log(error)
      setGaugeListLoading(false)
    }
  }

  async function getVeltTotal() {
    if (lockerContract) {
      try {
        setVeltTotalLoading(true)
        const res = await lockerContract.totalSupply()
        if (res) {
          setTotalVeLTAmount(
            CurrencyAmount.ether(res)
              .toFixed(2)
              .replace(/(?:\.0*|(\.\d+?)0+)$/, '$1')
          )
        } else {
          setTotalVeLTAmount('')
        }
        setVeltTotalLoading(false)
      } catch (error) {
        console.log(error)
        setTotalVeLTAmount('')
        setVeltTotalLoading(false)
      }
    }
  }

  async function getRelAmount(val: any) {
    if (gomContract) {
      try {
        setWeightLoading(true)
        const res = await gomContract.gaugeRelativeWeight(val, timestamp?.toString())
        if (res) {
          setWeight(CurrencyAmount.ether(JSBI.multiply(JSBI.BigInt(res), JSBI.BigInt(100))))
        } else {
          setWeight(undefined)
        }
        setWeightLoading(false)
      } catch (error) {
        console.log(error)
        setWeight(undefined)
        setWeightLoading(false)
      }
    }
  }
  async function getPoolTotalAmount() {
    if (stakingContract) {
      try {
        setTotalLoading(true)
        const res = await stakingContract.lpTotalSupply()
        if (res) {
          setTotalPoolAmount(
            CurrencyAmount.ether(res)
              .toFixed(2)
              .replace(/(?:\.0*|(\.\d+?)0+)$/, '$1')
          )
        } else {
          setTotalPoolAmount('')
        }
        setTotalLoading(false)
      } catch (error) {
        console.log(error)
        setTotalPoolAmount('')
        setTotalLoading(false)
      }
    }
  }
  async function getWorkingSupply() {
    if (stakingContract) {
      try {
        const res = await stakingContract.workingSupply()
        if (res) {
          setWorkingSupply(
            CurrencyAmount.ether(res)
              .toFixed(2)
              .replace(/(?:\.0*|(\.\d+?)0+)$/, '$1')
          )
        } else {
          setWorkingSupply('')
        }
      } catch (error) {
        console.log(error)
        setWorkingSupply('')
      }
    }
  }
  function changeSel(val: string) {
    setDepositAmount('')
    setCurGomAddress(val)
    getRelAmount(val)
  }
  const init = useCallback(async () => {
    await initGaugeList()
    await getVeltTotal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toCal() {
    const minVeltRes = getMinVeltAmount(depositAmount, totalPoolAmount, totalVeLTAmount)
    const velt = curType === 'veLT' ? veLTInputAmount : veLtAmount?.toFixed(2)
    const currentBu = getBuMin(depositAmount, totalPoolAmount, velt || '0', totalVeLTAmount)
    const maxBu = getBuMin(depositAmount, totalPoolAmount, minVeltRes?.toFixed(2) || '0', totalVeLTAmount)

    const cboost = getBoost(depositAmount, workingSupply, currentBu || JSBI.BigInt(0))
    const mboost = getBoost(depositAmount, workingSupply, maxBu || JSBI.BigInt(0))
    setMinVelt(minVeltRes)
    setCurrentBoost(cboost)
    setMaxBoost(mboost)
  }

  useEffect(() => {
    init()
  }, [init])

  useEffect(() => {
    if (curGomAddress) {
      getPoolTotalAmount()
      getWorkingSupply()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curGomAddress])
  return (
    <>
      <PageWrapper>
        <div className="dao-calculator-page">
          <div className="dao-cal-con">
            <div className="cal-head">Gauge Boost Calculator</div>
            <div className="cal-con flex">
              <div className="con-left p-30 flex-1">
                <p className="text-normal">Select a Gauge </p>
                <Skeleton loading={gaugeListLoading} height={56} mt={10} radius={'10px'}>
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
                    {gaugeList.map((data: any, index: number) => {
                      return (
                        <Option key={index} value={data.value}>
                          {data.label}
                        </Option>
                      )
                    })}
                  </Select>
                </Skeleton>

                <div className="flex jc-between m-t-20">
                  <span className="text-normal">My Deposit Amount </span>
                  {curGomAddress && account && (
                    <span className="text-primary cursor-select" onClick={getUserDepositAmount}>
                      Use existing deposit
                    </span>
                  )}
                </div>
                <Skeleton loading={depositLoading} height={56} mt={10} radius={'10px'}>
                  <NumericalInput
                    className="hp-amount m-t-10"
                    value={depositAmount}
                    decimals={2}
                    maxLen={18}
                    onUserInput={val => {
                      changeDepAmount(val)
                    }}
                  />
                </Skeleton>

                <p className="text-normal m-t-20">Total Amount of Pool</p>
                <Skeleton loading={totalLoading} height={56} mt={10} radius={'10px'}>
                  <NumericalInput
                    className="hp-amount m-t-10"
                    value={totalPoolAmount}
                    decimals={2}
                    maxLen={18}
                    onUserInput={val => {
                      changeTotalPoolAmount(val)
                    }}
                  />
                </Skeleton>

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
                      maxLen={18}
                      onUserInput={val => {
                        setVeLTInputAmount(val)
                      }}
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex ai-center lt-box">
                      <NumericalInput
                        style={{ width: '160px' }}
                        className="hp-amount m-t-10"
                        value={ltInputAmount}
                        decimals={2}
                        maxLen={18}
                        onUserInput={val => {
                          setltInputAmount(val)
                        }}
                      />
                      <div className="text-center text-normal font-nor m-t-10" style={{ width: '100px' }}>
                        locked for
                      </div>
                      <Select
                        value={time ? time : undefined}
                        placeholder="Select"
                        optionFilterProp="children"
                        onChange={(val: string) => {
                          changeTime(val)
                        }}
                        style={{ width: '120px' }}
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
                    <div className="flex jc-end m-t-16 font-nor text-medium">
                      <span>{veLtAmount ? veLtAmount.toFixed(2, { groupSeparator: ',' }, 0) : '0.00'} veLT</span>
                    </div>
                  </>
                )}
                <p className="text-normal m-t-20">Total veLT</p>
                <Skeleton loading={veltTotalLoading} height={56} mt={10} radius={'10px'}>
                  <NumericalInput
                    className="hp-amount m-t-10"
                    value={totalVeLTAmount}
                    decimals={2}
                    maxLen={18}
                    onUserInput={val => {
                      changeTotalVeLTAmount(val)
                    }}
                  />
                </Skeleton>

                <ButtonPrimary
                  className="hp-button-primary m-t-20"
                  onClick={toCal}
                  disabled={
                    !curGomAddress ||
                    !depositAmount ||
                    !totalPoolAmount ||
                    !totalVeLTAmount ||
                    (curType === 'veLT' && !veLTInputAmount) ||
                    (curType === 'LT' && !veLtAmount)
                  }
                >
                  Calculate
                </ButtonPrimary>
              </div>
              <div className="con-right p-30 flex-1">
                <div className="gauge-info p-b-30 m-b-30">
                  <h3 className="text-white font-18 font-bolder">Gauge info</h3>
                  <div className="flex jc-between m-t-20">
                    <span className="font-normal">Current cycle relative weight</span>
                    <Skeleton loading={weightLoading} width={60}>
                      <span className="font-bolder">{weight ? `${weight.toFixed(2)}%` : '0.00%'}</span>
                    </Skeleton>
                  </div>
                  <div className="flex jc-between m-t-12">
                    <span className="font-normal">LT rewards per day</span>
                    <Skeleton loading={rateLoading || weightLoading} width={100}>
                      <span className="font-bolder">
                        {ltRewards ? ltRewards.toFixed(2, { groupSeparator: ',' }, 0) : '0.00'}
                      </span>
                    </Skeleton>
                  </div>
                </div>
                <div className="summary">
                  <h3 className="text-white font-18 font-bolder">Summary</h3>
                  <div className="flex jc-between m-t-20">
                    <div>
                      <p className="font-normal">Current Boost</p>
                      <p className="text-white font-28 m-t-15 font-bolder">
                        {currentBoost ? `${currentBoost > maxBoost ? maxBoost : currentBoost}x` : '1.00x'}
                      </p>
                    </div>
                    <div>
                      <p className="font-normal">Max boost passible</p>
                      <p className="text-success font-28 m-t-15 font-bolder">{maxBoost ? `${maxBoost}x` : '--'}</p>
                    </div>
                  </div>
                  <div className="m-t-30">
                    <p className="font-normal">Min veLT for Max boost</p>
                    <p className="text-white font-28 m-t-15 font-bolder">
                      {minVelt ? minVelt.toFixed(2, { groupSeparator: ',' }, 0) + ' veLT' : '--'}
                    </p>
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
