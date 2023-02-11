import React, { useState } from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { AutoRow, RowFixed } from '../../components/Row'
import { CardSection, DataCard } from '../../components/earn/styled'
import Loader from '../../components/Loader'
import { OutlineCard } from '../../components/Card'
import { SearchInput } from '../../components/SearchModal/styleds'
import { ButtonGray } from '../../components/Button'
import { useLPStakingInfos } from '../../hooks/useLPStaking'
import StakingPoolCard from '../../components/stakingPool/StakingPoolCard'
import { TYPE } from '../../theme'

const PageWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 0 30px;
`

const PoolsWrapper = styled(AutoColumn)`
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
                  <ButtonGray>Search</ButtonGray>
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
