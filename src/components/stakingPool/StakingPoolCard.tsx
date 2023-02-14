import { PoolInfo } from '../../state/stake/hooks'
import styled from 'styled-components'
import Card from '../Card'
import Row, { AutoRow, RowFixed } from '../Row'
import DoubleCurrencyLogo from '../DoubleLogo'
import { Text } from 'rebass'
import { shortenAddress } from '../../utils'
import { TYPE } from '../../theme'
import Column, { GapColumn } from '../Column'
import React from 'react'
import { Link } from 'react-router-dom'
import { Box } from 'rebass/styled-components'
import PieCharts from '../../components/pool/PieCharts'

const StyledPoolCard = styled(Card)`
  border-radius: 0;
  border: none;
  position: relative;
  overflow: hidden;
  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.bg3};
  }
`

const Circular = styled(Box)<{
  color?: string
}>`
  background: ${({ color }) => color ?? '#E1C991'};
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 6px;
`

const ContentRow = styled(RowFixed)`
  flex: 1;
`

export default function StakingPoolCard({ pool }: { pool: PoolInfo }) {
  const token0 = pool.tokens[0]
  const token1 = pool.tokens[1]
  return (
    <StyledPoolCard>
      <AutoRow>
        <ContentRow>
          <GapColumn gap={'10px'}>
            <RowFixed gap={'10px'}>
              <DoubleCurrencyLogo margin currency0={token0} currency1={token1} size={24} />
              <TYPE.white>{`${token0.symbol}/${token1.symbol}`}</TYPE.white>
            </RowFixed>
            <Text ml={'-10px'} fontWeight={500}>
              {shortenAddress(pool.lpToken.address)}
            </Text>
          </GapColumn>
        </ContentRow>
        <ContentRow>
          <Text fontSize={16} fontWeight={500}>
            1%
          </Text>
        </ContentRow>
        <ContentRow>
          <Column>
            <Row>
              <PieCharts data={[pool.token0Amount.toFixed(2), pool.token1Amount.toFixed(2)]} size={42}></PieCharts>
              <div className="m-l-12">
                <Row>
                  <Circular></Circular>
                  <TYPE.white>{`${pool.token0Amount.toFixed(2, { groupSeparator: ',' })} / ${
                    token0.symbol
                  }`}</TYPE.white>
                </Row>
                <Row>
                  <Circular color={'#8FFBAE'}></Circular>
                  <TYPE.white>{`${pool.token1Amount.toFixed(2, { groupSeparator: ',' })} / ${
                    token1.symbol
                  }`}</TYPE.white>
                </Row>
              </div>
            </Row>
          </Column>
        </ContentRow>
        <ContentRow>
          <Column>
            <Row>
              <Circular></Circular>
              <TYPE.white>{`${pool.volume0Amount.toFixed(2, { groupSeparator: ',' })} / ${token0.symbol}`}</TYPE.white>
            </Row>
            <Row>
              <Circular color={'#8FFBAE'}></Circular>
              <TYPE.white>{`${pool.volume1Amount.toFixed(2, { groupSeparator: ',' })} / ${token0.symbol}`}</TYPE.white>
            </Row>
          </Column>
        </ContentRow>
        <ContentRow>
          <Column>
            <TYPE.white>{`$${pool.volumeAmount.toFixed(2, { groupSeparator: ',' })}`}</TYPE.white>
          </Column>
        </ContentRow>
        <ContentRow>
          <Column>
            <TYPE.white>--</TYPE.white>
          </Column>
        </ContentRow>
        <ContentRow>
          <Column>
            <Link to={`/swap/pool-detail/${pool.stakingRewardAddress}`}>
              <TYPE.link>details</TYPE.link>
            </Link>
          </Column>
        </ContentRow>
      </AutoRow>
    </StyledPoolCard>
  )
}
