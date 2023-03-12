import { JSBI, Percent, Trade, TradeType } from '@uniswap/sdk'
import React, { useContext } from 'react'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { Field } from '../../state/swap/actions'
import { useUserSlippageTolerance } from '../../state/user/hooks'
import { TYPE } from '../../theme'
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown } from '../../utils/prices'
import { AutoColumn } from '../Column'
import { Tooltip } from 'antd'
import { RowBetween, RowFixed } from '../Row'
import FormattedPriceImpact from './FormattedPriceImpact'
import SwapRoute from './SwapRoute'

// const InfoLink = styled(ExternalLink)`
//   width: 100%;
//   border: 1px solid ${({ theme }) => theme.bg3};
//   padding: 6px 6px;
//   border-radius: 8px;
//   text-align: center;
//   font-size: 14px;
//   color: ${({ theme }) => theme.text1};
// `

function TradeSummary({ trade, allowedSlippage }: { trade: Trade; allowedSlippage: number }) {
  const theme = useContext(ThemeContext)
  const { priceImpactWithoutFee, realizedLPFee } = computeTradePriceBreakdown(trade)
  const isExactIn = trade.tradeType === TradeType.EXACT_INPUT
  const slippageAdjustedAmounts = computeSlippageAdjustedAmounts(trade, allowedSlippage)

  return (
    <>
      <AutoColumn gap={'20px'}>
        <RowBetween>
          <AutoColumn gap={'4px'}>
            <RowFixed>
              <TYPE.black fontSize={16} fontWeight={400} color={theme.text2}>
                {isExactIn ? 'Minimum received' : 'Maximum sold'}
              </TYPE.black>
              <Tooltip
                className="m-l-5"
                overlayClassName="tips-question"
                title="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed."
              >
                <i className="iconfont font-14 cursor-select tips-circle">&#xe620;</i>
              </Tooltip>
            </RowFixed>
            <TYPE.gray fontSize={14}>
              After slippage ({new Percent(JSBI.BigInt(allowedSlippage), JSBI.BigInt(10000)).toFixed(2)}%)
            </TYPE.gray>
          </AutoColumn>
          <RowFixed>
            <TYPE.black color={theme.text1} fontSize={16}>
              {isExactIn
                ? `${slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4)} ${trade.outputAmount.currency.symbol}` ??
                  '-'
                : `${slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4)} ${trade.inputAmount.currency.symbol}` ??
                  '-'}
            </TYPE.black>
          </RowFixed>
        </RowBetween>
        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={16} fontWeight={400} color={theme.text2}>
              Price Impact
            </TYPE.black>
            <Tooltip
              className="m-l-5"
              overlayClassName="tips-question"
              title="The difference between the market price and estimated price due to trade size."
            >
              <i className="iconfont font-14 cursor-select tips-circle">&#xe620;</i>
            </Tooltip>
          </RowFixed>
          <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
        </RowBetween>

        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={16} fontWeight={400} color={theme.text2}>
              Liquidity Provider Fee
            </TYPE.black>
            <Tooltip
              className="m-l-5"
              overlayClassName="tips-question"
              title="A portion of each trade (0.30%) goes to liquidity providers as a protocol incentive."
            >
              <i className="iconfont font-14 cursor-select tips-circle">&#xe620;</i>
            </Tooltip>
          </RowFixed>
          <TYPE.black fontSize={16} color={theme.text1}>
            {realizedLPFee ? `${realizedLPFee.toSignificant(4)} ${trade.inputAmount.currency.symbol}` : '-'}
          </TYPE.black>
        </RowBetween>
      </AutoColumn>
    </>
  )
}

export interface AdvancedSwapDetailsProps {
  error?: string
  trade?: Trade
}

export function AdvancedSwapDetails({ trade, error }: AdvancedSwapDetailsProps) {
  const theme = useContext(ThemeContext)
  const [allowedSlippage] = useUserSlippageTolerance()

  const showRoute = Boolean(trade && trade.route.path.length > 2)

  return (
    <AutoColumn gap="0px" style={{ paddingTop: 20, margin: '0 20px', borderTop: !error ? '1px solid #3D3E46' : '' }}>
      {trade ? (
        <>
          <TradeSummary trade={trade} allowedSlippage={allowedSlippage} />
          {showRoute && (
            <>
              <RowBetween mt={20}>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
                    Route
                  </TYPE.black>
                  <Tooltip
                    className="m-l-5"
                    overlayClassName="tips-question"
                    title="Routing through these tokens resulted in the best price for your trade."
                  >
                    <i className="iconfont font-14 cursor-select tips-circle">&#xe620;</i>
                  </Tooltip>
                </span>
                <SwapRoute trade={trade} />
              </RowBetween>
            </>
          )}
          {/*{!showRoute && (*/}
          {/*  <AutoColumn style={{ padding: '12px 16px 0 16px' }}>*/}
          {/*    <InfoLink*/}
          {/*      href={'https://info.uniswap.org/pair/' + trade.route.pairs[0].liquidityToken.address}*/}
          {/*      target="_blank"*/}
          {/*    >*/}
          {/*      View pair analytics ↗*/}
          {/*    </InfoLink>*/}
          {/*  </AutoColumn>*/}
          {/*)}*/}
        </>
      ) : (
        <Text textAlign={'center'}>{error ? error : ''}</Text>
      )}
    </AutoColumn>
  )
}
