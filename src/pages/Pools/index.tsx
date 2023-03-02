import React, { useState } from 'react'
import styled from 'styled-components'
import { AutoColumn } from '../../components/Column'
import { AutoRow, RowBetween } from '../../components/Row'
import { TYPE } from '../../theme'
import { ButtonPrimary } from '../../components/Button'
import { TabItem, TabWrapper } from '../../components/Tab'
import usePairsInfo from '../../hooks/usePairInfo'
import PoolCard from '../../components/pool/PoolCard'
import FullPositionCard from '../../components/PositionCard'

const PageWrapper = styled(AutoColumn)`
  padding: 0 30px;
  width: 100%;
  min-width: 1390px;
`

const TableWrapper = styled(AutoColumn)`
  margin-top: 30px;
`

const TableTitleWrapper = styled(AutoColumn)`
  display: flex;
  padding: 14px 30px;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.bg1};
`

const TableTitle = styled(TYPE.main)`
  flex: 1;
  font-size: 14px;
`

const poolTitles = [
  { value: 'Pools', weight: 1.5 },
  { value: 'TVL' },
  { value: 'Volume (24h)' },
  { value: 'Base APR' },
  { value: 'Reward APR' },
  { value: 'Mining Rewards' },
  { value: ' ', weight: 0.5 }
]

const positionTitles = [
  { value: 'Pools', weight: 1 },
  { value: 'My Composition' },
  { value: 'LP Tokens' },
  { value: 'Boost' },
  { value: 'APR' },
  { value: 'Claimable Rewards' },
  { value: 'Actions', weight: 0.5 }
]
export default function Pools() {
  const [isAll, setIsAll] = useState(true)
  const { pairInfos } = usePairsInfo()
  console.log('pairInfos', pairInfos)
  return (
    <PageWrapper>
      <RowBetween>
        <TYPE.largeHeader>Pools</TYPE.largeHeader>
        <ButtonPrimary width={'150px'} height={'42px'}>
          New Position
        </ButtonPrimary>
      </RowBetween>
      　
      <AutoRow>
        <TabWrapper>
          <TabItem onClick={() => setIsAll(true)} isActive={isAll}>
            All
          </TabItem>
          <TabItem onClick={() => setIsAll(false)} isActive={!isAll}>
            My Positions
          </TabItem>
        </TabWrapper>
      </AutoRow>
      <TableWrapper>
        <TableTitleWrapper>
          {(isAll ? poolTitles : positionTitles).map(({ value, weight }, index) => (
            <TableTitle key={index} flex={weight ?? 1}>
              {value}
            </TableTitle>
          ))}
        </TableTitleWrapper>
      </TableWrapper>
      {isAll ? (
        <>
          {pairInfos.map(amountPair => (
            <PoolCard key={amountPair.pair.liquidityToken.address} tvl={amountPair.tvl} pairInfo={amountPair.pair} />
          ))}
        </>
      ) : (
        <>
          {pairInfos.map(amountPair => (
            <FullPositionCard
              key={amountPair.pair.liquidityToken.address}
              feeRate={amountPair.feeRate}
              pairInfo={amountPair.pair}
              stakedBalance={amountPair.stakedAmount}
            />
          ))}
        </>
      )}
    </PageWrapper>
  )
}
