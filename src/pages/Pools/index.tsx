import React, { useState } from 'react'
import styled from 'styled-components'
import Column, { AutoColumn } from '../../components/Column'
import { AutoRow, RowBetween } from '../../components/Row'
import { TYPE } from '../../theme'
import { ButtonPrimary } from '../../components/Button'
import { TabItem, TabWrapper } from '../../components/Tab'
import MyLiquidityPools from '../Portfolio/component/MyLiquidityPools'

const PageWrapper = styled(Column)`
  padding: 0 30px;
  width: 100%;
  min-width: 1390px;
`

const TableWrapper = styled(AutoColumn)``

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

const titles = [
  { value: 'Pools' },
  { value: 'TVL' },
  { value: 'Volume (24h)' },
  { value: 'Base APR' },
  { value: 'Reward APR' },
  { value: 'Mining Rewards' }
]
export default function Pools() {
  const [isAll, setIsAll] = useState(true)
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
      <MyLiquidityPools />
      <TableWrapper>
        <TableTitleWrapper>
          {titles.map(({ value }, index) => (
            <TableTitle key={index}>{value}</TableTitle>
          ))}
        </TableTitleWrapper>
      </TableWrapper>
    </PageWrapper>
  )
}
