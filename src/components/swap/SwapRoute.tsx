import { Trade } from '@uniswap/sdk'
import React, { Fragment, memo } from 'react'
import { Flex } from 'rebass'
import styled from 'styled-components'
import { TYPE } from '../../theme'
import { unwrappedToken } from 'utils/wrappedCurrency'
import CurrencyLogo from '../CurrencyLogo'
import { AutoColumn } from '../Column'
import { AutoRow } from '../Row'
import { useFeeRates } from '../../hooks/Trades'

const Dashed = styled.div`
  flex: 1;
  border-top: 1px dashed ${({ theme }) => theme.bg3};
`

const PercentView = styled(TYPE.gray)`
  font-size: 12px;
  padding: 7px 12px;
  border-radius: 20px;
  color: white;
  background-color: ${({ theme }) => theme.bg3};
`

export default memo(function SwapRoute({ trade }: { trade: Trade }) {
  const feeRates = useFeeRates(trade)
  return (
    <Flex flexWrap="wrap" width="100%" justifyContent="space-between" alignItems="center">
      {trade.route.path.map((token, i, path) => {
        const isLastItem: boolean = i === path.length - 1
        const currency = unwrappedToken(token)
        const feeRate = feeRates[i]
        return (
          <Fragment key={i}>
            <Flex alignItems="center">
              <AutoColumn gap={'8px'} justify={'center'}>
                <CurrencyLogo currency={currency} />
                <TYPE.main fontSize={12} style={{ transform: 'scale(0.875)' }}>
                  {currency.symbol}
                </TYPE.main>
              </AutoColumn>
            </Flex>
            {isLastItem ? null : (
              <AutoColumn gap={'6px'} justify={'center'} style={{ flex: 1 }}>
                <AutoRow alignSelf={'self-start'}>
                  <Dashed />
                  <PercentView>{feeRate ? `${feeRate.toFixed(2)}%` : '--'}</PercentView>
                  <Dashed />
                </AutoRow>
                <i className="iconfont">&#xe619;</i>
              </AutoColumn>
            )}
          </Fragment>
        )
      })}
    </Flex>
  )
})
