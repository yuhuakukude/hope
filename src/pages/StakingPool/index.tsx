import React, { useState, useRef, RefObject, useEffect } from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { AutoRow, RowBetween, RowFixed } from '../../components/Row'
import { CardSection, DataCard } from '../../components/earn/styled'
import Loader from '../../components/Loader'
import { Decimal } from 'decimal.js'
import { OutlineCard } from '../../components/Card'
import { SearchInput } from '../../components/SearchModal/styleds'
import { ButtonPrimary } from '../../components/Button'
import { useLPStakingPairsInfos, useOverviewData } from '../../hooks/useLPStaking'
import StakingPoolCard from '../../components/stakingPool/StakingPoolCard'
import { TYPE } from '../../theme'
import Overview, { OverviewData } from '../../components/pool/Overview'
import LineCharts from '../../components/pool/LineCharts'
import BarCharts from '../../components/pool/BarCharts'
import { Pagination } from 'antd'
import Row from '../../components/Row'
import { Link } from 'react-router-dom'
import format from '../../utils/format'
import { useOverviewChartsData } from '../../hooks/useCharts'

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

// const DataRow = styled(RowBetween)`
//   ${({ theme }) => theme.mediaWidth.upToSmall`
// flex-direction: column;
// `};
// `
const NameText = styled.p`
  color: ${({ theme }) => theme.text1};
  font-size: 18px;
`
const TimeText = styled.p`
  color: ${({ theme }) => theme.text2};
  font-size: 16px;
`

type Sort = 'asc' | 'desc'

export default function StakingPool() {
  const inputRef = useRef<HTMLInputElement>()
  const [inputValue, setInputValue] = useState('')
  const [tvlTotal, setTvlTotal] = useState('')
  const [searchContent, setSearchContent] = useState('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(5)
  const [sort, setSort] = useState<Sort>('desc')
  const [xLineData, setXLineData] = useState<string[]>()
  const [yLineData, setYLineData] = useState<string[]>()
  const [xBarData, setXBarData] = useState<string[]>()
  const [yBarData, setYBarData] = useState<string[]>()
  const { result: overviewData } = useOverviewData()
  const viewData: OverviewData[] = [
    {
      title: 'Pool Overview',
      isRise: !!overviewData && overviewData.tvlChangeUSD > 0,
      rate: overviewData ? `${overviewData.tvlChangeUSD.toFixed(2)} %` : `--`,
      amount: overviewData ? `$${Number(overviewData.tvl).toFixed(2)}` : `--`
    },
    {
      title: 'Volume(24H)',
      isRise: !!overviewData && overviewData.volumeChangeUSD > 0,
      rate: overviewData ? `${overviewData.volumeChangeUSD.toFixed(2)}` : `--`,
      amount: overviewData ? `$${overviewData.oneDayVolumeUSD.toFixed(2)}` : `--`
    },
    {
      title: 'Fees(24H)',
      isRise: !!overviewData && overviewData.volumeChangeUSD > 0,
      rate: overviewData ? `${overviewData.volumeChangeUSD.toFixed(2)}` : `--`,
      amount: overviewData ? `$${overviewData.dayFees.toFixed(2)}` : `--`
    },
    {
      title: 'Fess(7d)',
      isRise: !!overviewData && overviewData.weeklyVolumeChange > 0,
      rate: overviewData ? `${overviewData.weeklyVolumeChange.toFixed(2)}` : `--`,
      amount: overviewData ? `$${overviewData.weekFees.toFixed(2)}` : `--`
    }
  ]

  console.log(setSort)
  const { result: pairs, loading, total } = useLPStakingPairsInfos(searchContent, sort, currentPage, pageSize)
  const { result: overviewChartsResult } = useOverviewChartsData()

  useEffect(() => {
    const xlineArr: string[] = []
    const ylineArr: string[] = []

    const xbarArr: string[] = []
    const ybarArr: string[] = []
    let tvlTotalVal = 0
    overviewChartsResult?.forEach((item: any) => {
      tvlTotalVal = new Decimal(item.totalLiquidityUSD || 0).add(new Decimal(tvlTotalVal)).toNumber()
      xlineArr.unshift(format.formatUTCDate(item.date, 'MM-DD'))
      ylineArr.unshift(item.totalLiquidityUSD?.toFixed(2))

      xbarArr.unshift(format.formatUTCDate(item.date, 'MM-DD'))
      ybarArr.unshift(item.dailyVolumeUSD?.toFixed(2))
    })
    setTvlTotal(tvlTotalVal.toFixed(2))
    setXLineData(xlineArr)
    setYLineData(ylineArr)
    setXBarData(xbarArr)
    setYBarData(ybarArr)
  }, [overviewChartsResult])

  // staking info for connected account

  const onPagesChange = (page: any, pageSize: any) => {
    setCurrentPage(page)
    setPageSize(pageSize)
  }

  const handleInput = (event: any) => {
    const input = event.target.value
    setInputValue(input)
  }

  return (
    <PageWrapper gap="lg" justify="center">
      <TopSection>
        <RowBetween>
          <p style={{ fontSize: '28px' }}>Pool Overview</p>
          <ButtonPrimary as={Link} to={'/add/ETH'} style={{ width: 'max-content' }}>
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
              <NameText>{tvlTotal ? tvlTotal : '--'}</NameText>
              <TimeText>last 7Days</TimeText>
            </AutoRow>
            <LineCharts xData={xLineData} yData={yLineData} height={240}></LineCharts>
          </div>
        </PoolsWrapper>
        <PoolsWrapper style={{ width: '49%', height: '340px' }}>
          <div>
            <AutoRow gap={'10px'}>
              <NameText>Volume</NameText>
              <NameText>{overviewData ? `$${overviewData.oneDayVolumeUSD.toFixed(2)}` : `0.00`}</NameText>
              <TimeText>last 7Days</TimeText>
            </AutoRow>
            <BarCharts xData={xBarData} yData={yBarData}></BarCharts>
          </div>
        </PoolsWrapper>
      </RowBetween>
      <PoolsWrapper>
        <TopSection gap="md">
          <DataCard>
            <CardSection>
              <AutoColumn justify="end">
                <RowFixed gap={'md'}>
                  <SearchInput
                    width={440}
                    type="text"
                    id="token-search-input"
                    placeholder={'Search Token Symbol / Address'}
                    autoComplete="off"
                    ref={inputRef as RefObject<HTMLInputElement>}
                    value={inputValue}
                    onChange={handleInput}
                  />
                  <ButtonPrimary marginLeft={20} onClick={() => setSearchContent(inputValue)}>
                    Search
                  </ButtonPrimary>
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
            <PositionTitle>Combined APR</PositionTitle>
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
        </AutoColumn>
      </PoolsWrapper>
    </PageWrapper>
  )
}
