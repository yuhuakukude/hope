import React, { useState } from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { TYPE } from '../../theme'
import { RowFixed } from '../../components/Row'
import { CardSection, DataCard, EarnBGImage } from '../../components/earn/styled'
import Loader from '../../components/Loader'
import { OutlineCard } from '../../components/Card'
import { SearchInput } from '../../components/SearchModal/styleds'
import { ButtonGray } from '../../components/Button'
import { useLPStakingInfos } from '../../hooks/useLPStaking'
import LTPoolCard from '../../components/earn/LTPoolCard'

const PageWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 0 30px;
`

const TopSection = styled(AutoColumn)`
  width: 100%;
`

const PoolSection = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 10px;
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

export default function Earn() {
  const [curType, setCurType] = useState(1)
  const [searchContent, setSearchContent] = useState('')
  const [sort, setSort] = useState<Sort>('desc')
  console.log(curType, setCurType, setSearchContent, setSort)
  const { result: stakingInfos, loading, page } = useLPStakingInfos(searchContent, sort)
  console.log('poolStakingInfos', stakingInfos, page)
  // staking info for connected account

  return (
    <PageWrapper gap="lg" justify="center">
      <TopSection gap="md">
        <DataCard>
          <CardSection>
            <AutoColumn style={{ padding: 30 }} gap="lg">
              <RowFixed>
                <TYPE.white fontSize={28} fontWeight={600}>
                  Provide Liquidity, Earn $LT
                </TYPE.white>
                <TYPE.link>Tutorial</TYPE.link>
              </RowFixed>
              <AutoColumn gap={'sm'}>
                <TYPE.main>Total Value Locked(TVL)</TYPE.main>
                <TYPE.white fontSize={28}>$1,934,015,678.26</TYPE.white>
              </AutoColumn>
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
          <EarnBGImage />
        </DataCard>
      </TopSection>

      <AutoColumn gap="lg" style={{ width: '100%' }}>
        <PoolSection>
          {loading ? (
            <Loader style={{ margin: 'auto' }} />
          ) : stakingInfos && stakingInfos?.length === 0 ? (
            <OutlineCard>No active pools</OutlineCard>
          ) : (
            stakingInfos.map((stakingInfo, index) => {
              // need to sort by added liquidity here
              return <LTPoolCard key={index} stakingInfo={stakingInfo} />
            })
          )}
        </PoolSection>
      </AutoColumn>
    </PageWrapper>
  )
}
