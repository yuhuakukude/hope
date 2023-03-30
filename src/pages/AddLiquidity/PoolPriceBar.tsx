import React from 'react'
import { Currency, Percent, Price, TokenAmount } from '@uniswap/sdk'
import { AutoColumn } from '../../components/Column'
import { RowBetween } from '../../components/Row'
import { Field } from '../../state/mint/actions'
import { TYPE } from '../../theme'
import { ONE_BIPS } from '../../constants'

export function PoolPriceBar({
  currencies,
  noLiquidity,
  poolTokenPercentage,
  price,
  liquidityMinted
}: {
  currencies: { [field in Field]?: Currency }
  noLiquidity?: boolean
  poolTokenPercentage?: Percent
  price?: Price
  liquidityMinted: TokenAmount | undefined
}) {
  return (
    <AutoColumn gap="md">
      <RowBetween justify="center">
        <TYPE.main fontWeight={500} pt={1}>
          {'Rates'}
        </TYPE.main>
        <TYPE.white>{`1 ${currencies[Field.CURRENCY_A]?.symbol} ≈ ${price?.toSignificant(6, { groupSeparator: ',' }) ??
          '-'} ${currencies[Field.CURRENCY_B]?.symbol}`}</TYPE.white>
      </RowBetween>
      <RowBetween justify="center">
        <TYPE.main fontWeight={500} pt={1}>
          {}
        </TYPE.main>
        <TYPE.white>{`1 ${currencies[Field.CURRENCY_B]?.symbol} ≈ ${price
          ?.invert()
          ?.toSignificant(6, { groupSeparator: ',' }) ?? '-'} ${currencies[Field.CURRENCY_A]?.symbol}`}</TYPE.white>
      </RowBetween>
      <RowBetween justify="center">
        <TYPE.main>Share of Pool</TYPE.main>
        <TYPE.white fontWeight={500} pt={1}>
          {noLiquidity && price
            ? '100'
            : (poolTokenPercentage?.lessThan(ONE_BIPS) ? '<0.01' : poolTokenPercentage?.toFixed(2)) ?? '0'}
          %
        </TYPE.white>
      </RowBetween>
      {liquidityMinted && (
        <RowBetween justify="center">
          <TYPE.main>Min. Received LP Token</TYPE.main>
          <TYPE.white fontWeight={500} pt={1}>
            {liquidityMinted ? liquidityMinted.toSignificant(6, { groupSeparator: ',' }) : '--'}
          </TYPE.white>
        </RowBetween>
      )}
    </AutoColumn>
  )
}
