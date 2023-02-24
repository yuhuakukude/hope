import React, { useMemo } from 'react'
import styled from 'styled-components'
import { PoolInfo } from '../../state/stake/hooks'
import { TYPE } from '../../theme'
import { AutoColumn } from '../Column'
import { AutoRow, RowBetween, RowFixed } from '../Row'
import CurrencyLogo from '../CurrencyLogo'
import { usePosition, useStakePosition } from '../../hooks/usePosition'
import { Percent } from '@uniswap/sdk'
import { useTokenPrice } from '../../hooks/liquidity/useBasePairs'

export const CardHeader = styled(AutoColumn)`
  padding: 30px 30px 30px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.bg3};
`

export default function BasePoolInfoCard({ pool }: { pool?: PoolInfo }) {
  const { token1Deposited, token0Deposited, balance } = usePosition(pool?.pair)
  const { token0Staked, token1Staked, stakedLpAmount } = useStakePosition(pool)
  const tokenAddresses = useMemo(() => {
    return [pool?.tokens[0].address ?? '', pool?.tokens[1].address ?? '']
  }, [pool])
  const tokensPrice = useTokenPrice(tokenAddresses)
  const [token0Price, token1Price] = useMemo(() => {
    return [
      pool && tokensPrice.result
        ? tokensPrice.result.find(token => {
            return token.address.toLowerCase() === pool.tokens[0].address.toLowerCase()
          })?.price
        : undefined,
      pool && tokensPrice.result
        ? tokensPrice.result.find(token => {
            return token.address.toLowerCase() === pool.tokens[1].address.toLowerCase()
          })?.price
        : undefined
    ]
  }, [pool, tokensPrice])

  return (
    <AutoColumn gap={'30px'} style={{ padding: '30px  20px' }}>
      <RowBetween>
        <TYPE.white fontWeight={700} fontSize={18}>
          Unstaked Position
        </TYPE.white>
        <TYPE.white fontWeight={700} fontSize={18}>
          {balance && pool?.totalSupply
            ? `${new Percent(balance.raw, pool.totalSupply.raw).toFixed(2, { groupSeparator: ',' })}%`
            : '--'}
        </TYPE.white>
      </RowBetween>
      <RowBetween>
        <AutoRow gap={'10px'}>
          <RowFixed>
            <CurrencyLogo size={'30px'} currency={pool?.tokens[0]} />
            <CurrencyLogo style={{ marginLeft: -15 }} size={'30px'} currency={pool?.tokens[1]} />
          </RowFixed>
          <TYPE.white fontSize={18}>{`${pool?.tokens[0].symbol ?? ''}-${pool?.tokens[1].symbol ??
            '-'} Pool Token`}</TYPE.white>
        </AutoRow>
        <TYPE.white fontSize={18}>{balance ? balance.toFixed(2, { groupSeparator: ',' }) : '--'}</TYPE.white>
      </RowBetween>
      <RowBetween>
        <AutoRow gap={'5px'}>
          <RowFixed>
            <CurrencyLogo size={'20px'} currency={pool?.tokens[0]} />
          </RowFixed>
          <RowFixed>
            <TYPE.white>{token0Deposited ? token0Deposited.toFixed(2) : '--'}</TYPE.white>
            <TYPE.white>&ensp;{pool?.tokens[0].symbol}</TYPE.white>
          </RowFixed>
        </AutoRow>
        <TYPE.main>
          {token0Deposited && token0Price ? (Number(token0Deposited.toExact()) * Number(token0Price)).toFixed(2) : '--'}
        </TYPE.main>
      </RowBetween>
      <RowBetween>
        <AutoRow gap={'5px'}>
          <RowFixed>
            <CurrencyLogo size={'20px'} currency={pool?.tokens[1]} />
          </RowFixed>
          <RowFixed>
            <TYPE.white>{token1Deposited ? token1Deposited.toFixed(2) : '--'}</TYPE.white>
            <TYPE.white>&ensp;{pool?.tokens[1].symbol}</TYPE.white>
          </RowFixed>
        </AutoRow>
        <TYPE.main>
          {token1Deposited && token1Price ? (Number(token1Deposited.toExact()) * Number(token1Price)).toFixed(2) : '--'}
        </TYPE.main>
      </RowBetween>
      <RowBetween>
        <TYPE.white fontWeight={700} fontSize={18}>
          Staked Position
        </TYPE.white>
        <TYPE.white fontWeight={700} fontSize={18}>
          {stakedLpAmount && pool?.totalSupply
            ? `${new Percent(stakedLpAmount.raw, pool.totalSupply.raw).toFixed(2, { groupSeparator: ',' })}%`
            : '--'}
        </TYPE.white>
      </RowBetween>
      <RowBetween>
        <AutoRow gap={'10px'}>
          <RowFixed>
            <CurrencyLogo size={'30px'} currency={pool?.tokens[0]} />
            <CurrencyLogo style={{ marginLeft: -15 }} size={'30px'} currency={pool?.tokens[1]} />
          </RowFixed>
          <TYPE.white fontSize={18}>{`${pool?.tokens[0].symbol}-${pool?.tokens[1].symbol} Pool Token`}</TYPE.white>
        </AutoRow>
        <TYPE.white>{stakedLpAmount ? stakedLpAmount.toFixed(2, { groupSeparator: ',' }) : '--'}</TYPE.white>
      </RowBetween>
      <RowBetween>
        <AutoRow gap={'10px'}>
          <RowFixed>
            <CurrencyLogo size={'20px'} currency={pool?.tokens[0]} />
          </RowFixed>
          <RowFixed>
            <TYPE.white>{token0Staked ? token0Staked.toFixed(2) : '--'}</TYPE.white>
            <TYPE.white>&ensp;{pool?.tokens[0].symbol}</TYPE.white>
          </RowFixed>
        </AutoRow>
        <TYPE.main>
          {token0Staked && token0Price ? (Number(token0Staked.toExact()) * Number(token0Price)).toFixed(2) : '--'}
        </TYPE.main>
      </RowBetween>
      <RowBetween>
        <AutoRow gap={'10px'}>
          <RowFixed>
            <CurrencyLogo size={'20px'} currency={pool?.tokens[1]} />
          </RowFixed>
          <RowFixed>
            <TYPE.white>{token1Staked ? token1Staked.toFixed(2) : '--'}</TYPE.white>
            <TYPE.white>&ensp;{pool?.tokens[1].symbol}</TYPE.white>
          </RowFixed>
        </AutoRow>
        <TYPE.main>
          {token1Staked && token1Staked ? (Number(token1Staked.toExact()) * Number(token1Price)).toFixed(2) : '--'}
        </TYPE.main>
      </RowBetween>
    </AutoColumn>
  )
}
