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
  console.log('tag', [pool?.tokens[0].address ?? '', pool?.tokens[1].address ?? ''])
  const tokenAddresses = useMemo(() => {
    return [pool?.tokens[0].address ?? '', pool?.tokens[1].address ?? '']
  }, [pool])
  const tokensPrice = useTokenPrice(tokenAddresses)
  console.log('tokensPrice', tokensPrice)
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
          <TYPE.white fontSize={18}>{`${pool?.tokens[0].symbol}-${pool?.tokens[1].symbol} Pool Token`}</TYPE.white>
        </AutoRow>
        <TYPE.white fontSize={18}>{balance ? balance.toFixed(2, { groupSeparator: ',' }) : '--'}</TYPE.white>
      </RowBetween>
      <RowBetween>
        <AutoRow gap={'10px'}>
          <RowFixed>
            <CurrencyLogo size={'20px'} currency={pool?.tokens[0]} />
          </RowFixed>
          <TYPE.white fontSize={18}>{pool?.tokens[0].symbol}</TYPE.white>
        </AutoRow>
        <TYPE.white fontSize={18}>
          {token0Deposited ? token0Deposited.toFixed(2, { groupSeparator: ',' }) : '--'}
        </TYPE.white>
      </RowBetween>
      <RowBetween>
        <AutoRow gap={'10px'}>
          <RowFixed>
            <CurrencyLogo size={'20px'} currency={pool?.tokens[1]} />
          </RowFixed>
          <TYPE.white fontSize={18}>{pool?.tokens[1].symbol}</TYPE.white>
        </AutoRow>
        <TYPE.white fontSize={18}>
          {token1Deposited ? token1Deposited.toFixed(2, { groupSeparator: ',' }) : '--'}
        </TYPE.white>
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
        <TYPE.white fontSize={18}>
          {stakedLpAmount ? stakedLpAmount.toFixed(2, { groupSeparator: ',' }) : '--'}
        </TYPE.white>
      </RowBetween>
      <RowBetween>
        <AutoRow gap={'10px'}>
          <RowFixed>
            <CurrencyLogo size={'20px'} currency={pool?.tokens[0]} />
          </RowFixed>
          <TYPE.white fontSize={18}>{pool?.tokens[0].symbol}</TYPE.white>
        </AutoRow>
        <TYPE.white fontSize={18}>{token0Staked ? token0Staked.toFixed(2, { groupSeparator: ',' }) : '--'}</TYPE.white>
      </RowBetween>
      <RowBetween>
        <AutoRow gap={'10px'}>
          <RowFixed>
            <CurrencyLogo size={'20px'} currency={pool?.tokens[1]} />
          </RowFixed>
          <TYPE.white fontSize={18}>{pool?.tokens[1].symbol}</TYPE.white>
        </AutoRow>
        <TYPE.white fontSize={18}>{token1Staked ? token1Staked.toFixed(2, { groupSeparator: ',' }) : '--'}</TYPE.white>
      </RowBetween>
    </AutoColumn>
  )
}
