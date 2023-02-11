import { PoolInfo } from '../../state/stake/hooks'
import styled from 'styled-components'
import Card from '../Card'
import { AutoRow, RowFixed } from '../Row'
import DoubleCurrencyLogo from '../DoubleLogo'
import { Text } from 'rebass'
import { shortenAddress } from '../../utils'
import { TYPE } from '../../theme'
import Column, { GapColumn } from '../Column'
import React from 'react'

const StyledPoolCard = styled(Card)`
  border-radius: 0;
  border: none;
  position: relative;
  overflow: hidden;
  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.bg3};
  }
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
            <TYPE.white>1111111</TYPE.white>
            <TYPE.white>1111111</TYPE.white>
          </Column>
        </ContentRow>
        <ContentRow>
          <Column>
            <TYPE.white>1111111</TYPE.white>
            <TYPE.white>1111111</TYPE.white>
          </Column>
        </ContentRow>
        <ContentRow>
          <Column>
            <TYPE.white>1111111</TYPE.white>
            <TYPE.white>1111111</TYPE.white>
          </Column>
        </ContentRow>
        <ContentRow>
          <Column>
            <TYPE.white>1111111</TYPE.white>
            <TYPE.white>1111111</TYPE.white>
          </Column>
        </ContentRow>
        <ContentRow>
          <Column>
            <TYPE.white>1111111</TYPE.white>
            <TYPE.white>1111111</TYPE.white>
          </Column>
        </ContentRow>
      </AutoRow>
    </StyledPoolCard>
  )
}
