import { JSBI, Pair, Percent, Token, TokenAmount } from '@uniswap/sdk'
import { darken } from 'polished'
import React, { useState } from 'react'
import { Text } from 'rebass'
import styled from 'styled-components'
import { useTotalSupply } from '../../data/TotalSupply'

import { useActiveWeb3React } from '../../hooks'
import { useTokenBalance } from '../../state/wallet/hooks'
import { TYPE } from '../../theme'
import { unwrappedToken } from '../../utils/wrappedCurrency'

import { useColor } from '../../hooks/useColor'

import Card, { LightCard } from '../Card'
import { AutoColumn } from '../Column'
import DoubleCurrencyLogo from '../DoubleLogo'
import { RowBetween, RowFixed, AutoRow } from '../Row'
import { usePair } from '../../data/Reserves'
import CurrencyLogo from '../CurrencyLogo'
import TitleTips, { TitleTipsProps } from '../../pages/Portfolio/component/SelectTips'
import { useHistory } from 'react-router-dom'
import ClaimRewardModal from '../earn/ClaimRewardModal'
import { amountFormat, rate } from '../../utils/format'
import { ArrowUpRight } from 'react-feather'

export const FixedHeightRow = styled(RowBetween)`
  height: 24px;
`

export const HoverCard = styled(Card)`
  border: 1px solid transparent;
  :hover {
    border: 1px solid ${({ theme }) => darken(0.06, theme.bg2)};
  }
`
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

const SmallCard = styled(TYPE.white)`
  background-color: ${({ theme }) => theme.bg3};
  border-radius: 6px;
  font-size: 12px;
  padding: 4px;
`

const ContentRow = styled(RowFixed)<{ weight?: number }>`
  flex: ${({ weight }) => (weight ? weight : 1)};
`

const DataRow = styled(AutoRow)`
  flex-wrap: nowrap;
  width: fit-content;
`

interface PositionCardProps {
  pair: Pair
  showUnwrapped?: boolean
  border?: string
  stakedBalance?: TokenAmount // optional balance to indicate that liquidity is deposited in mining pool
}

export function MinimalPositionCard({ pair, showUnwrapped = false, border }: PositionCardProps) {
  const { account } = useActiveWeb3React()

  const currency0 = showUnwrapped ? pair.token0 : unwrappedToken(pair.token0)
  const currency1 = showUnwrapped ? pair.token1 : unwrappedToken(pair.token1)

  const [showMore, setShowMore] = useState(false)

  const userPoolBalance = useTokenBalance(account ?? undefined, pair.liquidityToken)
  const totalPoolTokens = useTotalSupply(pair.liquidityToken)

  const poolTokenPercentage =
    !!userPoolBalance && !!totalPoolTokens && JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
      : undefined

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw) &&
    totalPoolTokens.greaterThan(JSBI.BigInt(0))
      ? [
          pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
          pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false)
        ]
      : [undefined, undefined]

  return (
    <>
      {userPoolBalance ? (
        <AutoColumn gap="12px">
          <FixedHeightRow>
            <RowFixed>
              <Text fontWeight={700} fontSize={16}>
                My Position
              </Text>
            </RowFixed>
          </FixedHeightRow>
          <FixedHeightRow onClick={() => setShowMore(!showMore)}>
            <RowFixed>
              <DoubleCurrencyLogo currency0={currency0} currency1={currency1} margin={true} size={20} />
              <Text fontWeight={700}>
                {currency0.symbol}/{currency1.symbol}
              </Text>
            </RowFixed>
            <RowFixed>
              <Text fontWeight={700}>
                {userPoolBalance ? userPoolBalance.toSignificant(4, { groupSeparator: ',' }) : '-'}
              </Text>
            </RowFixed>
          </FixedHeightRow>
          <AutoColumn gap="4px">
            <FixedHeightRow>
              <TYPE.main fontWeight={500}>Share of Pool</TYPE.main>
              <Text fontWeight={500}>
                {poolTokenPercentage ? poolTokenPercentage.toSignificant(2, { groupSeparator: ',' }) + '%' : '-'}
              </Text>
            </FixedHeightRow>
            <FixedHeightRow>
              <TYPE.main fontWeight={500}>{currency0.symbol}</TYPE.main>
              {token0Deposited ? (
                <RowFixed>
                  <Text fontWeight={500} marginLeft={'6px'}>
                    {token0Deposited?.toSignificant(6, { groupSeparator: ',' })}
                  </Text>
                </RowFixed>
              ) : (
                '-'
              )}
            </FixedHeightRow>
            <FixedHeightRow>
              <TYPE.main fontWeight={500}>{currency1.symbol}</TYPE.main>
              {token1Deposited ? (
                <RowFixed>
                  <Text fontWeight={500} marginLeft={'6px'}>
                    {token1Deposited?.toSignificant(6)}
                  </Text>
                </RowFixed>
              ) : (
                '-'
              )}
            </FixedHeightRow>
          </AutoColumn>
        </AutoColumn>
      ) : (
        <></>
      )}
    </>
  )
}

interface FullCardProps {
  pairInfo: { liquidityToken: Token; tokens: [Token, Token] }
  showUnwrapped?: boolean
  border?: string
  stakedBalance?: TokenAmount // optional balance to indicate that liquidity is deposited in mining pool
  feeRate?: number
  futureBoots?: Percent
  currentBoots?: Percent
  reward?: TokenAmount | undefined
  stakingAddress?: string
  ltPrice?: number
  feeApr?: number | string
  RewardsApr?: number | string
  maxBoost?: number | string
}

export default function FullPositionCard({
  pairInfo,
  border,
  stakedBalance,
  feeRate,
  futureBoots,
  currentBoots,
  reward,
  stakingAddress,
  ltPrice,
  feeApr,
  RewardsApr,
  maxBoost
}: FullCardProps) {
  const { account } = useActiveWeb3React()
  const history = useHistory()
  const currency0 = unwrappedToken(pairInfo.tokens[0])
  const currency1 = unwrappedToken(pairInfo.tokens[1])

  const [showClaimModal, setShowClaimModal] = useState(false)

  const [, pair] = usePair(currency0, currency1)

  const userDefaultPoolBalance = useTokenBalance(account ?? undefined, pairInfo.liquidityToken)
  const totalPoolTokens = useTotalSupply(pairInfo.liquidityToken)
  // if staked balance balance provided, add to standard liquidity amount
  const userPoolBalance = stakedBalance ? userDefaultPoolBalance?.add(stakedBalance) : userDefaultPoolBalance
  const stakePercent =
    stakedBalance && userPoolBalance && userPoolBalance.greaterThan(JSBI.BigInt(0))
      ? new Percent(stakedBalance?.raw, userPoolBalance?.raw)
      : undefined
  const [token0Amount, token1Amount] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw) &&
    totalPoolTokens.greaterThan(JSBI.BigInt(0))
      ? [
          pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
          pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false)
        ]
      : [undefined, undefined]

  const backgroundColor = useColor(pair?.token0)

  const actions: TitleTipsProps[] = [
    {
      label: 'Liquidity Management',
      value: 'Manage Positions',
      onClick: data => {
        history.push(`/swap/liquidity/manager/deposit/${pairInfo.tokens[0].address}/${pairInfo.tokens[1].address}`)
      }
    },
    {
      label: 'Liquidity Farming',
      value: 'Liquidity Farming',
      isHide: !stakingAddress,
      onClick: data => {
        history.push(`/swap/liquidity/mining/${stakingAddress}`)
      }
    },
    {
      label: 'Yield Boost',
      value: 'Yield Boost',
      isHide: !stakingAddress,
      onClick: data => {
        history.push(`/dao/locker`)
      }
    },
    {
      label: 'Claim Rewards',
      value: 'Claim Rewards',
      isHide: !reward || !reward.greaterThan('0'),
      onClick: data => {
        setShowClaimModal(true)
      }
    },
    {
      label: 'Pool Details',
      value: 'Pool Details',
      onClick: data => {
        history.push(`/swap/liquidity/pool-detail/${pairInfo.liquidityToken.address}`)
      }
    }
  ]

  return (
    <StyledPositionCard border={border} bgColor={backgroundColor}>
      {stakingAddress && (
        <ClaimRewardModal
          isOpen={showClaimModal}
          onDismiss={() => setShowClaimModal(false)}
          stakingAddress={stakingAddress}
        />
      )}
      <AutoRow>
        <ContentRow>
          <AutoColumn gap={'12px'}>
            <AutoRow>
              <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={24} />
              <TYPE.white style={{ marginLeft: '8px' }}>
                {currency0 && currency1 ? (
                  <TYPE.white>{`${currency0.symbol} / ${currency1.symbol}`}</TYPE.white>
                ) : (
                  '-/-'
                )}
              </TYPE.white>
            </AutoRow>
            <AutoRow>
              <TYPE.main>Fee Rate: </TYPE.main>
              {feeRate ? <SmallCard ml={10}>{`${feeRate * 100}%`}</SmallCard> : '--'}
            </AutoRow>
          </AutoColumn>
        </ContentRow>
        <ContentRow>
          <AutoColumn gap={'12px'}>
            <DataRow>
              <CurrencyLogo style={{ margin: '0px 8px' }} size={'16px'} currency={currency0} />
              <TYPE.white style={{ margin: '0px 8px 0px 0' }}>{`${
                token0Amount ? token0Amount?.toFixed(4, { groupSeparator: ',' }) : '--'
              }`}</TYPE.white>
            </DataRow>
            <DataRow>
              <CurrencyLogo style={{ margin: '0px 8px' }} size={'16px'} currency={currency1} />
              <TYPE.white style={{ margin: '0px 8px 0px 0' }}>{`${
                token1Amount ? token1Amount?.toFixed(4, { groupSeparator: ',' }) : '--'
              }`}</TYPE.white>
            </DataRow>
          </AutoColumn>
        </ContentRow>
        <ContentRow>
          <AutoColumn gap={'12px'}>
            <DataRow gap={'8px'}>
              <TYPE.white>{userPoolBalance ? userPoolBalance.toFixed(4, { groupSeparator: ',' }) : '--'} </TYPE.white>
            </DataRow>
            <DataRow gap={'8px'}>
              <TYPE.main>{stakePercent ? `${stakePercent.toFixed(2)}% Staked` : '--'}</TYPE.main>
            </DataRow>
          </AutoColumn>
        </ContentRow>
        <ContentRow>
          <AutoColumn gap={'10px'}>
            <AutoRow>
              <TYPE.main>Current Boost:&nbsp;</TYPE.main>
              <TYPE.white>{currentBoots ? `${currentBoots.toFixed(2)}x` : '--'}</TYPE.white>
            </AutoRow>
            <AutoRow>
              <TYPE.main>Next Boost:&nbsp;&nbsp;</TYPE.main>
              <TYPE.white>{futureBoots ? `${futureBoots.toFixed(2)}x` : '--'}</TYPE.white>
            </AutoRow>
          </AutoColumn>
        </ContentRow>
        <ContentRow weight={1.5}>
          <AutoColumn gap={'10px'}>
            <AutoRow>
              <TYPE.main>Fees:&nbsp;</TYPE.main>
              <TYPE.white>{rate(feeApr)}</TYPE.white>
            </AutoRow>
            <AutoRow>
              <TYPE.main>Farming:&nbsp;</TYPE.main>
              <TYPE.white>{rate(RewardsApr)}</TYPE.white>
              {RewardsApr && <ArrowUpRight color={'#0ECB81'} size={14} style={{ margin: '0 4px' }} />}
              <TYPE.green>{RewardsApr ? `${rate(Number(RewardsApr) * Number(maxBoost))}` : ''}</TYPE.green>
            </AutoRow>
          </AutoColumn>
        </ContentRow>
        <ContentRow>
          <AutoColumn gap={'10px'}>
            <TYPE.white>{reward ? `${reward.toFixed(4, { groupSeparator: ',' })} LT` : '--'}</TYPE.white>
            <TYPE.main>
              ≈ ${reward && ltPrice ? amountFormat(Number(reward?.toExact().toString()) * Number(ltPrice), 2) : '0'}
            </TYPE.main>
          </AutoColumn>
        </ContentRow>

        <ContentRow weight={0.6} style={{ minWidth: '86px', justifyContent: 'center' }}>
          <TitleTips options={actions} label={'More'} />
        </ContentRow>
      </AutoRow>
    </StyledPositionCard>
  )
}
