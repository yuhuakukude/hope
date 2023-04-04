import { CurrencyAmount, JSBI, Token, Trade, WETH } from '@uniswap/sdk'
import React, { useCallback, useContext, useMemo, useState } from 'react'
import { ArrowDownCircle } from 'react-feather'
import ReactGA from 'react-ga'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components'
import AddressInputPanel from '../../components/AddressInputPanel'
import { ButtonConfirmed, ButtonError, ButtonPrimary } from '../../components/Button'
import { GreyCard } from '../../components/Card'
import { AutoColumn } from '../../components/Column'
import ConfirmSwapModal from '../../components/swap/ConfirmSwapModal'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { SwapPoolTabs } from '../../components/NavigationTabs'
import { AutoRow, RowBetween } from '../../components/Row'
import AdvancedSwapDetailsDropdown from '../../components/swap/AdvancedSwapDetailsDropdown'
import BetterTradeLink, { DefaultVersionLink } from '../../components/swap/BetterTradeLink'
import confirmPriceImpactWithoutFee from '../../components/swap/confirmPriceImpactWithoutFee'
import { ArrowWrapper, BottomGrouping, Dots, SwapCallbackError, Wrapper } from '../../components/swap/styleds'
import TokenWarningModal from '../../components/TokenWarningModal'
import SwapHeader from '../../components/swap/SwapHeader'

//import { INITIAL_ALLOWED_SLIPPAGE } from '../../constants'
import { getTradeVersion } from '../../data/V1'
import { useActiveWeb3React } from '../../hooks'
import { useAllTokens, useCurrency } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import useENSAddress from '../../hooks/useENSAddress'
import { useSwapCallback } from '../../hooks/useSwapCallback'
import useToggledVersion, { DEFAULT_VERSION, Version } from '../../hooks/useToggledVersion'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import { useWalletModalToggle } from '../../state/application/hooks'
import { Field } from '../../state/swap/actions'
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState
} from '../../state/swap/hooks'
import { useExpertModeManager, useUserSingleHopOnly, useUserSlippageTolerance } from '../../state/user/hooks'
import { CustomLightSpinner, LinkStyledButton, StyledInternalLink, TYPE } from '../../theme'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import AppBody from '../AppBody'
//import { ClickableText } from '../Pool/styleds'
import Loader from '../../components/Loader'
import { useFeeRate, useIsTransactionUnsupported } from 'hooks/Trades'
import { isTradeBetter } from 'utils/trades'
import { RouteComponentProps } from 'react-router-dom'
import spinner from '../../assets/svg/spinner.svg'
import { useTokenPriceObject } from '../../hooks/liquidity/useBasePairs'
import { currencyId, tokenAddress } from '../../utils/currencyId'
import { amountFormat } from '../../utils/format'

const WarningWrapper = styled(AutoRow)`
  margin-top: 20px;
  border-radius: 8px;
  background-color: rgba(255, 222, 41, 0.2);
  padding: 9px;
  justify-content: flex-start;
  margin-bottom: 10px;
}
`

const ErrorWrapper = styled(AutoRow)`
  border-radius: 8px;
  background-color: rgba(104, 54, 60, 0.6);
  padding: 9px;
`

export default function Swap({ history }: RouteComponentProps) {
  const loadedUrlParams = useDefaultsFromURLSearch()

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId)
  ]
  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false)
  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c instanceof Token) ?? [],
    [loadedInputCurrency, loadedOutputCurrency]
  )
  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
  }, [])

  // dismiss warning if all imported tokens are in active lists
  const defaultTokens = useAllTokens()
  const importTokensNotInDefault =
    urlLoadedTokens &&
    urlLoadedTokens.filter((token: Token) => {
      return !Boolean(token.address in defaultTokens)
    })

  const { account, chainId } = useActiveWeb3React()
  const theme = useContext(ThemeContext)

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()

  // for expert mode
  //const toggleSettings = useToggleSettingsMenu()
  const [isExpertMode] = useExpertModeManager()

  // get custom setting values for user
  const [allowedSlippage] = useUserSlippageTolerance()

  // swap state
  const { independentField, typedValue, recipient } = useSwapState()
  const {
    v1Trade,
    v2Trade,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError
  } = useDerivedSwapInfo()
  const feeRate = useFeeRate(currencies[Field.INPUT], currencies[Field.OUTPUT])
  const { wrapType, execute: onWrap, inputError: wrapInputError } = useWrapCallback(
    currencies[Field.INPUT],
    currencies[Field.OUTPUT],
    typedValue
  )
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
  const { address: recipientAddress } = useENSAddress(recipient)
  const toggledVersion = useToggledVersion()
  const tradesByVersion = {
    [Version.v1]: v1Trade,
    [Version.v2]: v2Trade
  }
  const trade = showWrap ? undefined : tradesByVersion[toggledVersion]
  const defaultTrade = showWrap ? undefined : tradesByVersion[DEFAULT_VERSION]
  const betterTradeLinkV2: Version | undefined =
    toggledVersion === Version.v1 && isTradeBetter(v1Trade, v2Trade) ? Version.v2 : undefined

  const parsedAmounts = showWrap
    ? {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount
      }
    : {
        [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
        [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount
      }
  const currencyInput = currencies[Field.INPUT]
  const currencyOutput = currencies[Field.OUTPUT]
  const inputCurrencyId = currencyInput ? currencyId(currencyInput) : undefined
  const outputCurrencyId = currencyOutput ? currencyId(currencyOutput) : undefined

  const chainWETH = WETH[chainId ?? 1]
  const inputAddress = tokenAddress(chainWETH, currencies.INPUT)?.toLowerCase()
  const outAddress = tokenAddress(chainWETH, currencies.OUTPUT)?.toLowerCase()

  const addresses = useMemo(() => {
    return [inputAddress, outAddress]
  }, [inputAddress, outAddress])
  const { result: priceResult } = useTokenPriceObject(addresses)
  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()
  const isValid = !swapInputError
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput]
  )
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput]
  )

  // reset if they close warning without tokens in params
  const handleDismissTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
    history.push('/swap/exchange')
  }, [history])

  // modal and loading
  const [
    { showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash, pendingMessage, errorCode },
    setSwapState
  ] = useState<{
    showConfirm: boolean
    tradeToConfirm: Trade | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
    pendingMessage: string | undefined
    errorCode: number | undefined
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined,
    pendingMessage: undefined,
    errorCode: undefined
  })

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ''
      : parsedAmounts[dependentField]?.toSignificant(6) ?? ''
  }

  const route = trade?.route

  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  )
  const noRoute = !route

  // check whether the user has approved the router on the input token
  const [approval, approveCallback, approveToken] = useApproveCallbackFromTrade(trade, allowedSlippage)
  // check if user has gone through approval process, used to show two step buttons, reset on token change

  const [pending, setPending] = useState<boolean>(false)
  const [showAddToken, setShowAddToken] = useState<boolean>(false)

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))

  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(trade, allowedSlippage, recipient)

  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)

  const [singleHopOnly] = useUserSingleHopOnly()

  const handleApprove = useCallback(() => {
    setSwapState({
      pendingMessage: `Approve ${approveToken?.symbol}`,
      attemptingTxn: true,
      tradeToConfirm: undefined,
      showConfirm,
      swapErrorMessage: undefined,
      txHash: undefined,
      errorCode: undefined
    })
    setPending(true)
    approveCallback()
      .then(response => {
        setShowAddToken(false)
        setPending(true)
        setSwapState({
          pendingMessage: undefined,
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: undefined,
          txHash: response?.hash,
          errorCode: undefined
        })
      })
      .catch(error => {
        setPending(true)
        setSwapState({
          pendingMessage: undefined,
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: error.message,
          txHash: undefined,
          errorCode: error.code
        })
      })
  }, [approveCallback, approveToken, showConfirm, tradeToConfirm])

  const handleSwap = useCallback(() => {
    if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee)) {
      return
    }
    if (!swapCallback) {
      return
    }
    setPending(false)
    setSwapState({
      pendingMessage: `Swap ${trade?.inputAmount.toSignificant()} ${
        trade?.inputAmount.currency.symbol
      } for ${trade?.outputAmount.toSignificant()} ${trade?.outputAmount.currency.symbol}`,
      attemptingTxn: true,
      tradeToConfirm,
      showConfirm,
      swapErrorMessage: undefined,
      txHash: undefined,
      errorCode: undefined
    })
    swapCallback()
      .then(hash => {
        setShowAddToken(true)
        onUserInput(Field.INPUT, '')
        setPending(true)
        setSwapState({
          pendingMessage: undefined,
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: undefined,
          txHash: hash,
          errorCode: undefined
        })

        ReactGA.event({
          category: 'Swap',
          action:
            recipient === null
              ? 'Swap w/o Send'
              : (recipientAddress ?? recipient) === account
              ? 'Swap w/o Send + recipient'
              : 'Swap w/ Send',
          label: [
            trade?.inputAmount?.currency?.symbol,
            trade?.outputAmount?.currency?.symbol,
            getTradeVersion(trade)
          ].join('/')
        })

        ReactGA.event({
          category: 'Routing',
          action: singleHopOnly ? 'Swap with multihop disabled' : 'Swap with multihop enabled'
        })
      })
      .catch(error => {
        setPending(true)
        setSwapState({
          pendingMessage: undefined,
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: error.message,
          txHash: undefined,
          errorCode: error.code
        })
      })
  }, [
    priceImpactWithoutFee,
    swapCallback,
    trade,
    tradeToConfirm,
    showConfirm,
    onUserInput,
    recipient,
    recipientAddress,
    account,
    singleHopOnly
  ])

  // errors
  //const [showInverted, setShowInverted] = useState<boolean>(false)

  // warnings on slippage
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !swapInputError && (approval === ApprovalState.NOT_APPROVED || approval === ApprovalState.PENDING)

  const handleConfirmDismiss = useCallback(() => {
    setPending(false)
    setSwapState({
      pendingMessage: pendingMessage,
      showConfirm: false,
      tradeToConfirm,
      attemptingTxn,
      swapErrorMessage,
      txHash,
      errorCode: undefined
    })
    // if there was a tx hash, we want to clear the input
    // if (txHash) {
    //   onUserInput(Field.INPUT, '')
    // }
  }, [attemptingTxn, swapErrorMessage, tradeToConfirm, txHash, pendingMessage])

  const handleAcceptChanges = useCallback(() => {
    setSwapState({
      pendingMessage: undefined,
      tradeToConfirm: trade,
      swapErrorMessage,
      txHash,
      attemptingTxn,
      showConfirm,
      errorCode: undefined
    })
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash])

  const handleInputSelect = useCallback(
    inputCurrency => {
      onCurrencySelection(Field.INPUT, inputCurrency)
    },
    [onCurrencySelection]
  )

  const handleMaxInput = useCallback(() => {
    maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact())
  }, [maxAmountInput, onUserInput])

  const handleOutputSelect = useCallback(outputCurrency => onCurrencySelection(Field.OUTPUT, outputCurrency), [
    onCurrencySelection
  ])

  const swapIsUnsupported = useIsTransactionUnsupported(currencies?.INPUT, currencies?.OUTPUT)

  return (
    <>
      <TokenWarningModal
        isOpen={importTokensNotInDefault.length > 0 && !dismissTokenWarning}
        tokens={importTokensNotInDefault}
        onConfirm={handleConfirmTokenWarning}
        onDismiss={handleDismissTokenWarning}
      />
      <SwapPoolTabs active={'swap'} />
      <AppBody>
        <SwapHeader />
        <Wrapper id="swap-page">
          <ConfirmSwapModal
            feeRate={feeRate}
            token0USD={`≈$${
              inputAddress && priceResult && formattedAmounts[Field.INPUT]
                ? amountFormat(Number(priceResult[inputAddress]) * Number(formattedAmounts[Field.INPUT]), 2)
                : '0.00'
            }USD`}
            token1USD={`≈$${
              outAddress && priceResult && formattedAmounts[Field.OUTPUT]
                ? amountFormat(Number(priceResult[outAddress]) * Number(formattedAmounts[Field.OUTPUT]), 2)
                : '0.00'
            }USD`}
            showAddToken={showAddToken}
            isOpen={showConfirm || pending}
            errorCode={errorCode}
            pendingMessage={pendingMessage}
            trade={trade}
            originalTrade={tradeToConfirm}
            onAcceptChanges={handleAcceptChanges}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
            recipient={recipient}
            allowedSlippage={allowedSlippage}
            onConfirm={handleSwap}
            swapErrorMessage={swapErrorMessage}
            onDismiss={handleConfirmDismiss}
          />

          <AutoColumn gap={'sm'}>
            <CurrencyInputPanel
              showCommonBases
              isError={swapInputError === `Insufficient ${currencies[Field.INPUT]?.symbol} balance`}
              label={independentField === Field.OUTPUT && !showWrap && trade ? 'Sell (estimated)' : 'Sell'}
              value={formattedAmounts[Field.INPUT]}
              showMaxButton={!atMaxAmountInput}
              currency={currencies[Field.INPUT]}
              onUserInput={handleTypeInput}
              onMax={handleMaxInput}
              onCurrencySelect={handleInputSelect}
              otherCurrency={currencies[Field.OUTPUT]}
              id="swap-currency-input"
            />
            <TYPE.main textAlign={'right'}>
              {`≈$${
                inputAddress && priceResult && formattedAmounts[Field.INPUT]
                  ? amountFormat(Number(priceResult[inputAddress]) * Number(formattedAmounts[Field.INPUT]), 2)
                  : '0.00'
              }`}
              USD
            </TYPE.main>
            <AutoColumn justify="space-between">
              <AutoRow justify={isExpertMode ? 'space-between' : 'center'} style={{ padding: '0 1rem' }}>
                <ArrowWrapper clickable>
                  {/* <ArrowDownCircle
                    size="20"
                    onClick={() => {
                      setApprovalSubmitted(false) // reset 2 step UI for approvals
                      onSwitchTokens()
                    }}
                    color={currencies[Field.INPUT] && currencies[Field.OUTPUT] ? theme.primary1 : theme.text2}
                  /> */}
                  <i
                    className="iconfont hope-icon-common font-28"
                    onClick={() => {
                      onSwitchTokens()
                    }}
                  >
                    &#xe62f;
                  </i>
                </ArrowWrapper>
                {recipient === null && !showWrap && isExpertMode ? (
                  <LinkStyledButton id="add-recipient-button" onClick={() => onChangeRecipient('')}>
                    + Add a send (optional)
                  </LinkStyledButton>
                ) : null}
              </AutoRow>
            </AutoColumn>
            <CurrencyInputPanel
              showCommonBases
              value={formattedAmounts[Field.OUTPUT]}
              onUserInput={handleTypeOutput}
              label={independentField === Field.INPUT && !showWrap && trade ? 'Receive (Estimated)' : 'Receive'}
              showMaxButton={false}
              currency={currencies[Field.OUTPUT]}
              onCurrencySelect={handleOutputSelect}
              otherCurrency={currencies[Field.INPUT]}
              id="swap-currency-output"
            />
            <TYPE.main textAlign={'right'}>
              {`≈$${
                outAddress && priceResult && formattedAmounts[Field.OUTPUT]
                  ? amountFormat(Number(priceResult[outAddress]) * Number(formattedAmounts[Field.OUTPUT]), 2)
                  : '0.00'
              }`}
              USD
            </TYPE.main>

            {recipient !== null && !showWrap ? (
              <>
                <AutoRow justify="space-between" style={{ padding: '0 1rem' }}>
                  <ArrowWrapper clickable={false}>
                    <ArrowDownCircle size="16" color={theme.text2} />
                  </ArrowWrapper>
                  <LinkStyledButton id="remove-recipient-button" onClick={() => onChangeRecipient(null)}>
                    - Remove send
                  </LinkStyledButton>
                </AutoRow>
                <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
              </>
            ) : null}

            {showWrap ? null : (
              <>
                {Boolean(trade) ? (
                  // <Row justify={'center'}>
                  //   <TradePrice
                  //     price={trade?.executionPrice}
                  //     showInverted={showInverted}
                  //     setShowInverted={setShowInverted}
                  //   />
                  // </Row>
                  <AdvancedSwapDetailsDropdown
                    feeRate={feeRate}
                    error={
                      !currencies[Field.INPUT] || !currencies[Field.OUTPUT]
                        ? 'Select a token to see more trading details'
                        : !typedValue
                        ? 'Enter an amount to see more trading details'
                        : noRoute
                        ? ' '
                        : undefined
                    }
                    trade={trade}
                  />
                ) : (
                  <Text textAlign={'center'} fontWeight={500} fontSize={14} color={theme.text2}>
                    {swapInputError || (noRoute && userHasSpecifiedInputOutput) ? (
                      ''
                    ) : (
                      <>
                        Fetching best price
                        <Dots />
                      </>
                    )}
                  </Text>
                )}
                {/*{allowedSlippage !== INITIAL_ALLOWED_SLIPPAGE && (*/}
                {/*  <RowBetween align="center">*/}
                {/*    <ClickableText fontWeight={500} fontSize={14} color={theme.text2} onClick={toggleSettings}>*/}
                {/*      Slippage Tolerance*/}
                {/*    </ClickableText>*/}
                {/*    <ClickableText fontWeight={500} fontSize={14} color={theme.text2} onClick={toggleSettings}>*/}
                {/*      {allowedSlippage / 100}%*/}
                {/*    </ClickableText>*/}
                {/*  </RowBetween>*/}
                {/*)}*/}
              </>
            )}
          </AutoColumn>
          {noRoute && userHasSpecifiedInputOutput && (
            <WarningWrapper>
              <i className="iconfont font-16" style={{ color: '#E4C989', fontWeight: 700 }}>
                &#xe614;
              </i>
              <TYPE.white ml={'10px'} mr={'6px'}>
                Insufficient liquidity for this trade.{' '}
              </TYPE.white>
              <StyledInternalLink to={`/swap/liquidity/manager/deposit/${inputCurrencyId}/${outputCurrencyId}`}>
                Add Liquidity
              </StyledInternalLink>
            </WarningWrapper>
          )}

          {account &&
          userHasSpecifiedInputOutput &&
          (swapInputError || (route && priceImpactSeverity > 3 && !isExpertMode)) ? (
            <ErrorWrapper>
              <i className="iconfont font-16" style={{ color: '#F6465D', fontWeight: 700 }}>
                &#xe614;
              </i>
              <TYPE.main color={'#F6465D'} ml={'10px'}>
                {swapInputError ? swapInputError : 'Price Impact Too High'}
              </TYPE.main>
            </ErrorWrapper>
          ) : null}

          <BottomGrouping>
            {swapIsUnsupported ? (
              <ButtonPrimary disabled={true}>
                <TYPE.main mb="4px">Unsupported Asset</TYPE.main>
              </ButtonPrimary>
            ) : !account ? (
              <ButtonPrimary onClick={toggleWalletModal}>Connect Wallet</ButtonPrimary>
            ) : showWrap ? (
              <ButtonPrimary disabled={Boolean(wrapInputError)} onClick={onWrap}>
                {wrapInputError ??
                  (wrapType === WrapType.WRAP ? 'Wrap' : wrapType === WrapType.UNWRAP ? 'Unwrap' : null)}
              </ButtonPrimary>
            ) : noRoute && userHasSpecifiedInputOutput ? (
              <GreyCard style={{ textAlign: 'center' }}>
                <TYPE.main mb="4px">Insufficient liquidity for this trade.</TYPE.main>
                {singleHopOnly && <TYPE.main mb="4px">Try enabling multi-hop trades.</TYPE.main>}
              </GreyCard>
            ) : showApproveFlow ? (
              <RowBetween>
                <ButtonConfirmed
                  onClick={handleApprove}
                  disabled={approval !== ApprovalState.NOT_APPROVED}
                  altDisabledStyle={!!pendingMessage || approval === ApprovalState.PENDING} // show solid button while waiting
                  confirmed={!!pendingMessage || approval === ApprovalState.APPROVED}
                >
                  {pendingMessage || approval === ApprovalState.PENDING ? (
                    <AutoRow gap="6px" justify="center">
                      Approving <Loader stroke="white" />
                    </AutoRow>
                  ) : approval === ApprovalState.APPROVED ? (
                    'Approved'
                  ) : (
                    <AutoRow gap={'4px'} justify={'center'}>
                      {'Approve ' + currencies[Field.INPUT]?.symbol}
                    </AutoRow>
                  )}
                </ButtonConfirmed>
                {/*<ButtonError*/}
                {/*  onClick={() => {*/}
                {/*    if (isExpertMode) {*/}
                {/*      handleSwap()*/}
                {/*    } else {*/}
                {/*      setSwapState({*/}
                {/*        pendingMessage: undefined,*/}
                {/*        tradeToConfirm: trade,*/}
                {/*        attemptingTxn: false,*/}
                {/*        swapErrorMessage: undefined,*/}
                {/*        showConfirm: true,*/}
                {/*        txHash: undefined*/}
                {/*      })*/}
                {/*    }*/}
                {/*  }}*/}
                {/*  width="48%"*/}
                {/*  id="swap-button"*/}
                {/*  disabled={*/}
                {/*    !isValid || approval !== ApprovalState.APPROVED || (priceImpactSeverity > 3 && !isExpertMode)*/}
                {/*  }*/}
                {/*  error={isValid && priceImpactSeverity > 2}*/}
                {/*>*/}
                {/*  <Text fontSize={16} fontWeight={500}>*/}
                {/*    {priceImpactSeverity > 3 && !isExpertMode*/}
                {/*      ? `Price Impact High`*/}
                {/*      : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`}*/}
                {/*  </Text>*/}
                {/*</ButtonError>*/}
              </RowBetween>
            ) : (
              <>
                {pendingMessage ? (
                  <ButtonConfirmed
                    altDisabledStyle={!!pendingMessage} // show solid button while waiting
                    confirmed={!!pendingMessage}
                  >
                    <AutoRow gap="6px" justify="center">
                      Confirm in your wallet
                      <CustomLightSpinner style={{ marginLeft: 10 }} size={'16px'} src={spinner} />
                    </AutoRow>
                  </ButtonConfirmed>
                ) : (
                  <ButtonError
                    onClick={() => {
                      if (isExpertMode) {
                        handleSwap()
                      } else {
                        setSwapState({
                          pendingMessage: undefined,
                          tradeToConfirm: trade,
                          attemptingTxn: false,
                          swapErrorMessage: undefined,
                          showConfirm: true,
                          txHash: undefined,
                          errorCode: undefined
                        })
                      }
                    }}
                    id="swap-button"
                    disabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError}
                  >
                    <Text fontSize={16} fontWeight={500}>
                      {!userHasSpecifiedInputOutput && swapInputError ? swapInputError : `Swap`}
                    </Text>
                  </ButtonError>
                )}
              </>
            )}
            {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
            {betterTradeLinkV2 && !swapIsUnsupported && toggledVersion === Version.v1 ? (
              <BetterTradeLink version={betterTradeLinkV2} />
            ) : toggledVersion !== DEFAULT_VERSION && defaultTrade ? (
              <DefaultVersionLink />
            ) : null}
          </BottomGrouping>
        </Wrapper>
      </AppBody>
    </>
  )
}
