import { Pair } from '@uniswap/sdk'
import { usePosition } from '../../hooks/usePosition'
import { Text } from 'rebass'
import React, { useContext } from 'react'
import { ThemeContext } from 'styled-components'

export default function UserLiquidityCard({ pair }: { pair?: Pair }) {
  const theme = useContext(ThemeContext)
  const { currency0, currency1, token0Deposited, token1Deposited } = usePosition(pair)
  return (
    <Text fontWeight={500} fontSize={14} color={theme.text2} pt={1}>
      {`${currency0?.symbol} ${token0Deposited?.toFixed(2)} / ${currency1?.symbol} ${token1Deposited?.toFixed(2)}`}
    </Text>
  )
}
