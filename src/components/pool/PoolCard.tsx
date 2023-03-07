import React from 'react'
import styled from 'styled-components'
import { useActiveWeb3React } from '../../hooks'
import { unwrappedToken } from '../../utils/wrappedCurrency'
import { usePair } from '../../data/Reserves'
import { CurrencyAmount, Token } from '@uniswap/sdk'
import { useColor } from '../../hooks/useColor'
import { AutoRow, RowFixed } from '../Row'
import DoubleCurrencyLogo from '../DoubleLogo'
import { ExternalLink, TYPE } from '../../theme'
import { LightCard } from '../Card'
import { getEtherscanLink } from '../../utils'
import { ArrowUpRight, ChevronRight } from 'react-feather'
import { useHistory } from 'react-router-dom'
import { BasePair } from '../../graph/fetch'
import { amountFormat } from '../../utils/format'

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

const ActionIcon = styled(ChevronRight)`
  width: 24px;
  height: 24px;
  padding: 2px;
  cursor: pointer;
  &:hover {
    background-color: ${({ theme }) => theme.bg3};
  }
`

const SmallCard = styled(TYPE.white)`
  background-color: ${({ theme }) => theme.bg3};
  border-radius: 2px;
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
  const { chainId } = useActiveWeb3React()
  const history = useHistory()

  const currency0 = unwrappedToken(pairInfo.tokens[0])
  const currency1 = unwrappedToken(pairInfo.tokens[1])

  const [, pair] = usePair(currency0, currency1)

  const backgroundColor = useColor(pair?.token0)

  return (
    <StyledPositionCard
      onClick={() => {
        history.push(`/swap/liquidity/pool-detail/${pairInfo.liquidityToken.address}`)
      }}
      border={border}
      bgColor={backgroundColor}
    >
      <AutoRow>
        <ContentRow weight={1.5}>
          <DoubleCurrencyLogo margin currency0={currency0} currency1={currency1} size={24} />
          <TYPE.link
            as={ExternalLink}
            href={getEtherscanLink(chainId ?? 1, pairInfo.liquidityToken.address, 'address')}
            ml={10}
            fontWeight={500}
            fontSize={20}
          >
            {currency0 && currency1 ? <TYPE.white>{`${currency0.symbol} / ${currency1.symbol}`}</TYPE.white> : '-/-'}
          </TYPE.link>
          {pairData.feeRate && <SmallCard ml={10}>{pairData?.feeRate * 100} %</SmallCard>}
        </ContentRow>
        <ContentRow>
          <TYPE.white>{tvl ? `$${tvl?.toFixed(2)}` : '--'}</TYPE.white>
        </ContentRow>
        <ContentRow>
          <TYPE.white>{pairData?.dayVolume ? `$${amountFormat(pairData.dayVolume)}` : '--'}</TYPE.white>
        </ContentRow>
        <ContentRow>
          <TYPE.white>{pairData?.baseApr ? `${Number(pairData?.baseApr).toFixed(2)}%` : '--'}</TYPE.white>
        </ContentRow>
        <ContentRow gap={'10px'}>
          <TYPE.white>{pairData?.ltApr ? `${Number(pairData?.ltApr).toFixed(2)}%` : ''}</TYPE.white>
          {pairData.maxApr && <ArrowUpRight color={'#0ECB81'} size={14} style={{ margin: '0 4px' }} />}
          <TYPE.white>{pairData.maxApr ? `${Number(pairData.maxApr).toFixed(2)}%` : ''}</TYPE.white>
        </ContentRow>
        <ContentRow>
          <TYPE.white>
            {pairData?.ltAmountPerDay ? `${Number(pairData?.ltAmountPerDay).toFixed(2)} LT/day` : ''}
          </TYPE.white>
        </ContentRow>
        <ContentRow weight={0.5}>
          <ActionIcon size={8} />
        </ContentRow>
      </AutoRow>
    </StyledPositionCard>
  )
}
