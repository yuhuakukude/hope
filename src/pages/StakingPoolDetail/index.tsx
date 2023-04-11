import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { RouteComponentProps, useHistory } from 'react-router-dom'
import { usePairTxs, useStakingPairPool } from '../../hooks/useLPStaking'
import Row, { AutoRow, AutoRowBetween, RowBetween, RowFixed } from '../../components/Row'
import { AutoColumn } from '../../components/Column'
import CurrencyLogo from '../../components/CurrencyLogo'
import { TYPE, ExternalLink } from '../../theme'
import Card, { GreyCard, LightCard } from '../../components/Card'
import { useActiveWeb3React } from '../../hooks'
import { ButtonOutlined, ButtonPrimary } from '../../components/Button'
import { CardHeader } from '../../components/pool/PoolInfoCard'
import PieCharts from '../../components/pool/PieCharts'
import LineCharts from '../../components/pool/LineCharts'
import BarCharts from '../../components/pool/BarCharts'
import styled from 'styled-components'
import { Decimal } from 'decimal.js'
import { Pagination } from 'antd'
import { Box } from 'rebass/styled-components'
import ClaimRewardModal from '../../components/earn/ClaimRewardModal'
import { shortenAddress, getEtherscanLink } from '../../utils'
import AprApi from '../../api/apr.api'
import format, { amountFormat, formatUTCDate, numeral } from '../../utils/format'
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
import { getLTToken } from 'utils/addressHelpers'
import { DOCS_URL } from '../../constants/config'
import Skeleton from '../../components/Skeleton'
import { TxResponse } from '../../state/stake/hooks'

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
  margin-left: 16px;
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
  background-color: #1b1b1f;
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
  const { result: pool, pairMore, loading } = useStakingPairPool(address)
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
  const { result: txsResult, loading: txsLoading } = usePairTxs(address, transactionType)

  const [dataSource, setDataSource] = useState<TxResponse[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  //const stakedAmount = useTokenBalance(account ?? undefined, pool?.stakingToken)

  const { token0Deposited, token1Deposited, balance } = usePosition(pool?.pair)
  const { token0Staked, token1Staked, stakedAmount } = useStakePosition(pool)
  const userTotalBalance = stakedAmount && balance ? stakedAmount?.add(balance) : balance
  const userToken0 = token0Deposited && token0Staked ? token0Deposited.add(token0Staked) : token0Deposited
  const userToken1 = token1Deposited && token1Staked ? token1Deposited.add(token1Staked) : token1Deposited
  // charts
  const [tabIndex, setTabIndex] = useState('Volume')
  const [timeIndex, setTimeIndex] = useState('24H')
  const [xData, setXData] = useState<string[]>()
  const [yData, setYData] = useState<string[]>()
  const { result: dayChartResult, loading: dayChartLoading } = useLineDaysChartsData(address ?? '')
  const { result: hourChartResult, loading: hourChartLoading } = useLine24HourChartsData(address ?? '')

  const token0PriceUSD =
    priceResult && pool?.tokens[0].address ? Number(priceResult[pool.tokens[0].address.toLowerCase()]) : undefined
  const token1PriceUSD =
    priceResult && pool?.tokens[1].address ? Number(priceResult[pool.tokens[1].address.toLowerCase()]) : undefined

  const token0USD =
    pool?.token0Amount && token0PriceUSD ? Number(pool?.token0Amount.toExact().toString()) * token0PriceUSD : undefined
  // const token1USD =
  //   pool?.token1Amount && token1PriceUSD ? Number(pool?.token1Amount.toExact().toString()) * token1PriceUSD : undefined

  const totalUSD =
    pool?.token0Amount && pool.token1Amount && token0PriceUSD && token1PriceUSD
      ? Number(pool?.token0Amount.toExact().toString()) * token0PriceUSD +
        Number(pool?.token1Amount.toExact().toString()) * token1PriceUSD
      : undefined
  const token0Percent = token0USD && totalUSD ? format.numeral((token0USD / totalUSD) * 100, 2) : undefined
  const token1Percent = token0Percent ? 100 - Number(token0Percent) : undefined
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
      value: 'Swap',
      onClick: data => {
        setTransactionType(data.value)
      }
    },
    {
      label: 'Deposit',
      value: 'Deposit',
      onClick: data => {
        setTransactionType(data.value)
      }
    },
    {
      label: 'Withdraw',
      value: 'Withdraw',
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

  useEffect(() => {
    setDataSource(txsResult.slice(0, pageSize))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txsResult])

  const setPageSearch = (page: number, pagesize: number) => {
    const resList = txsResult?.slice((page - 1) * pagesize, Number(pagesize) + (page - 1) * pagesize)
    setDataSource(resList)
  }

  const onPagesChange = (page: any, pageSize: any) => {
    setCurrentPage(Number(page))
    setPageSize(Number(pageSize))
    setPageSearch(page, pageSize)
  }

  useEffect(() => {
    const xArr: any[] = []
    const yArr: any[] = []
    let dayRes = dayChartResult
    if (timeIndex === '1W') {
      dayRes = dayChartResult.slice(dayChartResult.length - 7, dayChartResult.length)
    }
    if (timeIndex === '1M') {
      dayRes = dayChartResult
    }
    const result = timeIndex === '24H' ? hourChartResult : dayRes
    result?.forEach((item: any) => {
      if (timeIndex === '24H') {
        if (tabIndex === 'Volume') {
          yArr.push(numeral(item.hourlyVolumeUSD, 2))
        }
        if (tabIndex === 'TVL') {
          yArr.push(numeral(item.reserveUSD, 2))
        }
        if (tabIndex === 'Fees' && pool?.feeRate) {
          yArr.push(numeral(new Decimal(item.hourlyVolumeUSD || 0).mul(new Decimal(pool.feeRate)).toNumber(), 2))
        }
        xArr.push(item.hourStartUnix)
      } else {
        if (tabIndex === 'Volume') {
          yArr.push(numeral(item.dailyVolumeUSD, 2))
        }
        if (tabIndex === 'TVL') {
          yArr.push(numeral(item.reserveUSD, 2))
        }
        if (tabIndex === 'Fees' && pool?.feeRate) {
          yArr.push(numeral(new Decimal(item.dailyVolumeUSD || 0).mul(new Decimal(pool.feeRate)).toNumber(), 2))
        }
        // xArr.push(format.formatDate(item.date, 'YYYY-MM-DD'))
        xArr.push(item.date)
      }
    })
    setXData(xArr)
    setYData(yArr)
  }, [timeIndex, tabIndex, hourChartResult, dayChartResult, pool])

  const [aprInfo, setAprInfo] = useState<any>({})

  const initFn = useCallback(async () => {
    if (!address) return
    const res = await AprApi.getHopeFeeApr(address)
    if (res && res.result) {
      setAprInfo(res.result)
    }
  }, [address])

  const dayRewards = aprInfo.ltAmountPerDay ? tryParseAmount(aprInfo.ltAmountPerDay, getLTToken(chainId)) : undefined

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
                <Skeleton loading={loading} width={38} height={24}>
                  <DoubleCurrencyLogo over size={24} currency0={pool?.pair.token0} currency1={pool?.pair.token1} />
                </Skeleton>
                <Skeleton loading={loading} width={200} height={18}>
                  <TYPE.white fontWeight={700} fontSize={18}>{`${token0Symbol || '-'}/${token1Symbol ||
                    '-'} Pool Token`}</TYPE.white>
                </Skeleton>
              </AutoRow>
              <Skeleton loading={loading} width={150} height={18}>
                <TYPE.white fontSize={18} fontWeight={700}>
                  {userTotalBalance ? userTotalBalance?.toFixed(4, { groupSeparator: ',' }) : '0.00'}
                </TYPE.white>
              </Skeleton>
            </AutoRowBetween>

            <AutoRow justify={'flex-end'}>
              <Skeleton loading={loading} width={90} height={14}>
                <TYPE.main>
                  {userToken0 && userToken1 && token0PriceUSD && token1PriceUSD && pool?.tokens[0]
                    ? `≈$${amountFormat(
                        Number(userToken0.toExact().toString()) * token0PriceUSD +
                          Number(userToken1.toExact().toString()) * token1PriceUSD,
                        2
                      )}`
                    : '≈$0.00'}
                </TYPE.main>
              </Skeleton>
            </AutoRow>
          </AutoColumn>
          <AutoColumn gap={'20px'}>
            <RowBetween>
              <AutoRow gap={'10px'} style={{ width: '50%' }}>
                <Skeleton loading={loading} width={20} height={20} radius={'50%'}>
                  <CurrencyLogo size={'20px'} currency={pool?.pair.token0} />
                </Skeleton>
                <Skeleton loading={loading} width={100} height={14}>
                  <TYPE.white>
                    {userToken0 ? userToken0.toFixed(4, { groupSeparator: ',' } ?? '0.00') : ''} {token0Symbol ?? ''}
                  </TYPE.white>
                </Skeleton>
              </AutoRow>
              <Skeleton loading={loading} width={90} height={14}>
                <TYPE.main>
                  {userToken0 && token0PriceUSD
                    ? `≈$${amountFormat(Number(userToken0.toExact().toString()) * token0PriceUSD, 2)}`
                    : '≈$0.00'}
                </TYPE.main>
              </Skeleton>
            </RowBetween>
            <RowBetween>
              <AutoRow gap={'10px'} style={{ width: '50%' }}>
                <Skeleton loading={loading} width={20} height={20} radius={'50%'}>
                  <CurrencyLogo size={'20px'} currency={pool?.pair.token1} />
                </Skeleton>
                <Skeleton loading={loading} width={100} height={14}>
                  <TYPE.white>
                    {userToken1 ? userToken1.toFixed(4, { groupSeparator: ',' } ?? '0.00') : ''} {token1Symbol ?? ''}
                  </TYPE.white>
                </Skeleton>
              </AutoRow>
              <Skeleton loading={loading} width={90} height={14}>
                <TYPE.main>
                  {userToken1 && token1PriceUSD
                    ? `≈$${amountFormat(Number(userToken1.toExact().toString()) * token1PriceUSD, 2)}`
                    : '≈$0.00'}
                </TYPE.main>
              </Skeleton>
            </RowBetween>
          </AutoColumn>
          <AutoColumn gap={'20px'}>
            <RowBetween>
              <TYPE.main>Unstaked Position</TYPE.main>
              <Skeleton loading={loading} width={150}>
                <TYPE.white>{balance?.toFixed(4, { groupSeparator: ',' } ?? '0.0000') ?? '0.0000'}</TYPE.white>
              </Skeleton>
            </RowBetween>
            <RowBetween>
              <TYPE.main>Staked Position</TYPE.main>
              <Skeleton loading={loading} width={150}>
                <TYPE.white>{stakedAmount?.toFixed(4, { groupSeparator: ',' } ?? '0.0000') ?? '0.0000'}</TYPE.white>
              </Skeleton>
            </RowBetween>
            <AutoRowBetween gap={'30px'}>
              <Skeleton loading={loading} height={42} radius={'10px'}>
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
              </Skeleton>
              <Skeleton loading={loading} height={42} radius={'10px'}>
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
              </Skeleton>
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
              Liquidity Gauge
            </TYPE.white>
          </CardHeader>
          {!pool?.stakingRewardAddress && !loading ? (
            <AutoColumn style={{ justifyContent: 'center', padding: '93px 30px' }}>
              <TYPE.white lineHeight={'20px'} textAlign={'center'}>
                The Pool has not yet been added to the liquidity mining list, you can start the add process via the
                governance specification.
              </TYPE.white>
              <ButtonPrimary style={{ cursor: 'no-drop' }} disabled className="text-medium" mt={50}>
                Create Proposal
              </ButtonPrimary>
              <AutoRow
                mt={30}
                justify={'center'}
                onClick={() => {
                  window.open(DOCS_URL['HopeSwap'])!.opener = null
                }}
              >
                <TYPE.main>Learn more about Liquidity Mining</TYPE.main>
                <ArrowRight style={{ marginLeft: 20 }} size={12} color={'#A8A8AA'} />
              </AutoRow>
            </AutoColumn>
          ) : (
            <>
              <AutoColumn style={{ padding: 30 }} gap={'30px'}>
                <AutoColumn gap={'20px'}>
                  <RowBetween>
                    <TYPE.main>Gauge Relative Weight</TYPE.main>
                    <Skeleton loading={loading} width={150}>
                      <TYPE.white>{relativeWeight ? `${relativeWeight.toFixed(2)}%` : ''}</TYPE.white>
                    </Skeleton>
                  </RowBetween>
                  <RowBetween>
                    <TYPE.main>My Mining Position</TYPE.main>
                    <Skeleton loading={loading} width={150}>
                      <TYPE.white>
                        {stakedAmount ? stakedAmount.toFixed(4, { groupSeparator: ',' } ?? '0.00') : '--'}
                      </TYPE.white>
                    </Skeleton>
                  </RowBetween>
                  <RowBetween>
                    <TYPE.main>My Current Boost</TYPE.main>
                    <Skeleton loading={loading} width={150}>
                      <TYPE.white>{currentBoots ? `${currentBoots.toFixed(2)}x` : '--'}</TYPE.white>
                    </Skeleton>
                  </RowBetween>
                  <RowBetween>
                    <TYPE.main>My Next Boost</TYPE.main>
                    <Skeleton loading={loading} width={150}>
                      <TYPE.white>{futureBoots ? `${futureBoots.toFixed(2)}x` : '--'}</TYPE.white>
                    </Skeleton>
                  </RowBetween>
                  <RowBetween>
                    <TYPE.main>My Claimable Rewards</TYPE.main>
                    <Skeleton loading={loading} width={150}>
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
                    </Skeleton>
                  </RowBetween>
                </AutoColumn>
                {account ? (
                  <>
                    <AutoRowBetween gap={'30px'}>
                      <Skeleton loading={loading} height={42} radius={'10px'}>
                        <ButtonPrimary
                          className="text-medium"
                          onClick={() => history.push(`/swap/liquidity/mining/${pool?.stakingRewardAddress}`)}
                          height={42}
                        >
                          Stake
                        </ButtonPrimary>
                      </Skeleton>
                      <Skeleton loading={loading} height={42} radius={'10px'}>
                        <ButtonOutlined
                          primary
                          onClick={() =>
                            history.push(`/swap/liquidity/mining/${pool?.stakingRewardAddress}?type=unstake`)
                          }
                          height={42}
                        >
                          Unstake
                        </ButtonOutlined>
                      </Skeleton>
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
              <TYPE.main ml={10}>You can apply next boost by claiming LT</TYPE.main>
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
              <i
                className="iconfont font-28 m-r-20 cursor-select font-bold hope-icon-common"
                style={{ width: '28px', height: '28px' }}
              >
                &#xe615;
              </i>
            </GoBackIcon>
            {`${tokenSymbol(chainWETH, pool?.tokens[0]) || '-'}/${tokenSymbol(chainWETH, pool?.tokens[1]) || '-'}`}
          </TYPE.white>
          {pool?.feeRate && <RateTag>{pool.feeRate * 100}%</RateTag>}
        </div>
      </AutoRow>
      <AutoRow style={{ margin: 0 }} padding={'15px 0px'} gap={'15px'} align={''}>
        <AutoColumn style={{ flex: 4 }}>
          <LightCard padding={'30px'} borderRadius={'20px'}>
            <RowBetween>
              <Row align="center">
                <PieCharts
                  data={token0Percent && token1Percent ? [token0Percent, token1Percent] : [50, 50]}
                ></PieCharts>
                <div className="m-l-30">
                  <Row>
                    {/* <Skeleton loading={loading} width={200}></Skeleton> */}
                    <Skeleton loading={loading} width={7} height={7} radius={'50%'} mr={8}>
                      <Circular></Circular>
                    </Skeleton>
                    <Skeleton loading={loading} width={24} height={24}>
                      <CurrencyLogo currency={pool?.tokens[0]} />
                    </Skeleton>
                    <Skeleton loading={loading} width={200} height={18} ml={9}>
                      <TYPE.body marginLeft={9}>
                        {format.amountFormat(pool?.token0Value, 2)} {token0Symbol}{' '}
                        {token0Percent ? ` (${Number(token0Percent).toFixed(2)}%)` : '--'}
                      </TYPE.body>
                    </Skeleton>
                  </Row>
                  <Row margin={'16px 0 0 0'}>
                    <Skeleton loading={loading} width={7} height={7} radius={'50%'} mr={8}>
                      <Circular color={'#8FFBAE'}></Circular>
                    </Skeleton>
                    <Skeleton loading={loading} width={24} height={24}>
                      <CurrencyLogo currency={pool?.tokens[1]} />
                    </Skeleton>
                    <Skeleton loading={loading} width={200} height={18} ml={9}>
                      <TYPE.body marginLeft={9}>
                        {format.amountFormat(pool?.token1Value, 2)} {token1Symbol}{' '}
                        {token1Percent ? ` (${Number(token1Percent).toFixed(2)}%)` : '--'}
                      </TYPE.body>
                    </Skeleton>
                  </Row>
                </div>
                <div>
                  <Row>
                    <Skeleton loading={loading} width={200} ml={12}>
                      {pool && (
                        <TYPE.body marginLeft={12} fontSize={14} color={'#A8A8AA'}>
                          1.00 {token0Symbol} ≈ {amountFormat(pool?.token1Price, 2)} {token1Symbol}
                        </TYPE.body>
                      )}
                    </Skeleton>
                  </Row>

                  <Row margin={'25px 0 0 0'}>
                    <Skeleton loading={loading} width={200} ml={12}>
                      {pool && (
                        <TYPE.body marginLeft={12} fontSize={14} color={'#A8A8AA'}>
                          1.00 {token1Symbol} ≈ {amountFormat(pool?.token0Price, 2)} {token0Symbol}
                        </TYPE.body>
                      )}
                    </Skeleton>
                  </Row>
                </div>
              </Row>
            </RowBetween>

            <div
              className="flex p-20 m-t-30"
              style={{ borderRadius: '10px', backgroundColor: '#33343D', border: '1px solid #3D3E46' }}
            >
              <div className="flex-1">
                <p className="text-medium font-nor text-normal">TVL</p>
                <Skeleton loading={loading} width={230} height={20} mt={16}>
                  <p className="font-30 text-medium m-t-16">
                    {pool ? `$${format.numFormat(format.amountFormat(Number(pool.tvl), 2), 2, true)}` : `--`}
                  </p>
                </Skeleton>

                <p className="flex jc-between ai-center font-nor m-t-22">
                  <span className="text-normal">Volume(24H)</span>
                  <Skeleton loading={loading} width={130} height={18}>
                    <span>
                      {pairMore
                        ? `$${format.numFormat(format.amountFormat(pairMore.oneDayVolumeUSD, 2), 2, true)}`
                        : `$0.00`}
                    </span>
                  </Skeleton>
                </p>
                <p className="flex jc-between ai-center font-nor m-t-16">
                  <span className="text-normal">Fees(24H)</span>
                  <Skeleton loading={loading} width={130} height={18}>
                    <span>
                      {pairMore && pool?.feeRate
                        ? `$${format.amountFormat(pairMore.oneDayVolumeUSD * pool.feeRate, 2)}`
                        : `$0.00`}
                    </span>
                  </Skeleton>
                </p>
                <p className="flex jc-between ai-center font-nor m-t-16">
                  <span className="text-normal">Fees(7d)</span>
                  <Skeleton loading={loading} width={130} height={18}>
                    <span>
                      {pairMore && pairMore.oneWeekVolume && pool?.feeRate
                        ? `$${format.amountFormat(pairMore.oneWeekVolume * pool.feeRate, 2)}`
                        : `$0.00`}
                    </span>
                  </Skeleton>
                </p>
              </div>
              <div
                style={{
                  width: '1px',
                  backgroundColor: '#3D3E46',
                  boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.05)',
                  margin: '0 20px'
                }}
              ></div>
              <div className="flex-1">
                <p className="text-medium font-nor text-normal">APR</p>
                <Skeleton loading={loading} width={230} height={20} mt={16}>
                  <TYPE.green fontSize={30} marginTop={16} fontFamily={'Arboria-Medium'}>
                    {numeral(aprInfo.baseApr * 100, 2)}%
                  </TYPE.green>
                </Skeleton>

                <p className="flex jc-between ai-center font-nor m-t-22">
                  <span className="text-normal">Fees APR:</span>
                  <Skeleton loading={loading} width={130} height={18}>
                    <span>{numeral(aprInfo.feeApr * 100, 2)}%</span>
                  </Skeleton>
                </p>
                <p className="flex jc-between ai-center font-nor m-t-16">
                  <span className="text-normal">Rewards APR</span>
                  <Skeleton loading={loading} width={130} height={18}>
                    <span>{aprInfo.ltApr ? `${numeral(aprInfo.ltApr * 100, 2)}%` : `--`}</span>
                  </Skeleton>
                </p>
                <p className="flex jc-between ai-center font-nor m-t-16">
                  <span className="text-normal">Daily Reward</span>
                  <Skeleton loading={loading} width={130} height={18}>
                    <span>{dayRewards ? dayRewards?.toFixed(2, { groupSeparator: ',' }) : `0.00`} LT</span>
                  </Skeleton>
                </p>
              </div>
            </div>
          </LightCard>
          <LightCard style={{ marginTop: '30px' }} padding={'30px 30px 20px'} borderRadius={'20px'}>
            <div style={{ height: '400px', overflow: 'hidden' }}>
              <div className="charts-tab flex jc-between ai-center">
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
                <Row justify={'flex-end'}>
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
              {tabIndex === 'TVL' ? (
                <LineCharts
                  xData={xData}
                  yData={yData}
                  height={330}
                  left={10}
                  loading={timeIndex === '24H' ? hourChartLoading : dayChartLoading}
                  is24Hour={timeIndex === '24H'}
                ></LineCharts>
              ) : (
                <BarCharts
                  xData={xData}
                  yData={yData}
                  bottom={10}
                  left={10}
                  height={330}
                  loading={timeIndex === '24H' ? hourChartLoading : dayChartLoading}
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
                <Card marginTop={30} borderRadius={'8px'} backgroundColor={'#33333C'} padding={'13px 10px'}>
                  <AutoRow>
                    <TableTitle>
                      <div className="p-l-30">
                        <SelectTips options={TransactionType} label={transactionType} />
                      </div>
                    </TableTitle>
                    <TableTitle>Total Value</TableTitle>
                    <TableTitle>Token Amount</TableTitle>
                    <TableTitle>Token Amount</TableTitle>
                    <TableTitle>Account</TableTitle>
                    <TableTitle>Time (UTC)</TableTitle>
                  </AutoRow>
                </Card>

                <LightCard padding={'0 10px 10px'} borderRadius={'20px'}>
                  {txsLoading ? (
                    <TxItemWrapper>
                      {[1, 2].map(tx => {
                        return (
                          <AutoRow key={tx} style={{ borderBottom: '1px solid #3D3E46' }}>
                            <TxItem>
                              <Skeleton loading={txsLoading} width={120}></Skeleton>
                            </TxItem>
                            <TxItem>
                              <Skeleton loading={txsLoading} width={120}></Skeleton>
                            </TxItem>
                            <TxItem>
                              <Skeleton loading={txsLoading} width={120}></Skeleton>
                            </TxItem>
                            <TxItem>
                              <Skeleton loading={txsLoading} width={120}></Skeleton>
                            </TxItem>
                            <TxItem>
                              <Skeleton loading={txsLoading} width={120}></Skeleton>
                            </TxItem>
                            <TxItem>
                              <Skeleton loading={txsLoading} width={120}></Skeleton>
                            </TxItem>
                          </AutoRow>
                        )
                      })}
                    </TxItemWrapper>
                  ) : (
                    <>
                      <TxItemWrapper>
                        {dataSource.map(tx => {
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
                      {txsResult?.length > 0 && (
                        <Row justify="flex-end" marginTop={12}>
                          <Pagination
                            showQuickJumper
                            total={txsResult?.length || 0}
                            current={currentPage}
                            pageSize={pageSize}
                            showSizeChanger
                            pageSizeOptions={['5', '10', '20', '30', '40']}
                            onChange={onPagesChange}
                            onShowSizeChange={onPagesChange}
                          />{' '}
                          <span className="m-l-15" style={{ color: '#868790' }}>
                            Total {txsResult?.length || 0}
                          </span>
                        </Row>
                      )}
                    </>
                  )}
                </LightCard>
              </>
            ) : (
              <>
                <Card marginTop={30} borderRadius={'8px'} backgroundColor={'#33333C'} padding={'13px 20px'}>
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
                      <Skeleton loading={loading} width={120}>
                        <ExternalLink href={`${getEtherscanLink(chainId || 1, address, 'address')}`}>
                          <span style={{ color: '#fff' }}>{shortenAddress(address)}</span>
                        </ExternalLink>
                      </Skeleton>
                    </TableTitle>
                    <TableTitle>
                      <Skeleton loading={loading} width={120}>
                        {formatUTCDate(pool?.createAt)}
                      </Skeleton>
                    </TableTitle>
                    <TableTitle flex={0.8}>
                      <Skeleton loading={loading} width={70}>
                        {pool?.feeRate ? `${pool.feeRate * 100}%` : '--'}
                      </Skeleton>
                    </TableTitle>
                    <AutoColumn gap={'lg'} style={{ flex: 1.5 }}>
                      <TableTitle>
                        <Skeleton loading={loading} width={120}>
                          {pairMore
                            ? `≈ $${format.numFormat(format.amountFormat(pairMore.totalVolume, 2), 2, true)}`
                            : '--'}
                        </Skeleton>
                      </TableTitle>
                      <AutoRow gap={'5px'}>
                        <Skeleton loading={loading} width={24} height={24}>
                          <CurrencyLogo currency={pool?.tokens[0]} />
                        </Skeleton>
                        <Skeleton loading={loading} width={120}>
                          <TYPE.main>
                            {pool?.volume0Amount
                              ? `${pool.volume0Amount.toFixed(2, { groupSeparator: ',' })} ${token0Symbol}`
                              : '--'}
                          </TYPE.main>
                        </Skeleton>
                      </AutoRow>
                      <AutoRow gap={'5px'}>
                        <Skeleton loading={loading} width={24} height={24}>
                          <CurrencyLogo currency={pool?.tokens[1]} />
                        </Skeleton>
                        <Skeleton loading={loading} width={120}>
                          <TYPE.main>
                            {pool?.volume1Amount
                              ? `${pool.volume1Amount.toFixed(2, { groupSeparator: ',' })} ${token1Symbol}`
                              : '--'}
                          </TYPE.main>
                        </Skeleton>
                      </AutoRow>
                    </AutoColumn>
                    <AutoColumn gap={'lg'} style={{ flex: 1.5 }}>
                      <TableTitle>
                        <Skeleton loading={loading} width={120}>
                          {pairMore && pool?.feeRate
                            ? `≈ $${format.amountFormat(pairMore.totalVolume * pool.feeRate, 2)}`
                            : '--'}
                        </Skeleton>
                      </TableTitle>
                      <AutoRow gap={'5px'}>
                        <Skeleton loading={loading} width={24} height={24}>
                          <CurrencyLogo currency={pool?.tokens[0]} />
                        </Skeleton>
                        <Skeleton loading={loading} width={120}>
                          <TYPE.main>
                            {pool?.volume0Amount && pool?.feeRate
                              ? `${format.amountFormat(
                                  Number(pool?.volume0Amount.toFixed(2)) * pool.feeRate,
                                  2
                                )} ${token0Symbol}`
                              : '--'}
                          </TYPE.main>
                        </Skeleton>
                      </AutoRow>
                      <AutoRow gap={'5px'}>
                        <Skeleton loading={loading} width={24} height={24}>
                          <CurrencyLogo currency={pool?.tokens[1]} />
                        </Skeleton>
                        <Skeleton loading={loading} width={120}>
                          <TYPE.main>
                            {pool?.volume1Amount && pool?.feeRate
                              ? `${format.amountFormat(
                                  Number(pool?.volume1Amount.toFixed(2)) * pool.feeRate,
                                  2
                                )} ${token1Symbol}`
                              : '--'}
                          </TYPE.main>
                        </Skeleton>
                      </AutoRow>
                    </AutoColumn>
                    <TableTitle>
                      <Skeleton loading={loading} width={120}>
                        {pool ? pool.txCount : '--'}
                      </Skeleton>
                    </TableTitle>
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
