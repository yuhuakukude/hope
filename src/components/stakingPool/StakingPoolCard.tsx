import { GraphPairInfo } from '../../state/stake/hooks'
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
import format from '../../utils/format'
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

const ContentRow = styled(RowFixed)<{ flex?: number }>`
  flex: ${({ flex }) => flex ?? '1'};
`

export default function StakingPoolCard({ pair }: { pair: GraphPairInfo }) {
  const token0 = pair.token0
  const token1 = pair.token1

  return (
    <StyledPoolCard>
      <AutoRow>
        <ContentRow flex={2}>
          <GapColumn gap={'10px'}>
            <RowFixed gap={'10px'}>
              <DoubleCurrencyLogo margin currency0={token0} currency1={token1} size={24} />
              <TYPE.white>{`${token0.symbol}/${token1.symbol}`}</TYPE.white>
            </RowFixed>
            <Text ml={'-10px'} fontWeight={500}>
              {shortenAddress(pair.address)}
            </Text>
          </GapColumn>
        </ContentRow>
        <ContentRow>
          <Text fontSize={16} fontWeight={500}>
            0.3%
          </Text>
        </ContentRow>
        <ContentRow flex={2.5}>
          <Column>
            <Row>
              <PieCharts
                data={pair ? [pair.reserve0.toFixed(2), pair.reserve1.toFixed(2)] : [100, 0]}
                size={42}
              ></PieCharts>
              <div className="m-l-12">
                <Row>
                  <Circular></Circular>
                  <TYPE.white>{pair ? `${pair.reserve0.toFixed(2)} / ${token0.symbol}` : '-- / --'}</TYPE.white>
                </Row>
                <Row>
                  <Circular color={'#8FFBAE'}></Circular>
                  <TYPE.white>{pair ? `${pair.reserve1.toFixed(2)} / ${token1.symbol}` : '-- / --'}</TYPE.white>
                </Row>
              </div>
            </Row>
          </Column>
        </ContentRow>
        <ContentRow flex={2}>
          <Column>
            <Row>
              <Circular></Circular>
              <TYPE.white>{pair ? `${pair.volume0.toFixed(2)} / ${token0.symbol}` : '-- / --'}</TYPE.white>
            </Row>
            <Row>
              <Circular color={'#8FFBAE'}></Circular>
              <TYPE.white>{pair ? `${pair.volume1.toFixed(2)} / ${token1.symbol}` : '-- / --'}</TYPE.white>
            </Row>
          </Column>
        </ContentRow>
        <ContentRow>
          <Column>
            <TYPE.white>{pair ? `$${pair.oneDayVolumeUSD.toFixed(2)}` : '--'}</TYPE.white>
          </Column>
        </ContentRow>
        <ContentRow>
          <Column>
            <TYPE.white>
              {`${format.rate(pair.baseApr || 0)}`} {Number(pair.maxApr) > 0 && <span> ~ </span>}
              <span className="text-error">{Number(pair.maxApr) > 0 ? `${format.rate(pair.maxApr || 0)}` : ''}</span>
            </TYPE.white>
          </Column>
        </ContentRow>
        <ContentRow>
          <Column>
            <Link to={`/swap/pool-detail/${pair.address}`}>
              <TYPE.link>details</TYPE.link>
            </Link>
          </Column>
        </ContentRow>
      </AutoRow>
    </StyledPoolCard>
  )
}
