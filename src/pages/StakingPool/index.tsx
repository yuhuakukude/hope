import React, { useState } from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { AutoRow, RowBetween, RowFixed } from '../../components/Row'
import { CardSection, DataCard } from '../../components/earn/styled'
import Loader from '../../components/Loader'
import { OutlineCard } from '../../components/Card'
import { SearchInput } from '../../components/SearchModal/styleds'
import { ButtonPrimary } from '../../components/Button'
import { useLPStakingInfos } from '../../hooks/useLPStaking'
import StakingPoolCard from '../../components/stakingPool/StakingPoolCard'
import { TYPE } from '../../theme'
import Overview from '../../components/pool/Overview'
import LineCharts from '../../components/pool/LineCharts'
import BarCharts from '../../components/pool/BarCharts'

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

const PositionTitle = styled(TYPE.subHeader)`
  flex: 1;
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
  const [curType, setCurType] = useState(1)

  const [searchContent, setSearchContent] = useState('')
  const [sort, setSort] = useState<Sort>('desc')
  console.log(curType, setCurType, setSearchContent, setSort)
  const { result: stakingInfos, loading, page } = useLPStakingInfos(searchContent, sort)
  console.log('poolStakingInfos', page)
  // staking info for connected account

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
              <AutoColumn style={{ padding: 30 }} gap="lg">
                <RowFixed gap={'md'}>
                  <SearchInput
                    width={440}
                    type="text"
                    id="token-search-input"
                    placeholder={'Search Token Symbol / Address'}
                    autoComplete="off"
                    value={''}
                    onChange={() => {}}
                    onKeyDown={() => {}}
                  />
                  <ButtonPrimary>Search</ButtonPrimary>
                </RowFixed>
              </AutoColumn>
            </CardSection>
          </DataCard>
        </TopSection>
        <AutoColumn gap="lg" style={{ width: '100%' }}>
          <PositionTitleWrapper>
            <PositionTitle>Pool</PositionTitle>
            <PositionTitle>Fee Rate</PositionTitle>
            <PositionTitle>Liquidity（TVL）</PositionTitle>
            <PositionTitle>Fees(24H)</PositionTitle>
            <PositionTitle>Combined APR</PositionTitle>
            <PositionTitle>Volume(24H)</PositionTitle>
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
        </AutoColumn>
      </PoolsWrapper>
    </PageWrapper>
  )
}
