import React from 'react'
import styled from 'styled-components'
import { AdvancedSwapDetails, AdvancedSwapDetailsProps } from './AdvancedSwapDetails'

const AdvancedDetailsFooter = styled.div<{ show: boolean }>`
  width: 100%;
  margin: 30px 0 22px 0;
  color: ${({ theme }) => theme.text2};
`

export default function AdvancedSwapDetailsDropdown({ trade, feeRate, ...rest }: AdvancedSwapDetailsProps) {
  return (
    <AdvancedDetailsFooter show={Boolean(trade)}>
      <AdvancedSwapDetails {...rest} feeRate={feeRate} trade={trade ?? undefined} />
    </AdvancedDetailsFooter>
  )
}
