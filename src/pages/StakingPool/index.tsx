import React, { useState, useRef, RefObject } from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { AutoRow, RowBetween, RowFixed } from '../../components/Row'
import { CardSection, DataCard } from '../../components/earn/styled'
import Loader from '../../components/Loader'
import { OutlineCard } from '../../components/Card'
import { SearchInput } from '../../components/SearchModal/styleds'
import { ButtonPrimary } from '../../components/Button'
import { useLPStakingPairsInfos } from '../../hooks/useLPStaking'
import StakingPoolCard from '../../components/stakingPool/StakingPoolCard'
import { TYPE } from '../../theme'
import Overview from '../../components/pool/Overview'
import LineCharts from '../../components/pool/LineCharts'
import BarCharts from '../../components/pool/BarCharts'
import { Pagination } from 'antd'
import Row from '../../components/Row'

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

function ChartView({ type }: { type: string }) {
  const fakeData = {
    name: 'TVL',
    value: '$78.34 M',
    time: 'last 7Days'
  }

  return (
    <PoolsWrapper style={{ width: '49%', height: '340px' }}>
      <div>
        <AutoRow gap={'10px'}>
          <NameText>{fakeData.name}</NameText>
          <NameText>{fakeData.value}</NameText>
          <TimeText>{fakeData.time}</TimeText>
        </AutoRow>
        {type === 'line' && (
          <LineCharts
            height={240}
            hideTab={true}
            xData={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
            yData={[820, 32, 901, 134, 1290, 900, 620]}
          ></LineCharts>
        )}
        {type === 'bar' && (
          <BarCharts
            xData={[1, 2, 3, 4, 5, 6, 7, 8, 9]}
            yData={[820, 32, 901, 134, 1290, 900, 620, 100, 800]}
          ></BarCharts>
        )}
      </div>
    </PoolsWrapper>
  )
}

type Sort = 'asc' | 'desc'

export default function StakingPool() {
  const inputRef = useRef<HTMLInputElement>()
  const [inputValue, setInputValue] = useState('')
  const [searchContent, setSearchContent] = useState('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(5)
  const [sort, setSort] = useState<Sort>('desc')
  console.log(setSort)
  const { result: stakingInfos, loading, total } = useLPStakingPairsInfos(searchContent, sort, currentPage, pageSize)
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
          <ButtonPrimary style={{ width: 'max-content' }}>New Position</ButtonPrimary>
        </RowBetween>
        <Overview></Overview>
      </TopSection>
      <RowBetween style={{ width: '100%' }}>
        <ChartView type={'line'} />
        <ChartView type={'bar'} />
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
            ) : stakingInfos && stakingInfos?.length === 0 ? (
              <OutlineCard>No active pools</OutlineCard>
            ) : (
              stakingInfos.map((pool, index) => {
                // need to sort by added liquidity here
                return <StakingPoolCard key={index} pool={pool} />
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
              共{total}条
            </span>
          </Row>
        </AutoColumn>
      </PoolsWrapper>
    </PageWrapper>
  )
}
