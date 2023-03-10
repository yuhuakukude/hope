import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { RouteComponentProps, useHistory } from 'react-router-dom'
import { usePairTxs, useStakingPairPool } from '../../hooks/useLPStaking'
import Row, { AutoRow, AutoRowBetween, RowBetween, RowFixed } from '../../components/Row'
import { AutoColumn } from '../../components/Column'
import CurrencyLogo from '../../components/CurrencyLogo'
import { TYPE, ExternalLink } from '../../theme'
import Card, { GreyCard, LightCard } from '../../components/Card'
import { LT } from '../../constants'
import { useActiveWeb3React } from '../../hooks'
import { ButtonOutlined, ButtonPrimary } from '../../components/Button'
import { CardHeader } from '../../components/pool/PoolInfoCard'
import PieCharts from '../../components/pool/PieCharts'
import LineCharts from '../../components/pool/LineCharts'
import BarCharts from '../../components/pool/BarCharts'
import styled from 'styled-components'
import { Decimal } from 'decimal.js'
import { Box } from 'rebass/styled-components'
import Overview, { OverviewData } from '../../components/pool/Overview'
import ClaimRewardModal from '../../components/earn/ClaimRewardModal'
import { shortenAddress, getEtherscanLink } from '../../utils'
import AprApi from '../../api/apr.api'
import format, { amountFormat, formatUTCDate } from '../../utils/format'
import { tryParseAmount } from '../../state/swap/hooks'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useLineDaysChartsData, useLine24HourChartsData } from '../../hooks/useCharts'
import SelectTips, { TitleTipsProps } from '../Portfolio/component/SelectTips'
import DoubleCurrencyLogo from '../../components/DoubleLogo'
import { usePosition, useStakePosition } from '../../hooks/usePosition'
import { ArrowRight } from 'react-feather'
import { useWalletModalToggle } from '../../state/application/hooks'
import { usePairStakeInfo } from '../../hooks/usePairInfo'
import { JSBI, WETH } from '@uniswap/sdk'
import { tokenId, tokenSymbol } from '../../utils/currencyId'
import { useTokenPriceObject } from '../../hooks/liquidity/useBasePairs'

const TableTitle = styled(TYPE.subHeader)<{ flex?: number }>`
  flex: ${({ flex }) => flex ?? '1'};
  align-items: flex-start;
  color: ${({ theme }) => theme.text2};
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

// const StyledTabTitle = styled(TYPE.link)<{ active?: boolean }>`
//   ${({ theme }) => theme.flexRowNoWrap}
//   align-items: center;
//   justify-content: center;
//   height: 3rem;
//   border-radius: 3rem;
//   outline: none;
//   cursor: pointer;
//   text-decoration: none;
//   color: ${({ theme, active }) => (active ? theme.primary1 : theme.text3)};
//   font-size: 20px;
//
//   :hover,
//   :focus {
//     color: ${({ theme }) => darken(0.1, theme.text1)};
//   }
// `

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
  color: ${({ isActive, theme }) => (isActive ? theme.text1 : '#a8a8aa')};
  width: 118px;
  height: 38px;
  border-radius: 8px;
  font-size: 16px;
  font-family: Arboria-Medium;
  cursor: pointer;
  user-select: none;
  position: relative;
  z-index: 2;
  // background: ${({ isActive, theme }) => (isActive ? theme.bg3 : theme.bg5)};
  text-align: center;
  line-height: 38px;

  &:hover {
    color: ${({ theme }) => theme.text1};
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
const RateTag = styled.div`
  color: #a8a8aa;
  font-size: 14px;
  width: 50px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  border-radius: 10px;
  margin-left: 10px;
  background-color: #26262c;
`

const GoBackIcon = styled.span`
  text-decoration: none;
  cursor: pointer;
  color: #fff;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    color: #fff;
  }
`

const TabWrapper = styled(Row)<{ flexW?: number; left: number }>`
  padding: 2px;
  width: fit-content;
  background-color: ${({ theme }) => theme.bg5};
  border-radius: 8px;
  position: relative;
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: ${({ left }) => (left ? `${left}%` : '0')};
    height: 100%;
    width: ${({ flexW }) => (flexW ? `${flexW}%` : '50%')};
    border-radius: 8px;
    background-color: #3d3e46;
    box-sizing: border-box;
    transition: all ease 0.25s;
    border: 2px solid #1b1b1f;
  }
`

const NoStakingWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

export default function StakingPoolDetail({
  match: {
    params: { address }
  }
}: RouteComponentProps<{ address: string }>) {
  const { account, chainId } = useActiveWeb3React()
  const history = useHistory()
  const chainWETH = WETH[chainId ?? 1]
  const { result: pool, pairMore } = useStakingPairPool(address)
  const { claimAbleRewards, currentBoots, futureBoots, relativeWeight } = usePairStakeInfo(pool?.stakingRewardAddress)
  const toggleWalletModal = useWalletModalToggle()
  const addresses = useMemo(() => {
    return [pool?.tokens[0].address ?? '', pool?.tokens[1].address ?? '']
  }, [pool])
  const { result: priceResult } = useTokenPriceObject(addresses)
  const token0Symbol = tokenSymbol(chainWETH, pool?.tokens[0])
  const token1Symbol = tokenSymbol(chainWETH, pool?.tokens[1])

  const [showClaimModal, setShowClaimModal] = useState(false)
  const [showTx, setShowTx] = useState<boolean>(false)
  const [transactionType, setTransactionType] = useState('All')
  const txs = usePairTxs(address, transactionType)
  //const stakedAmount = useTokenBalance(account ?? undefined, pool?.stakingToken)

  const { token0Deposited, token1Deposited, balance } = usePosition(pool?.pair)
  const { token0Staked, token1Staked, stakedLpAmount } = useStakePosition(pool)

  const userTotalBalance = stakedLpAmount && balance ? stakedLpAmount?.add(balance) : balance
  const userToken0 = token0Deposited && token0Staked ? token0Deposited.add(token0Staked) : token0Deposited
  const userToken1 = token1Deposited && token1Staked ? token1Deposited.add(token1Staked) : token1Deposited
  // charts
  const [tabIndex, setTabIndex] = useState('Volume')
  const [timeIndex, setTimeIndex] = useState('24H')
  const [xData, setXData] = useState<string[]>()
  const [yData, setYData] = useState<string[]>()
  const { result: dayChartResult } = useLineDaysChartsData(address ?? '')
  const { result: hourChartResult } = useLine24HourChartsData(address ?? '')

  const token0PriceUSD =
    priceResult && pool?.tokens[0].address ? Number(priceResult[pool.tokens[0].address.toLowerCase()]) : undefined
  const token1PriceUSD =
    priceResult && pool?.tokens[1].address ? Number(priceResult[pool.tokens[1].address.toLowerCase()]) : undefined

  const token0USD =
    pool?.token0Amount && token0PriceUSD ? Number(pool?.token0Amount.toExact().toString()) * token0PriceUSD : undefined
  const token1USD =
    pool?.token1Amount && token1PriceUSD ? Number(pool?.token1Amount.toExact().toString()) * token1PriceUSD : undefined

  const totalUSD =
    pool?.token0Amount && pool.token1Amount && token0PriceUSD && token1PriceUSD
      ? Number(pool?.token0Amount.toExact().toString()) * token0PriceUSD +
        Number(pool?.token1Amount.toExact().toString()) * token1PriceUSD
      : undefined
  const token0Percent = token0USD && totalUSD ? (token0USD / totalUSD) * 100 : undefined
  const token1Percent = token1USD && totalUSD ? (token1USD / totalUSD) * 100 : undefined
  const TransactionType: TitleTipsProps[] = [
    {
      label: 'All',
      value: 'All',
      onClick: data => {
        setTransactionType(data.value)
      }
    },
    {
      label: 'Swap',
      value: 'Swaps',
      onClick: data => {
        setTransactionType(data.value)
      }
    },
    {
      label: 'Deposit',
      value: 'Adds',
      onClick: data => {
        setTransactionType(data.value)
      }
    },
    {
      label: 'Withdraw',
      value: 'Removes',
      onClick: data => {
        setTransactionType(data.value)
      }
    }
  ]

  const tabChange = (e: string) => {
    setTabIndex(e)
  }
  const timeChange = (e: string) => {
    setTimeIndex(e)
  }

  const getTimeframe = (timeWindow: string) => {
    const utcEndTime = dayjs.utc().subtract(1, 'day')
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

  const dayResList = (dayRes: any, dayNum: number) => {
    const tiemList = [
      dayjs
        .utc()
        .subtract(1, 'day')
        .startOf('day')
        .unix()
    ]
    for (let i = 1; i < dayNum; i++) {
      tiemList.unshift(
        dayjs
          .utc()
          .subtract(i + 1, 'day')
          .startOf('day')
          .unix()
      )
    }
    return tiemList.map(e => {
      const itemObj = dayRes.find((item: any) => item.date === e)
      if (itemObj) {
        return { ...itemObj }
      }
      return { date: e, hourlyVolumeUSD: 0, reserveUSD: 0 }
    })
  }

  useEffect(() => {
    const utcStartTime = getTimeframe(timeIndex)
    const xArr: string[] = []
    const yArr: string[] = []
    let dayRes = dayChartResult
    if (timeIndex === '1W') {
      dayRes = dayResList(dayChartResult, 7)
    }
    if (timeIndex === '1M') {
      dayRes = dayResList(dayChartResult, 30)
    }
    const result = timeIndex === '24H' ? hourChartResult : dayRes
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
      } else if (
        utcStartTime &&
        item.date >= utcStartTime &&
        item.date <
          dayjs
            .utc()
            .endOf('day')
            .subtract(1, 'day')
            .unix()
      ) {
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
  }, [timeIndex, tabIndex, hourChartResult, dayChartResult])

  const viewData: OverviewData[] = [
    {
      title: 'TVL',
      isRise: !!pairMore && pairMore.tvlChangeUSD > 0,
      amount: pool ? `$${format.amountFormat(Number(pool.tvl), 2)}` : `--`,
      rate: pairMore ? `${format.numeral(pairMore.tvlChangeUSD, 2)} %` : `--`
    },
    {
      title: 'Volume(24H)',
      isRise: !!pairMore && pairMore.volumeChangeUSD > 0,
      amount: pairMore ? `$${(format.amountFormat(pairMore.oneDayVolumeUSD), 2)}` : `--`,
      rate: pairMore ? `${format.numeral(pairMore.volumeChangeUSD, 2)} %` : `--`
    },
    {
      title: 'Fees(24H)',
      isRise: !!pairMore && pairMore.volumeChangeUSD > 0,
      amount: pairMore ? `$${(format.amountFormat(pairMore.oneDayVolumeUSD * 0.003), 2)}` : `--`,
      rate: pairMore ? `${format.numeral(pairMore.volumeChangeUSD, 2)} %` : `--`
    },
    {
      title: 'Fees(7d)',
      isRise: !!pairMore && pairMore.weeklyVolumeChange > 0,
      amount: pairMore ? `$${(format.amountFormat(pairMore.oneWeekVolume), 2)}` : `--`,
      rate: pairMore ? `${format.numeral(pairMore.weeklyVolumeChange, 2)} %` : `--`
    }
  ]

  const [aprInfo, setAprInfo] = useState<any>({})

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

  function LiquidityCard() {
    return (
      <LightCard padding={'0'} height={'fit-content'} borderRadius={'20px'}>
        <CardHeader style={{ padding: '30px' }}>
          <RowBetween>
            <TYPE.white fontSize={18} fontWeight={700}>
              My Liquidity Position
            </TYPE.white>
          </RowBetween>
        </CardHeader>
        <AutoColumn gap={'30px'} style={{ padding: 30 }}>
          <AutoColumn gap={'8px'}>
            <AutoRowBetween>
              <AutoRow gap={'10px'}>
                <DoubleCurrencyLogo over size={24} currency0={pool?.pair.token0} currency1={pool?.pair.token1} />
                <TYPE.white fontWeight={700} fontSize={18}>{`${token0Symbol || '-'}/${token1Symbol ||
                  '-'} Pool Token`}</TYPE.white>
              </AutoRow>
              <TYPE.white fontSize={18} fontWeight={700}>
                {userTotalBalance?.toFixed(4, { groupSeparator: ',' } ?? '0.00')}
              </TYPE.white>
            </AutoRowBetween>
            <TYPE.main textAlign={'right'}>
              {userToken0 && userToken1 && token0PriceUSD && token1PriceUSD && pool?.tokens[0]
                ? `≈$${amountFormat(
                    Number(userToken0.toExact().toString()) * token0PriceUSD +
                      Number(userToken1.toExact().toString()) * token1PriceUSD,
                    2
                  )}`
                : '≈$0.00'}
            </TYPE.main>
          </AutoColumn>
          <AutoColumn gap={'20px'}>
            <RowBetween>
              <AutoRow gap={'10px'} style={{ width: '50%' }}>
                <CurrencyLogo size={'20px'} currency={pool?.pair.token0} />
                <TYPE.white>
                  {userToken0 ? userToken0.toFixed(4, { groupSeparator: ',' } ?? '0.00') : ''} {token0Symbol ?? ''}
                </TYPE.white>
              </AutoRow>
              <TYPE.main>
                {userToken0 && token0PriceUSD
                  ? `≈$${amountFormat(Number(userToken0.toExact().toString()) * token0PriceUSD, 2)}`
                  : '≈$0.00'}
              </TYPE.main>
            </RowBetween>
            <RowBetween>
              <AutoRow gap={'10px'} style={{ width: '50%' }}>
                <CurrencyLogo size={'20px'} currency={pool?.pair.token1} />
                <TYPE.white>
                  {userToken1 ? userToken1.toFixed(4, { groupSeparator: ',' } ?? '0.00') : ''} {token1Symbol ?? ''}
                </TYPE.white>
              </AutoRow>
              <TYPE.main>
                {userToken1 && token1PriceUSD
                  ? `≈$${amountFormat(Number(userToken1.toExact().toString()) * token1PriceUSD, 2)}`
                  : '≈$0.00'}
              </TYPE.main>
            </RowBetween>
          </AutoColumn>
          <AutoColumn gap={'20px'}>
            <RowBetween>
              <TYPE.main>Unstaked Position</TYPE.main>
              <TYPE.white>{balance?.toFixed(4, { groupSeparator: ',' } ?? '0.00') ?? ''}</TYPE.white>
            </RowBetween>
            <RowBetween>
              <TYPE.main>Staked Position</TYPE.main>
              <TYPE.white>{stakedLpAmount?.toFixed(4, { groupSeparator: ',' } ?? '0.00') ?? ''}</TYPE.white>
            </RowBetween>
            <AutoRowBetween gap={'30px'}>
              <ButtonPrimary
                className="text-medium"
                onClick={() =>
                  pool?.tokens[0] &&
                  pool?.tokens[1] &&
                  history.push(
                    `/swap/liquidity/manager/deposit/${tokenId(chainWETH, pool?.tokens[0])}/${tokenId(
                      chainWETH,
                      pool?.tokens[1]
                    )}`
                  )
                }
                height={42}
              >
                Deposit
              </ButtonPrimary>
              <ButtonOutlined
                primary
                onClick={() =>
                  pool?.tokens[0] &&
                  pool?.tokens[1] &&
                  history.push(
                    `/swap/liquidity/manager/withdraw/${tokenId(chainWETH, pool.tokens[0])}/${tokenId(
                      chainWETH,
                      pool.tokens[1]
                    )}`
                  )
                }
                height={42}
              >
                Withdraw
              </ButtonOutlined>
            </AutoRowBetween>
          </AutoColumn>
        </AutoColumn>
      </LightCard>
    )
  }

  function StakeCard() {
    return (
      <AutoColumn style={{ marginTop: 30, flex: 1 }}>
        <LightCard padding={'0'} borderRadius={'20px'}>
          <CardHeader style={{ padding: '30px' }}>
            <TYPE.white fontSize={18} fontWeight={700}>
              Liquidity Gömböc
            </TYPE.white>
          </CardHeader>
          {!pool?.stakingRewardAddress ? (
            <AutoColumn style={{ justifyContent: 'center', padding: '93px 30px' }}>
              <TYPE.white lineHeight={'20px'} textAlign={'center'}>
                The Pool has not yet been added to the liquidity mining list, you can start the add process via the
                governance specification.
              </TYPE.white>
              <ButtonPrimary className="text-medium" mt={50}>
                Create Proposal
              </ButtonPrimary>
              <AutoRow mt={30} justify={'center'}>
                <TYPE.main>Learn more about Liquidity Mining</TYPE.main>
                <ArrowRight style={{ marginLeft: 20 }} size={12} color={'#A8A8AA'} />
              </AutoRow>
            </AutoColumn>
          ) : (
            <>
              <AutoColumn style={{ padding: 30 }} gap={'30px'}>
                <AutoColumn gap={'20px'}>
                  <RowBetween>
                    <TYPE.main>Gömböc Relative Weight</TYPE.main>
                    <TYPE.white>{relativeWeight ? `${relativeWeight.toFixed(2)}%` : ''}</TYPE.white>
                  </RowBetween>
                  <RowBetween>
                    <TYPE.main>My Mining Position</TYPE.main>
                    <TYPE.white>
                      {stakedLpAmount ? stakedLpAmount.toFixed(4, { groupSeparator: ',' } ?? '0.00') : '--'}
                    </TYPE.white>
                  </RowBetween>
                  <RowBetween>
                    <TYPE.main>My Current Boost</TYPE.main>
                    <TYPE.white>{currentBoots ? `${currentBoots.toFixed(2)}x` : '--'}</TYPE.white>
                  </RowBetween>
                  <RowBetween>
                    <TYPE.main>My Future Boost</TYPE.main>
                    <TYPE.white>{futureBoots ? `${futureBoots.toFixed(2)}x` : '--'}</TYPE.white>
                  </RowBetween>
                  <RowBetween>
                    <TYPE.main>My Claimable Rewards</TYPE.main>
                    <RowFixed>
                      <TYPE.white>
                        {claimAbleRewards ? claimAbleRewards?.toFixed(4, { groupSeparator: ',' } ?? '0.00') : '--'}
                      </TYPE.white>
                      {claimAbleRewards && claimAbleRewards.greaterThan(JSBI.BigInt('0')) && (
                        <TYPE.link style={{ cursor: 'pointer' }} ml={'10px'} onClick={() => setShowClaimModal(true)}>
                          claim
                        </TYPE.link>
                      )}
                    </RowFixed>
                  </RowBetween>
                </AutoColumn>
                {account ? (
                  <>
                    <AutoRowBetween gap={'30px'}>
                      <ButtonPrimary
                        className="text-medium"
                        onClick={() => history.push(`/swap/liquidity/mining/${pool?.stakingRewardAddress}`)}
                        height={42}
                      >
                        Stake
                      </ButtonPrimary>
                      <ButtonOutlined
                        primary
                        onClick={() => history.push(`/swap/liquidity/mining/${pool?.stakingRewardAddress}`)}
                        height={42}
                      >
                        Unstake
                      </ButtonOutlined>
                    </AutoRowBetween>
                  </>
                ) : (
                  <>
                    <GreyCard borderRadius={'10px'} padding={'28px'}>
                      <AutoRow m={'auto'}>
                        <TYPE.main>Connect your wallet to view more information</TYPE.main>
                      </AutoRow>
                    </GreyCard>
                    <ButtonPrimary className="text-medium" onClick={toggleWalletModal}>
                      Connect Wallet
                    </ButtonPrimary>
                  </>
                )}
              </AutoColumn>
            </>
          )}
          {account && currentBoots && futureBoots && currentBoots.toFixed(2) !== futureBoots.toFixed(2) && (
            <AutoRow marginLeft={30}>
              <i style={{ color: '#FBDD55', fontSize: 16, fontWeight: 700 }} className="iconfont">
                &#xe614;
              </i>
              <TYPE.main ml={10}>You can apply future boost by claiming LT</TYPE.main>
            </AutoRow>
          )}
        </LightCard>
      </AutoColumn>
    )
  }

  return (
    <AutoColumn style={{ width: '100%', padding: '0 30px', maxWidth: '1340px' }}>
      {pool && showClaimModal && (
        <ClaimRewardModal
          isOpen={showClaimModal}
          onDismiss={() => setShowClaimModal(false)}
          stakingAddress={pool.stakingRewardAddress}
        />
      )}
      <AutoRow justify={'space-between'} padding={'0 30px'}>
        <div className="flex ai-center">
          <TYPE.white fontSize={28} fontWeight={700}>
            <GoBackIcon onClick={() => history.goBack()}>
              <i className="iconfont font-28 m-r-20 cursor-select font-bold">&#xe61a;</i>
            </GoBackIcon>
            {`${tokenSymbol(chainWETH, pool?.tokens[0]) || '-'}/${tokenSymbol(chainWETH, pool?.tokens[1]) || '-'}`}
          </TYPE.white>
          {pool && <RateTag>0.3%</RateTag>}
        </div>
        {/* <RowFlat>
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
            to={`/swap/liquidity/manager/${pool?.tokens?.[0].address}/${pool?.tokens?.[1].address}`}
          >
            Add Liquidity
          </ButtonPrimary>
        </RowFlat> */}
      </AutoRow>
      <AutoRow style={{ margin: 0 }} padding={'15px 0px'} gap={'15px'} align={''}>
        <AutoColumn style={{ flex: 4 }}>
          <LightCard padding={'30px'} borderRadius={'20px'}>
            <RowBetween>
              <Row>
                <PieCharts
                  data={token0Percent && token1Percent ? [token0Percent, token1Percent] : [50, 50]}
                ></PieCharts>
                <div className="m-l-20">
                  <Row>
                    <Circular></Circular>
                    <CurrencyLogo currency={pool?.tokens[0]} />
                    <TYPE.body marginLeft={9}>
                      {format.amountFormat(pool?.token0Value, 2)} {token0Symbol}
                      {token0Percent ? ` ${amountFormat(token0Percent)}%` : '--'}
                    </TYPE.body>
                  </Row>
                  <Row margin={'35px 0 0 0'}>
                    <Circular color={'#8FFBAE'}></Circular>
                    <CurrencyLogo currency={pool?.tokens[1]} />
                    <TYPE.body marginLeft={9}>
                      {format.amountFormat(pool?.token1Value, 2)} {token1Symbol}
                      {token1Percent ? ` ${amountFormat(token1Percent)}%` : '--'}
                    </TYPE.body>
                  </Row>
                </div>
              </Row>
              <div style={{ width: '345px' }}>
                <Row>
                  <TYPE.body>APR</TYPE.body>
                  <TYPE.green fontSize={30} marginLeft={12} fontFamily={'Arboria-Medium'}>
                    {amountFormat(aprInfo.baseApr, 2)}%
                  </TYPE.green>
                </Row>
                <p className="m-t-15 text-normal">Fees APR: {amountFormat(aprInfo.feeApr * 100, 2)}% </p>
                {aprInfo.ltApr && (
                  <p className="m-t-12 text-normal">Rewards APR: {amountFormat(aprInfo.ltApr * 100, 2)}%</p>
                )}
                {aprInfo.ltAmountPerDay && (
                  <p className="m-t-12 text-normal">
                    Daily Reward:{' '}
                    {aprInfo?.ltAmountPerDay
                      ? tryParseAmount(aprInfo?.ltAmountPerDay, LT[chainId ?? 1])?.toFixed(2, { groupSeparator: ',' })
                      : '--'}{' '}
                    LT
                  </p>
                )}
              </div>
            </RowBetween>
            {pool && (
              <Row marginTop={30}>
                <CurrencyLogo currency={pool?.tokens[1]} />
                <TYPE.body marginLeft={9} marginRight={40}>
                  1.00 {token0Symbol} = {amountFormat(pool?.token1Price ?? 0, 2)} {token1Symbol}
                </TYPE.body>
                <CurrencyLogo currency={pool?.tokens[0]} />
                <TYPE.body marginLeft={9}>
                  {' '}
                  1.00 {token1Symbol} = {amountFormat(pool?.token0Price ?? 0, 2)} {token0Symbol}
                </TYPE.body>
              </Row>
            )}
          </LightCard>
          <Overview viewData={viewData} smallSize={true}></Overview>
          <LightCard style={{ marginTop: '30px' }} padding={'30px 30px 20px'} borderRadius={'20px'}>
            <div style={{ height: '435px' }}>
              <div className="charts-tab">
                <Row justify={'space-between'} align={'flex-start'}>
                  <div>
                    <TabWrapper flexW={33.333} left={tabIndex === 'Volume' ? 0 : tabIndex === 'TVL' ? 33.333 : 66.666}>
                      <TabItem isActive={tabIndex === 'Volume'} onClick={() => tabChange('Volume')}>
                        Volume
                      </TabItem>
                      <TabItem isActive={tabIndex === 'TVL'} onClick={() => tabChange('TVL')}>
                        TVL
                      </TabItem>
                      <TabItem isActive={tabIndex === 'Fees'} onClick={() => tabChange('Fees')}>
                        Fees
                      </TabItem>
                    </TabWrapper>
                    <Row justify={'flex-start'} marginTop={20}>
                      <TimeItem isActive={timeIndex === '24H'} onClick={() => timeChange('24H')}>
                        24H
                      </TimeItem>
                      <TimeItem isActive={timeIndex === '1W'} onClick={() => timeChange('1W')}>
                        1W
                      </TimeItem>
                      <TimeItem isActive={timeIndex === '1M'} onClick={() => timeChange('1M')}>
                        1M
                      </TimeItem>
                    </Row>
                  </div>
                </Row>
              </div>
              {tabIndex === 'TVL' ? (
                <LineCharts xData={xData} yData={yData} height={330} is24Hour={timeIndex === '24H'}></LineCharts>
              ) : (
                <BarCharts
                  xData={xData}
                  yData={yData}
                  bottom={10}
                  height={330}
                  is24Hour={timeIndex === '24H'}
                ></BarCharts>
              )}
            </div>
          </LightCard>
        </AutoColumn>
        <AutoColumn style={{ flex: 3 }}>
          {/*Liquidity Card*/}
          <NoStakingWrapper>
            <LiquidityCard />
            <StakeCard />
          </NoStakingWrapper>
          {/*<LightCard>*/}
          {/*  <CardHeader>*/}
          {/*    <TYPE.white fontSize={20} fontWeight={700}>*/}
          {/*      My Position*/}
          {/*    </TYPE.white>*/}
          {/*    <TYPE.white fontSize={20}>{''}</TYPE.white>*/}
          {/*  </CardHeader>*/}
          {/*  <BasePoolInfoCard pool={pool} />*/}
          {/*  {pool?.stakingRewardAddress && (*/}
          {/*    <AutoRowBetween gap={'30px'}>*/}
          {/*      <ButtonPrimary*/}
          {/*        onClick={() => history.push(`/swap/withdraw/${pool?.stakingRewardAddress}`)}*/}
          {/*        disabled={!stakedAmount || (stakedAmount && !stakedAmount.greaterThan(JSBI.BigInt(0)))}*/}
          {/*      >*/}
          {/*        Unstaking*/}
          {/*      </ButtonPrimary>*/}
          {/*      <ButtonPrimary as={Link} to={`/swap/stake/${pool?.stakingRewardAddress}`}>*/}
          {/*        Staking*/}
          {/*      </ButtonPrimary>*/}
          {/*    </AutoRowBetween>*/}
          {/*  )}*/}
          {/*</LightCard>*/}
        </AutoColumn>
      </AutoRow>
      <AutoRow padding={'0 15px'}>
        <LightCard borderRadius={'20px'}>
          <AutoColumn>
            <TabWrapper left={showTx ? 50 : 0}>
              <TabItem onClick={() => setShowTx(false)} isActive={!showTx}>
                Information
              </TabItem>
              <TabItem
                onClick={() => {
                  setShowTx(true)
                }}
                isActive={showTx}
              >
                Transaction
              </TabItem>
            </TabWrapper>
            {showTx ? (
              <>
                <Card marginTop={30} borderRadius={'8px'} backgroundColor={'#33333C'} padding={'13px 30px'}>
                  <AutoRow>
                    <TableTitle>
                      <SelectTips options={TransactionType} label={transactionType} />
                    </TableTitle>
                    <TableTitle>Total Value</TableTitle>
                    <TableTitle>Token Amount</TableTitle>
                    <TableTitle>Token Amount</TableTitle>
                    <TableTitle>Account</TableTitle>
                    <TableTitle>Time (UTC)</TableTitle>
                  </AutoRow>
                </Card>

                <LightCard padding={'0 10px 10px'} borderRadius={'20px'}>
                  <TxItemWrapper>
                    {txs.result.map(tx => {
                      return (
                        <AutoRow key={tx.transaction.id} style={{ borderBottom: '1px solid #3D3E46' }}>
                          <TxItem>
                            <TYPE.link
                              as={ExternalLink}
                              href={getEtherscanLink(chainId ?? 1, tx.transaction.id, 'transaction')}
                            >
                              {tx.title}
                            </TYPE.link>
                          </TxItem>
                          <TxItem>
                            <TYPE.subHeader>{`≈$${amountFormat(tx.amountUSD, 2)}`}</TYPE.subHeader>
                          </TxItem>
                          <TxItem>
                            <TYPE.subHeader>{`${format.amountFormat(tx.amount0, 2)} ${
                              tx.pair.token0.symbol
                            }`}</TYPE.subHeader>
                          </TxItem>
                          <TxItem>
                            <TYPE.subHeader>{`${format.amountFormat(tx.amount1, 2)} ${
                              tx.pair.token1.symbol
                            }`}</TYPE.subHeader>
                          </TxItem>
                          <TxItem>
                            <ExternalLink href={`${getEtherscanLink(chainId || 1, tx.sender, 'address')}`}>
                              <TYPE.subHeader style={{ color: '#fff' }}>{`${
                                tx.sender ? shortenAddress(tx.sender) : ''
                              }`}</TYPE.subHeader>
                            </ExternalLink>
                          </TxItem>
                          <TxItem>
                            <TYPE.subHeader>{`${formatUTCDate(tx.transaction.timestamp)}`}</TYPE.subHeader>
                          </TxItem>
                        </AutoRow>
                      )
                    })}
                  </TxItemWrapper>
                </LightCard>
              </>
            ) : (
              <>
                <Card marginTop={30} borderRadius={'8px'} backgroundColor={'#33333C'} padding={'13px 30px'}>
                  <AutoRow>
                    <TableTitle>Contract Address</TableTitle>
                    <TableTitle>Creation Time(UTC)</TableTitle>
                    <TableTitle flex={0.8}>Fee Rate</TableTitle>
                    <TableTitle flex={1.5}>Total Swap Volume</TableTitle>
                    <TableTitle flex={1.5}>Total Swap Fee</TableTitle>
                    <TableTitle>Total Number of Trad</TableTitle>
                  </AutoRow>
                </Card>

                <LightCard>
                  <AutoRow align={'flex-start'}>
                    <TableTitle>
                      <ExternalLink href={`${getEtherscanLink(chainId || 1, address, 'address')}`}>
                        <span style={{ color: '#fff' }}>{shortenAddress(address)}</span>
                      </ExternalLink>
                    </TableTitle>
                    <TableTitle>{formatUTCDate(pool?.createAt)}</TableTitle>
                    <TableTitle flex={0.8}>0.30%</TableTitle>
                    <AutoColumn gap={'lg'} style={{ flex: 1.5 }}>
                      <TableTitle>{pairMore ? `≈ $${format.amountFormat(pairMore.totalVolume, 2)}` : '--'}</TableTitle>
                      <AutoRow gap={'5px'}>
                        <CurrencyLogo currency={pool?.tokens[0]} />
                        <TYPE.main>
                          {pool?.volume0Amount
                            ? `${pool.volume0Amount.toFixed(2, { groupSeparator: ',' })} ${token0Symbol}`
                            : '--'}
                        </TYPE.main>
                      </AutoRow>
                      <AutoRow gap={'5px'}>
                        <CurrencyLogo currency={pool?.tokens[0]} />
                        <TYPE.main>
                          {pool?.volume1Amount
                            ? `${pool.volume1Amount.toFixed(2, { groupSeparator: ',' })} ${token1Symbol}`
                            : '--'}
                        </TYPE.main>
                      </AutoRow>
                    </AutoColumn>
                    <AutoColumn gap={'lg'} style={{ flex: 1.5 }}>
                      <TableTitle>
                        {pairMore ? `≈ $${format.amountFormat(pairMore.totalVolume * 0.003, 2)}` : '--'}
                      </TableTitle>
                      <AutoRow gap={'5px'}>
                        <CurrencyLogo currency={pool?.tokens[0]} />
                        <TYPE.main>
                          {pool?.volume0Amount
                            ? `${pool.volume0Amount.toFixed(2, { groupSeparator: ',' })} ${token0Symbol}`
                            : '--'}
                        </TYPE.main>
                      </AutoRow>
                      <AutoRow gap={'5px'}>
                        <CurrencyLogo currency={pool?.tokens[0]} />
                        <TYPE.main>
                          {pool?.volume1Amount
                            ? `${pool.volume1Amount.toFixed(2, { groupSeparator: ',' })} ${token1Symbol}`
                            : '--'}
                        </TYPE.main>
                      </AutoRow>
                    </AutoColumn>
                    <TableTitle>{pool ? pool.txCount : '--'}</TableTitle>
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
