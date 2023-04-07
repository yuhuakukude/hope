import React from 'react'
import styled from 'styled-components'
import { unwrappedToken } from '../../utils/wrappedCurrency'
import { usePair } from '../../data/Reserves'
import { CurrencyAmount, Token } from '@uniswap/sdk'
import { useColor } from '../../hooks/useColor'
import { AutoRow, RowFixed } from '../Row'
import DoubleCurrencyLogo from '../DoubleLogo'
import { TYPE } from '../../theme'
import { LightCard } from '../Card'
import { ArrowUpRight } from 'react-feather'
import { useHistory } from 'react-router-dom'
import { BasePair } from '../../graph/fetch'
import { amountFormat, rate, numFormat } from '../../utils/format'

const StyledPositionCard = styled(LightCard)<{ bgColor: any }>`
  background-color: transparent;
  border-radius: 0;
  border: none;
  position: relative;
  overflow: hidden;
  &:hover {
    background-color: #1b1b1f;
  }
  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.bg3};
  }
`

const ContentRow = styled(RowFixed)<{ weight?: number }>`
  flex: ${({ weight }) => (weight ? weight : 1)};
`

const SmallCard = styled(TYPE.white)`
  background-color: ${({ theme }) => theme.bg3};
  border-radius: 6px;
  font-size: 12px;
  padding: 4px;
`

interface PoolCardProps {
  pairData: BasePair
  pairInfo: { liquidityToken: Token; tokens: [Token, Token] }
  showUnwrapped?: boolean
  border?: string
  tvl: CurrencyAmount | undefined
}

export default function PoolCard({ pairData, pairInfo, border, tvl }: PoolCardProps) {
  const history = useHistory()

  const currency0 = unwrappedToken(pairInfo.tokens[0])
  const currency1 = unwrappedToken(pairInfo.tokens[1])

  const [, pair] = usePair(currency0, currency1)

  const backgroundColor = useColor(pair?.token0)

  return (
    <StyledPositionCard border={border} bgColor={backgroundColor}>
      <AutoRow
        onClick={() => {
          history.push(`/swap/liquidity/pool-detail/${pairInfo.liquidityToken.address}`)
        }}
      >
        <ContentRow weight={1.5}>
          <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={24} />
          <TYPE.white ml={10}>
            {currency0 && currency1 ? <TYPE.white>{`${currency0.symbol} / ${currency1.symbol}`}</TYPE.white> : '-/-'}
          </TYPE.white>
          {pairData.feeRate && <SmallCard ml={10}>{pairData?.feeRate * 100} %</SmallCard>}
        </ContentRow>
        <ContentRow>
          <TYPE.white>{tvl ? `≈$${numFormat(tvl?.toFixed(2, { groupSeparator: ',' }), 2, true)}` : '--'}</TYPE.white>
        </ContentRow>
        <ContentRow>
          <TYPE.white>
            {pairData?.dayVolume ? `≈$${numFormat(amountFormat(pairData.dayVolume, 2), 2, true)}` : '--'}
          </TYPE.white>
        </ContentRow>
        <ContentRow>
          <TYPE.white>{pairData?.feeApr ? `${rate(pairData?.feeApr, 2)}` : '--'}</TYPE.white>
        </ContentRow>
        <ContentRow gap={'10px'} weight={1.5}>
          <TYPE.white>{pairData?.ltApr ? `${rate(pairData?.ltApr, 2)}` : ''}</TYPE.white>
          {pairData.ltApr && <ArrowUpRight color={'#0ECB81'} size={14} style={{ margin: '0 4px' }} />}
          <TYPE.green>{pairData.ltApr ? `${rate((pairData?.ltApr || 0) * 2.5, 2)}` : ''}</TYPE.green>
        </ContentRow>
        <ContentRow>
          <TYPE.white>{pairData?.ltAmountPerDay ? `${amountFormat(pairData?.ltAmountPerDay, 2)} LT` : ''}</TYPE.white>
        </ContentRow>
        <ContentRow weight={0.1}>
          <i className="iconfont font-16 hope-icon-common p-3 m-l-5 cursor-select">&#xe62a;</i>
        </ContentRow>
      </AutoRow>
    </StyledPositionCard>
  )
}
