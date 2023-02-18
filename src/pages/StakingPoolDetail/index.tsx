import React, { useState, useEffect, useCallback } from 'react'
import { Link, RouteComponentProps } from 'react-router-dom'
import { usePairTxs, useStakingPairPool } from '../../hooks/useLPStaking'
import Row, { AutoRow, AutoRowBetween, RowBetween, RowFixed, RowFlat } from '../../components/Row'
import { AutoColumn } from '../../components/Column'
import CurrencyLogo from '../../components/CurrencyLogo'
import { TYPE } from '../../theme'
import { GreyCard, LightCard } from '../../components/Card'
import { LT } from '../../constants'
import { useActiveWeb3React } from '../../hooks'
import { ButtonGray, ButtonPrimary } from '../../components/Button'
import BasePoolInfoCard, { CardHeader } from '../../components/pool/PoolInfoCard'
import PieCharts from '../../components/pool/PieCharts'
import LineCharts from '../../components/pool/LineCharts'
import BarCharts from '../../components/pool/BarCharts'
import styled from 'styled-components'
import { Decimal } from 'decimal.js'
import { Box } from 'rebass/styled-components'
import Overview, { OverviewData } from '../../components/pool/Overview'
import { useLtMinterContract, useStakingContract } from '../../hooks/useContract'
import { useSingleCallResult } from '../../state/multicall/hooks'
import { JSBI, TokenAmount } from '@uniswap/sdk'
import ClaimRewardModal from '../../components/earn/ClaimRewardModal'
import { calculateGasMargin, shortenAddress } from '../../utils'
import { TransactionResponse } from '@ethersproject/providers'
import { useTransactionAdder } from '../../state/transactions/hooks'
import TransactionConfirmationModal, { TransactionErrorContent } from '../../components/TransactionConfirmationModal'
import { useWalletModalToggle } from '../../state/application/hooks'
import AprApi from '../../api/apr.api'
import format from '../../utils/format'
import { tryParseAmount } from '../../state/swap/hooks'
import { darken } from 'polished'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useLineDaysChartsData, useLine24HourChartsData } from '../../hooks/useCharts'

const TableTitle = styled(TYPE.subHeader)<{ flex?: number }>`
  flex: ${({ flex }) => flex ?? '1'};
  align-items: flex-start;
`

const TxItem = styled(TYPE.subHeader)<{ flex?: number }>`
  flex: ${({ flex }) => flex ?? '1'};
  align-items: flex-start;
  padding: 20px 0;
`

const TxItemWrapper = styled(AutoRow)`
  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.bg3};
  }
`

const StyledTabTitle = styled(TYPE.link)<{ active?: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: center;
  height: 3rem;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme, active }) => (active ? theme.primary1 : theme.text3)};
  font-size: 20px;

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
  }
`

dayjs.extend(utc)

const Circular = styled(Box)<{
  color?: string
}>`
  background: ${({ color }) => color ?? '#E1C991'};
  width: 7px;
  height: 7px;
  border-radius: 50%;
  margin-right: 8px;
`

const TabItem = styled.div<{ isActive?: boolean }>`
  color: ${({ isActive }) => (isActive ? '#E4C989' : '#a8a8aa')};
  font-size: 20px;
  font-family: Arboria-Medium;
  margin-right: 40px;
  cursor: pointer;
  user-select: none;
  position: relative;
  padding-bottom: 12px;
  &:hover {
    color: #e4c989;
  }
  &::after {
    content: '';
    width: 24px;
    height: 2px;
    display: ${({ isActive }) => (isActive ? 'block' : 'none')};
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translate(-50%, 0);
    background: #e4c989;
  }
`

const TimeItem = styled.div<{ isActive?: boolean }>`
  color: #fff;
  font-size: 16px;
  width: 60px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  border-radius: 16px;
  cursor: pointer;
  user-select: none;
  margin-right: 16px;
  background-color: ${({ isActive }) => (isActive ? '#434343' : 'none')};
  &:hover {
    background-color: #434343;
  }
`

const GoBackIcon = styled(Link)`
  text-decoration: none;
  cursor: pointer;
  color: #fff
  font-weight: 500;
  &:hover {
    color: #fff;
  }
`
export default function StakingPoolDetail({
  match: {
    params: { address }
  }
}: RouteComponentProps<{ address: string }>) {
  const { account, chainId, library } = useActiveWeb3React()
  const { result: pool } = useStakingPairPool(address)
  const stakingContract = useStakingContract(pool?.stakingRewardAddress)
  const ltMinterContract = useLtMinterContract()
  const addTransaction = useTransactionAdder()
  const toggleWalletModal = useWalletModalToggle()

  const [showClaimModal, setShowClaimModal] = useState(false)
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [pendingText, setPendingText] = useState('')
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm
  const [txHash, setTxHash] = useState<string>('')
  const [errorStatus, setErrorStatus] = useState<{ code: number; message: string } | undefined>()
  const [showTx, setShowTx] = useState<boolean>(false)

  const txs = usePairTxs(address)

  const earnedRes = useSingleCallResult(stakingContract, 'claimableTokens', [account ?? undefined])
  const earnedAmount = earnedRes?.result?.[0] ? new TokenAmount(LT[chainId ?? 1], earnedRes?.result?.[0]) : undefined

  // charts
  const [tabIndex, setTabIndex] = useState('Volume')
  const [timeIndex, setTimeIndex] = useState('24H')
  const [chartTotal, setChartTotal] = useState<string>('0')
  const [xData, setXData] = useState<string[]>()
  const [yData, setYData] = useState<string[]>()
  const [xCurrentData, setXCurrentData] = useState<string>()
  const [yCurrentData, setYCurrentData] = useState<string>()
  const { result: dayChartResult } = useLineDaysChartsData(address ?? '')
  const { result: hourChartResult } = useLine24HourChartsData(address ?? '')

  const tabChange = (e: string) => {
    setTabIndex(e)
  }
  const timeChange = (e: string) => {
    setTimeIndex(e)
  }

  const getTimeframe = (timeWindow: string) => {
    const utcEndTime = dayjs.utc()
    let utcStartTime = undefined
    if (timeWindow === '7Day') {
      utcStartTime =
        utcEndTime
          .subtract(7, 'day')
          .endOf('day')
          .unix() - 1
    }
    if (timeWindow === '1W') {
      utcStartTime =
        utcEndTime
          .subtract(1, 'week')
          .endOf('day')
          .unix() - 1
    }
    if (timeWindow === '1M') {
      utcStartTime =
        utcEndTime
          .subtract(1, 'month')
          .endOf('day')
          .unix() - 1
    }
    return utcStartTime
  }
  const TabList = () => {
    return (
      <Row>
        {['Volume', 'TVL', 'Fees'].map((item, index) => {
          return (
            <TabItem key={index} isActive={item === tabIndex} onClick={() => tabChange(item)}>
              {item}
            </TabItem>
          )
        })}
      </Row>
    )
  }

  const TimeList = () => {
    return (
      <Row justify={'flex-start'} marginTop={20}>
        {['24H', '1W', '1M'].map((item, index) => {
          return (
            <TimeItem key={index} isActive={item === timeIndex} onClick={() => timeChange(item)}>
              {item}
            </TimeItem>
          )
        })}
      </Row>
    )
  }

  useEffect(() => {
    const utcStartTime = getTimeframe(timeIndex)
    const xArr: string[] = []
    const yArr: string[] = []
    const result = timeIndex === '24H' ? hourChartResult : dayChartResult
    result?.forEach((item: any) => {
      if (timeIndex === '24H') {
        if (tabIndex === 'Volume') {
          yArr.unshift(item.hourlyVolumeUSD?.toFixed(2))
        }
        if (tabIndex === 'TVL') {
          yArr.unshift(item.reserveUSD?.toFixed(2))
        }
        if (tabIndex === 'Fees') {
          yArr.unshift(
            new Decimal(item.hourlyVolumeUSD || 0)
              .mul(new Decimal(0.003))
              .toNumber()
              .toFixed(2)
          )
        }
        // xArr.unshift(format.formatDate(item.hourStartUnix, 'HH:mm'))
        xArr.unshift(item.hourStartUnix)
      } else if (utcStartTime && item.date >= utcStartTime) {
        if (tabIndex === 'Volume') {
          yArr.push(item.dailyVolumeUSD?.toFixed(2))
        }
        if (tabIndex === 'TVL') {
          yArr.push(item.reserveUSD?.toFixed(2))
        }
        if (tabIndex === 'Fees') {
          yArr.push(
            new Decimal(item.dailyVolumeUSD || 0)
              .mul(new Decimal(0.003))
              .toNumber()
              .toFixed(2)
          )
        }
        // xArr.push(format.formatDate(item.date, 'YYYY-MM-DD'))
        xArr.push(item.date)
      }
    })
    setXData(xArr)
    setYData(yArr)
    const totalVal = yArr.reduce((prev, curr) => new Decimal(prev).add(new Decimal(curr)).toNumber(), 0)
    setChartTotal(totalVal.toFixed(2))
  }, [timeIndex, tabIndex, hourChartResult, dayChartResult])

  const viewData: OverviewData[] = [
    {
      title: 'Pool Overview',
      isRise: !!pool && pool.tvlChangeUSD > 0,
      rate: pool ? `${pool.tvlChangeUSD.toFixed(2)} %` : `--`,
      amount: pool ? `$${format.separate(Number(pool.tvl).toFixed(2))}` : `--`
    },
    {
      title: 'Volume(24H)',
      isRise: !!pool && pool.volumeChangeUSD > 0,
      rate: pool ? `${pool.volumeChangeUSD.toFixed(2)} %` : `--`,
      amount: pool ? `$${format.separate(pool.oneDayVolumeUSD.toFixed(2))}` : `--`
    },
    {
      title: 'Fees(24H)',
      isRise: !!pool && pool.volumeChangeUSD > 0,
      rate: pool ? `${pool.volumeChangeUSD.toFixed(2)} %` : `--`,
      amount: pool ? `$${format.separate(pool.dayFees.toFixed(2))}` : `--`
    },
    {
      title: 'Fees(7d)',
      isRise: !!pool && pool.weeklyVolumeChange > 0,
      rate: pool ? `${pool.weeklyVolumeChange.toFixed(2)} %` : `--`,
      amount: pool ? `$${format.separate(pool.weekFees.toFixed(2))}` : `--`
    }
  ]

  const onTxStart = useCallback(() => {
    setShowConfirm(true)
    setAttemptingTxn(true)
  }, [])

  const onTxSubmitted = useCallback((hash: string | undefined) => {
    setShowConfirm(true)
    setPendingText(``)
    setAttemptingTxn(false)
    hash && setTxHash(hash)
  }, [])

  const onTxError = useCallback(error => {
    setShowConfirm(true)
    setTxHash('')
    setPendingText(``)
    setAttemptingTxn(false)
    setErrorStatus({ code: error?.code, message: error.message })
  }, [])

  const onClaim = useCallback(async () => {
    if (!account) throw new Error('none account')
    if (!ltMinterContract) throw new Error('none contract')
    const method = 'mint'
    const args = [pool?.stakingRewardAddress]
    return ltMinterContract.estimateGas[method](...args, { from: account }).then(estimatedGasLimit => {
      return ltMinterContract[method](...args, {
        gasLimit: calculateGasMargin(estimatedGasLimit),
        // gasLimit: '3500000',
        from: account
      }).then((response: TransactionResponse) => {
        addTransaction(response, {
          summary: `Claim ${earnedAmount?.toFixed(2)} LT`
        })
        return response.hash
      })
    })
  }, [account, addTransaction, earnedAmount, ltMinterContract, pool])

  const onClaimCallback = useCallback(async () => {
    if (!account || !library || !chainId || !pool || !earnedAmount) return
    setPendingText(`Claim ${earnedAmount?.toFixed(2)} LT`)
    onTxStart()
    // sign
    onClaim()
      .then(hash => {
        onTxSubmitted(hash)
      })
      .catch((error: any) => {
        onTxError(error)
        throw error
      })
  }, [account, library, chainId, pool, earnedAmount, onTxStart, onClaim, onTxSubmitted, onTxError])

  const confirmationContent = useCallback(() => {
    return (
      errorStatus && (
        <TransactionErrorContent
          errorCode={errorStatus.code}
          onDismiss={() => setShowConfirm(false)}
          message={errorStatus.message}
        />
      )
    )
  }, [errorStatus])
  const [aprInfo, setAprInfo] = useState<any>({})

  const getCurrentData = (xCurrent: string, yCurrent: string) => {
    setXCurrentData(xCurrent)
    setYCurrentData(yCurrent)
  }

  const initFn = useCallback(async () => {
    if (!address) return
    const res = await AprApi.getHopeFeeApr(address)
    if (res && res.result) {
      setAprInfo(res.result)
    }
  }, [address])

  useEffect(() => {
    initFn()
  }, [initFn])

  return (
    <AutoColumn style={{ width: '100%', padding: '0 30px' }}>
      {pool && (
        <ClaimRewardModal
          isOpen={showClaimModal}
          onDismiss={() => setShowClaimModal(false)}
          onClaim={onClaimCallback}
          stakingInfo={pool}
        />
      )}
      <TransactionConfirmationModal
        isOpen={showConfirm}
        onDismiss={() => setShowConfirm(false)}
        attemptingTxn={attemptingTxn}
        hash={txHash}
        content={confirmationContent}
        pendingText={pendingText}
      />
      <AutoRow justify={'space-between'} padding={'0 30px'}>
        <TYPE.white fontSize={28} fontWeight={700}>
          <GoBackIcon to={'/swap/pools'}>
            <i className="iconfont font-28 m-r-20 cursor-select">&#xe61a;</i>
          </GoBackIcon>
          {`${pool?.tokens[0].symbol || '-'}/${pool?.tokens[1].symbol || '-'}`}
        </TYPE.white>
        <RowFlat>
          <ButtonPrimary
            as={Link}
            width={'100px'}
            style={{ marginRight: '20px' }}
            to={`/swap/exchange/?inputCurrency=${pool?.tokens?.[0].address}&outputCurrency=${pool?.tokens?.[1].address}`}
          >
            Trade
          </ButtonPrimary>
          <ButtonPrimary
            as={Link}
            width={'150px'}
            to={`/swap/add/?inputCurrency=${pool?.tokens?.[0].address}&outputCurrency=${pool?.tokens?.[1].address}`}
          >
            Add Liquidity
          </ButtonPrimary>
        </RowFlat>
      </AutoRow>
      <AutoRow style={{ margin: 0 }} padding={'30px 0px'} gap={'15px'} align={''}>
        <AutoColumn style={{ flex: 4 }}>
          <LightCard padding={'30px'}>
            <RowBetween>
              <Row>
                <PieCharts data={[50, 50]}></PieCharts>
                <div className="m-l-20">
                  <Row>
                    <Circular></Circular>
                    <CurrencyLogo currency={pool?.tokens[0]} />
                    <TYPE.body marginLeft={9}>
                      {pool?.token0Amount.toFixed(2, { groupSeparator: ',' })} {pool?.tokens[0].symbol}
                      {!!pool?.token0Amount && ' (50%)'}
                    </TYPE.body>
                  </Row>
                  <Row margin={'35px 0 0 0'}>
                    <Circular color={'#8FFBAE'}></Circular>
                    <CurrencyLogo currency={pool?.tokens[1]} />
                    <TYPE.body marginLeft={9}>
                      {pool?.token1Amount.toFixed(2, { groupSeparator: ',' })} {pool?.tokens[1].symbol}
                      {!!pool?.token1Amount && ' (50%)'}
                    </TYPE.body>
                  </Row>
                </div>
              </Row>
              <div style={{ width: '286px' }}>
                <Row>
                  <div>
                    <TYPE.body>Base APR</TYPE.body>
                    <TYPE.white fontSize={30} marginTop={12} fontFamily={'Arboria-Medium'}>
                      {format.rate(aprInfo.ltApr)}
                    </TYPE.white>
                  </div>
                  <div className="m-l-30">
                    <TYPE.body>
                      After <span className="text-primary">Boost</span>
                    </TYPE.body>
                    <TYPE.green fontSize={30} marginTop={12} fontFamily={'Arboria-Medium'}>
                      {format.rate(aprInfo.baseApr)}{' '}
                    </TYPE.green>
                  </div>
                </Row>
                <p className="m-t-15 text-normal">Fees: {format.rate(aprInfo.feeApr)} </p>
                {aprInfo.rewardRate && (
                  <p className="m-t-10 text-normal">
                    Rewards: {format.rate(aprInfo.rewardRate)} (
                    {tryParseAmount(aprInfo?.ltAmountPerDay, LT[chainId ?? 1])?.toFixed(2, { groupSeparator: ',' })} LT
                    per day){' '}
                  </p>
                )}
              </div>
            </RowBetween>
            {pool && (
              <Row marginTop={30}>
                <CurrencyLogo currency={pool?.tokens[1]} />
                <TYPE.body marginLeft={9} marginRight={40}>
                  1.00 {pool?.tokens[0].symbol} = {format.separate(pool?.token1Price ?? 0)} {pool?.tokens[1].symbol}
                </TYPE.body>
                <CurrencyLogo currency={pool?.tokens[0]} />
                <TYPE.body marginLeft={9}>
                  {' '}
                  1.00 {pool?.tokens[1].symbol} = {format.separate(pool?.token0Price ?? 0)} {pool?.tokens[0].symbol}
                </TYPE.body>
              </Row>
            )}
          </LightCard>
          <Overview viewData={viewData} smallSize={true}></Overview>
          <LightCard style={{ marginTop: '20px' }} padding={'30px 30px 20px'}>
            <div style={{ height: '435px' }}>
              <div className="charts-tab">
                <Row justify={'space-between'} align={'flex-start'}>
                  <div>
                    <TabList></TabList>
                    <TimeList></TimeList>
                  </div>
                  {!!yCurrentData && (
                    <div>
                      <p className="text-success font-20 text-medium text-right">
                        $ {format.amountFormat(yCurrentData, 2)}
                      </p>
                      <p className="font-nor text-right m-t-12">
                        {xCurrentData === 'total' ? `Last ${timeIndex}` : xCurrentData}
                      </p>
                    </div>
                  )}
                </Row>
              </div>
              {tabIndex === 'TVL' ? (
                <LineCharts
                  xData={xData}
                  yData={yData}
                  height={330}
                  total={chartTotal}
                  is24Hour={timeIndex === '24H'}
                  getCurrentData={getCurrentData}
                ></LineCharts>
              ) : (
                <BarCharts
                  xData={xData}
                  yData={yData}
                  total={chartTotal}
                  bottom={10}
                  height={330}
                  is24Hour={timeIndex === '24H'}
                  getCurrentData={getCurrentData}
                ></BarCharts>
              )}
            </div>
          </LightCard>
        </AutoColumn>
        <AutoColumn gap={'30px'} style={{ flex: 3 }}>
          <LightCard padding={'0'}>
            <CardHeader>
              <RowBetween>
                <TYPE.white fontSize={20} fontWeight={700}>
                  My Rewards
                </TYPE.white>
                <TYPE.white fontSize={20}>{earnedAmount ? earnedAmount.toFixed(2) : '--'}</TYPE.white>
              </RowBetween>
            </CardHeader>
            <AutoColumn style={{ padding: 30 }} gap={'lg'}>
              <RowBetween>
                <RowFixed>
                  <CurrencyLogo currency={LT[chainId ?? 1]} />
                  <TYPE.white ml={'10px'}>LT</TYPE.white>
                </RowFixed>
                <RowFixed gap={'10px'}>
                  <TYPE.main>{earnedAmount ? earnedAmount.toFixed(2) : '--'}</TYPE.main>
                  {earnedAmount && earnedAmount.greaterThan(JSBI.BigInt(0)) && (
                    <TYPE.link ml={'10px'} style={{ cursor: 'pointer' }} onClick={() => setShowClaimModal(true)}>
                      claim
                    </TYPE.link>
                  )}
                </RowFixed>
              </RowBetween>
              {account ? (
                <ButtonPrimary as={Link} to={'/dao/gomboc'}>
                  Yield Boost
                </ButtonPrimary>
              ) : (
                <ButtonPrimary onClick={toggleWalletModal} fontSize={20}>
                  {'Connect to wallet'}
                </ButtonPrimary>
              )}
            </AutoColumn>
          </LightCard>
          <LightCard>
            <CardHeader>
              <TYPE.white fontSize={20} fontWeight={700}>
                My Rewards
              </TYPE.white>
              <TYPE.white fontSize={20}>{''}</TYPE.white>
            </CardHeader>
            <BasePoolInfoCard pool={pool} />
            {pool?.stakingRewardAddress && (
              <AutoRowBetween gap={'30px'}>
                <ButtonGray as={Link} to={`/swap/withdraw/${pool?.stakingRewardAddress}`}>
                  Unstaking
                </ButtonGray>
                <ButtonPrimary as={Link} to={`/swap/stake/${pool?.stakingRewardAddress}`}>
                  Staking
                </ButtonPrimary>
              </AutoRowBetween>
            )}
          </LightCard>
        </AutoColumn>
      </AutoRow>
      <AutoRow padding={'0 15px'}>
        <LightCard>
          <AutoColumn>
            <AutoRow gap={'20px'}>
              <StyledTabTitle onClick={() => setShowTx(false)} active={!showTx}>
                Information
              </StyledTabTitle>
              <StyledTabTitle
                onClick={() => {
                  setShowTx(true)
                }}
                active={showTx}
              >
                Transaction
              </StyledTabTitle>
            </AutoRow>
            {showTx ? (
              <>
                <GreyCard marginTop={30}>
                  <AutoRow>
                    <TableTitle>All</TableTitle>
                    <TableTitle>Total Value</TableTitle>
                    <TableTitle>Token Amount</TableTitle>
                    <TableTitle>Token Amount</TableTitle>
                    <TableTitle>Account</TableTitle>
                    <TableTitle>Time (UTC)</TableTitle>
                  </AutoRow>
                </GreyCard>

                <LightCard padding={'0 10px 10px'}>
                  <TxItemWrapper>
                    {txs.result.map(tx => {
                      return (
                        <AutoRow key={tx.transaction.id} style={{ borderBottom: '1px solid #3D3E46' }}>
                          <TxItem>
                            <TYPE.link>{`${tx.pair.token0.symbol}-${tx.pair.token1.symbol}`}</TYPE.link>
                          </TxItem>
                          <TxItem>
                            <TYPE.subHeader>{`$${Number(tx.amountUSD).toFixed(2)}`}</TYPE.subHeader>
                          </TxItem>
                          <TxItem>
                            <TYPE.subHeader>{`${Number(tx.amount0).toFixed(2)} ${
                              tx.pair.token0.symbol
                            }`}</TYPE.subHeader>
                          </TxItem>
                          <TxItem>
                            <TYPE.subHeader>{`${Number(tx.amount1).toFixed(2)} ${
                              tx.pair.token1.symbol
                            }`}</TYPE.subHeader>
                          </TxItem>
                          <TxItem>
                            <TYPE.subHeader>{`${shortenAddress(tx.sender)}`}</TYPE.subHeader>
                          </TxItem>
                          <TxItem>
                            <TYPE.subHeader>{`${Date.parse(tx.transaction.timestamp)}`}</TYPE.subHeader>
                          </TxItem>
                        </AutoRow>
                      )
                    })}
                  </TxItemWrapper>
                </LightCard>
              </>
            ) : (
              <>
                <GreyCard marginTop={30}>
                  <AutoRow>
                    <TableTitle>Contract Address</TableTitle>
                    <TableTitle>Creation Time(UTC)</TableTitle>
                    <TableTitle flex={0.8}>Creator</TableTitle>
                    <TableTitle flex={0.8}>Fee Rate</TableTitle>
                    <TableTitle flex={1.5}>Total Swap Volume</TableTitle>
                    <TableTitle>Total Swap Fee</TableTitle>
                    <TableTitle>Total Number of Trad</TableTitle>
                  </AutoRow>
                </GreyCard>

                <LightCard>
                  <AutoRow align={'flex-start'}>
                    <TableTitle>{shortenAddress(address)}</TableTitle>
                    <TableTitle>2022/01/21 15:02:39</TableTitle>
                    <TableTitle flex={0.8}>{shortenAddress(address)}</TableTitle>
                    <TableTitle flex={0.8}>0.30%</TableTitle>
                    <AutoColumn gap={'lg'} style={{ flex: 1.5 }}>
                      <TableTitle>{pool ? `$${pool.totalVolume.toFixed(2)}` : '--'}</TableTitle>
                      <AutoRow gap={'5px'}>
                        <CurrencyLogo currency={pool?.tokens[0]} />
                        <TYPE.main>
                          {pool?.volume0Amount ? `${pool.volume0Amount.toFixed(2)} ${pool?.tokens[0].symbol}` : '--'}
                        </TYPE.main>
                      </AutoRow>
                      <AutoRow gap={'5px'}>
                        <CurrencyLogo currency={pool?.tokens[0]} />
                        <TYPE.main>
                          {pool?.volume0Amount ? `${pool.volume0Amount.toFixed(2)} ${pool?.tokens[0].symbol}` : '--'}
                        </TYPE.main>
                      </AutoRow>
                    </AutoColumn>
                    <TableTitle>{pool ? (pool.totalVolume * 0.003).toFixed() : '--'}</TableTitle>
                    <TableTitle>0</TableTitle>
                  </AutoRow>
                </LightCard>
              </>
            )}
          </AutoColumn>
        </LightCard>
      </AutoRow>
    </AutoColumn>
  )
}
