import { Trade, TradeType } from '@uniswap/sdk'
import React, { useContext, useMemo } from 'react'
import { AlertTriangle } from 'react-feather'
import styled, { ThemeContext } from 'styled-components'
import { Field } from '../../state/swap/actions'
import { TYPE } from '../../theme'
import { ButtonPrimary } from '../Button'
import { isAddress, shortenAddress } from '../../utils'
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import { AutoColumn } from '../Column'
import CurrencyLogo from '../CurrencyLogo'
import { RowBetween, RowFixed } from '../Row'
import { TruncatedText, SwapShowAcceptChanges } from './styleds'
import { Tooltip } from 'antd'

const TradeWrapper = styled(AutoColumn)`
  background-color: #303037;
  padding: 20px;
  border-radius: 10px;
`

export default function SwapModalHeader({
  trade,
  allowedSlippage,
  recipient,
  showAcceptChanges,
  onAcceptChanges,
  token0USD,
  token1USD
}: {
  trade: Trade
  allowedSlippage: number
  recipient: string | null
  showAcceptChanges: boolean
  onAcceptChanges: () => void
  token0USD: string
  token1USD: string
}) {
  const slippageAdjustedAmounts = useMemo(() => computeSlippageAdjustedAmounts(trade, allowedSlippage), [
    trade,
    allowedSlippage
  ])
  const { priceImpactWithoutFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  const theme = useContext(ThemeContext)

  return (
    <AutoColumn gap={'md'} style={{ marginTop: '20px' }}>
      <TradeWrapper gap={'lg'}>
        <AutoColumn gap={'md'}>
          <RowFixed>
            <TYPE.main fontWeight={500} fontSize={14}>
              You will pay
            </TYPE.main>
          </RowFixed>
          <RowFixed>
            <CurrencyLogo currency={trade.inputAmount.currency} size={'24px'} style={{ marginRight: '12px' }} />
            <TruncatedText
              fontSize={20}
              fontWeight={700}
              color={showAcceptChanges && trade.tradeType === TradeType.EXACT_OUTPUT ? theme.text2 : ''}
            >
              {trade.inputAmount.toSignificant(6)}
            </TruncatedText>
            <RowFixed>
              <TYPE.main fontSize={20} fontWeight={700} style={{ marginLeft: '10px' }}>
                {trade.inputAmount.currency.symbol}
              </TYPE.main>
              <TYPE.main fontSize={16} style={{ marginLeft: '10px' }}>
                {token0USD}
              </TYPE.main>
            </RowFixed>
          </RowFixed>
        </AutoColumn>
        <AutoColumn gap={'md'}>
          <RowFixed>
            <TYPE.main fontWeight={500} fontSize={14}>
              You will receive
            </TYPE.main>
            <Tooltip
              className="m-l-5"
              overlayClassName="tips-question"
              title="The amount you expect to receive at the current market price.You may receive less or more if the market price changes while your transaction is pending."
            >
              <i className="iconfont font-14 cursor-select tips-circle">&#xe620;</i>
            </Tooltip>
          </RowFixed>
          <RowFixed>
            <CurrencyLogo currency={trade.outputAmount.currency} size={'24px'} style={{ marginRight: '12px' }} />
            <TruncatedText
              fontSize={20}
              fontWeight={700}
              color={
                priceImpactSeverity > 2
                  ? theme.red1
                  : showAcceptChanges && trade.tradeType === TradeType.EXACT_INPUT
                  ? theme.text2
                  : ''
              }
            >
              {trade.outputAmount.toSignificant(6)}
            </TruncatedText>
            <RowFixed>
              <TYPE.main fontSize={16} fontWeight={700} style={{ marginLeft: '10px' }}>
                {trade.outputAmount.currency.symbol}
              </TYPE.main>
              <TYPE.main fontSize={16} style={{ marginLeft: '10px' }}>
                {token1USD}
              </TYPE.main>
            </RowFixed>
          </RowFixed>
        </AutoColumn>
      </TradeWrapper>
      {showAcceptChanges ? (
        <SwapShowAcceptChanges justify="flex-start" gap={'0px'}>
          <RowBetween>
            <RowFixed>
              <AlertTriangle size={20} style={{ marginRight: '8px', minWidth: 24 }} />
              <TYPE.main color={theme.primary1}> Price Updated</TYPE.main>
            </RowFixed>
            <ButtonPrimary
              style={{ padding: '.5rem', width: 'fit-content', fontSize: '0.825rem', borderRadius: '12px' }}
              onClick={onAcceptChanges}
            >
              Accept
            </ButtonPrimary>
          </RowBetween>
        </SwapShowAcceptChanges>
      ) : null}
      <AutoColumn justify="flex-start" gap="sm" style={{ padding: '12px 0 0 0px' }}>
        {trade.tradeType === TradeType.EXACT_INPUT ? (
          <TYPE.main textAlign="left" style={{ width: '100%' }}>
            {`Output is estimated. You will receive at least `}
            <b>
              {slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(6)} {trade.outputAmount.currency.symbol}
            </b>
            {' or the transaction will revert.'}
          </TYPE.main>
        ) : (
          <TYPE.main textAlign="left" style={{ width: '100%' }}>
            {`Input is estimated. You will sell at most `}
            <b>
              {slippageAdjustedAmounts[Field.INPUT]?.toSignificant(6)} {trade.inputAmount.currency.symbol}
            </b>
            {' or the transaction will revert.'}
          </TYPE.main>
        )}
      </AutoColumn>
      {recipient !== null ? (
        <AutoColumn justify="flex-start" gap="sm" style={{ padding: '12px 0 0 0px' }}>
          <TYPE.main>
            Output will be sent to{' '}
            <b title={recipient}>{isAddress(recipient) ? shortenAddress(recipient) : recipient}</b>
          </TYPE.main>
        </AutoColumn>
      ) : null}
    </AutoColumn>
  )
}
