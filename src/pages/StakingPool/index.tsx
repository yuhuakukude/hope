import React, { useState, useEffect } from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { AutoRow, RowBetween, RowFixed } from '../../components/Row'
import { CardSection, DataCard } from '../../components/earn/styled'
import Loader from '../../components/Loader'
import { OutlineCard } from '../../components/Card'
import { ButtonPrimary } from '../../components/Button'
import { useLPStakingPairsInfos, useOverviewData } from '../../hooks/useLPStaking'
import StakingPoolCard from '../../components/stakingPool/StakingPoolCard'
import { TYPE } from '../../theme'
import Overview, { OverviewData } from '../../components/pool/Overview'
import LineCharts from '../../components/pool/LineCharts'
import BarCharts from '../../components/pool/BarCharts'
import { Pagination } from 'antd'
import Row from '../../components/Row'
import SearchSelect from '../../components/SearchSelect'
import { Link } from 'react-router-dom'
import { Decimal } from 'decimal.js'
import format from '../../utils/format'
import { useOverviewTvlChartsData, useOverviewVolChartsData } from '../../hooks/useCharts'
import QuestionHelper from 'components/QuestionHelper'

const PageWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 0 30px;
`

const PoolsWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 30px;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.bg1};
`

const PositionTitleWrapper = styled(AutoRow)`
  border-radius: 10px;
  background-color: ${({ theme }) => theme.bg3};
  padding: 20px;
`

const PositionTitle = styled(TYPE.subHeader)<{ flex?: number }>`
  flex: ${({ flex }) => flex ?? '1'};
`

const TopSection = styled(AutoColumn)`
  width: 100%;
`

const PoolSection = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  grid-template-columns: 1fr;
  column-gap: 15px;
  row-gap: 15px;
  width: 100%;
  justify-self: center;
`
const NameText = styled.p`
  color: ${({ theme }) => theme.text1};
  font-size: 18px;
  font-family: Arboria-Medium;
`
const AmountText = styled.p`
  color: #0ecb81;
  font-size: 18px;
  font-family: Arboria-Medium;
`
const TimeText = styled.p`
  color: ${({ theme }) => theme.text2};
  font-size: 16px;
`

type Sort = 'asc' | 'desc'

export default function StakingPool() {
  const [inputValue, setInputValue] = useState('')
  const [chartLineTotal, setChartLineTotal] = useState<string>('0')
  const [chartBarTotal, setChartBarTotal] = useState<string>('0')
  const [tvlCurrentInfo, setTvlCurrentInfo] = useState<any>({ x: '', y: '' })
  const [volCurrentInfo, setVolCurrentInfo] = useState<any>({ x: '', y: '' })
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(5)
  const [sort] = useState<Sort>('desc')
  const [xLineData, setXLineData] = useState<string[]>()
  const [yLineData, setYLineData] = useState<string[]>()
  const [xBarData, setXBarData] = useState<string[]>()
  const [yBarData, setYBarData] = useState<string[]>()
  const { result: overviewData } = useOverviewData()
  const viewData: OverviewData[] = [
    {
      title: 'TVL',
      isRise: !!overviewData && overviewData.tvlChangeUSD > 0,
      rate: overviewData ? `${overviewData.tvlChangeUSD.toFixed(2)} %` : `--`,
      amount: overviewData ? `$${format.separate(Number(overviewData.tvl).toFixed(2))}` : `--`
    },
    {
      title: 'Volume(24H)',
      isRise: !!overviewData && overviewData.volumeChangeUSD > 0,
      rate: overviewData ? `${overviewData.volumeChangeUSD.toFixed(2)} %` : `--`,
      amount: overviewData ? `$${format.separate(overviewData.oneDayVolumeUSD.toFixed(2))}` : `--`
    },
    {
      title: 'Fees(24H)',
      isRise: !!overviewData && overviewData.volumeChangeUSD > 0,
      rate: overviewData ? `${overviewData.volumeChangeUSD.toFixed(2)} %` : `--`,
      amount: overviewData ? `$${format.separate(overviewData.dayFees.toFixed(2))}` : `--`
    },
    {
      title: 'Fees(7d)',
      isRise: !!overviewData && overviewData.weeklyVolumeChange > 0,
      rate: overviewData ? `${overviewData.weeklyVolumeChange.toFixed(2)} %` : `--`,
      amount: overviewData ? `$${format.separate(overviewData.weekFees.toFixed(2))}` : `--`
    }
  ]

  const { result: pairs, loading, total, tokenList } = useLPStakingPairsInfos(inputValue, sort, currentPage, pageSize)
  const { result: overviewTvlChartsResult } = useOverviewTvlChartsData()
  const { result: overviewVolChartsResult } = useOverviewVolChartsData()

  useEffect(() => {
    const xlineArr: string[] = []
    const ylineArr: string[] = []

    const xbarArr: string[] = []
    const ybarArr: string[] = []
    overviewTvlChartsResult?.forEach((item: any) => {
      xlineArr.unshift(item.date)
      ylineArr.unshift(item.totalLiquidityUSD?.toFixed(2))
    })
    overviewVolChartsResult?.forEach((item: any) => {
      xbarArr.unshift(item.hourStartUnix)
      ybarArr.unshift(item.hourlyVolumeUSD?.toFixed(2))
    })
    setXLineData(xlineArr)
    setYLineData(ylineArr)
    setXBarData(xbarArr)
    setYBarData(ybarArr)

    const totaLinelVal = ylineArr.reduce((prev, curr) => new Decimal(prev).add(new Decimal(curr)).toNumber(), 0)
    const totalBarVal = ybarArr.reduce((prev, curr) => new Decimal(prev).add(new Decimal(curr)).toNumber(), 0)
    setChartLineTotal(totaLinelVal.toFixed(2))
    setChartBarTotal(totalBarVal.toFixed(2))
  }, [overviewTvlChartsResult, overviewVolChartsResult])

  // staking info for connected account

  const onPagesChange = (page: any, pageSize: any) => {
    setCurrentPage(page)
    setPageSize(pageSize)
  }

  const getTvlCurrentData = (xCurrent: any, yCurrent: any) => {
    setTvlCurrentInfo({ x: xCurrent, y: yCurrent })
  }

  const getVolCurrentData = (xCurrent: any, yCurrent: any) => {
    setVolCurrentInfo({ x: xCurrent, y: yCurrent })
  }

  return (
    <PageWrapper gap="lg" justify="center">
      <TopSection>
        <RowBetween>
          <p style={{ fontSize: '28px' }}>Pool Overview</p>
          <ButtonPrimary padding={'12px 24px'} as={Link} to={'/swap/add/ETH'} style={{ width: 'max-content' }}>
            New Position
          </ButtonPrimary>
        </RowBetween>
        <Overview viewData={viewData}></Overview>
      </TopSection>
      <RowBetween style={{ width: '100%' }}>
        <PoolsWrapper style={{ width: '49%', height: '340px' }}>
          <div>
            <AutoRow gap={'10px'}>
              <NameText>TVL</NameText>
              <AmountText>$ {format.separate(tvlCurrentInfo.y, 2)}</AmountText>
              <TimeText>{tvlCurrentInfo.x === 'total' ? `Last 7 Days` : tvlCurrentInfo.x}</TimeText>
            </AutoRow>
            <LineCharts
              xData={xLineData}
              yData={yLineData}
              height={240}
              total={chartLineTotal}
              left={8}
              bottom={13}
              getCurrentData={getTvlCurrentData}
            ></LineCharts>
          </div>
        </PoolsWrapper>
        <PoolsWrapper style={{ width: '49%', height: '340px' }}>
          <div>
            <AutoRow gap={'10px'}>
              <NameText>Volume</NameText>
              <AmountText>$ {format.separate(volCurrentInfo.y, 2)}</AmountText>
              <TimeText>{volCurrentInfo.x === 'total' ? `Last 24 Hour` : volCurrentInfo.x}</TimeText>
            </AutoRow>
            <BarCharts
              xData={xBarData}
              yData={yBarData}
              left={8}
              total={chartBarTotal}
              is24Hour={true}
              getCurrentData={getVolCurrentData}
            ></BarCharts>
          </div>
        </PoolsWrapper>
      </RowBetween>
      <PoolsWrapper>
        <TopSection gap="md">
          <DataCard>
            <CardSection>
              <AutoColumn justify="end">
                <RowFixed gap={'md'}>
                  <div style={{ width: '440px' }} className="m-r-20">
                    <SearchSelect
                      getResult={adress => setInputValue(adress)}
                      placeholder={'Search Token Symbol / Address'}
                      list={tokenList}
                    ></SearchSelect>
                  </div>
                </RowFixed>
              </AutoColumn>
            </CardSection>
          </DataCard>
        </TopSection>
        <AutoColumn gap="lg" style={{ width: '100%', marginTop: '20px' }}>
          <PositionTitleWrapper>
            <PositionTitle flex={2}>Pool</PositionTitle>
            <PositionTitle>Fee Rate</PositionTitle>
            <PositionTitle flex={2.5}>Liquidity（TVL）</PositionTitle>
            <PositionTitle flex={2}>Fees(24H)</PositionTitle>
            <PositionTitle>Volume(24H)</PositionTitle>
            <PositionTitle>
              <div className="flex ai-center">
                Combined APR
                <QuestionHelper text="The APR (USD denominated) is calculated using token prices denominated in USD. Prices are fetched either from HopeSwap pools. Also, the APR is a 365 day projection based on each pool's performance over the last 24h. See Hope Ecosystem Disclaimers & Disclosures for more details" />{' '}
              </div>
            </PositionTitle>
            <PositionTitle>Actions</PositionTitle>
          </PositionTitleWrapper>
          <PoolSection>
            {loading ? (
              <Loader style={{ margin: 'auto' }} />
            ) : pairs && pairs?.length === 0 ? (
              <OutlineCard>No active pools</OutlineCard>
            ) : (
              pairs.map((pair, index) => {
                // need to sort by added liquidity here
                return <StakingPoolCard key={index} pair={pair} />
              })
            )}
          </PoolSection>
          {total > 0 && (
            <Row justify="center">
              <Pagination
                showQuickJumper
                total={total}
                current={currentPage}
                pageSize={pageSize}
                showSizeChanger
                onChange={onPagesChange}
              />{' '}
              <span className="m-l-15" style={{ color: '#868790' }}>
                Total {total}
              </span>
            </Row>
          )}
        </AutoColumn>
      </PoolsWrapper>
    </PageWrapper>
  )
}
