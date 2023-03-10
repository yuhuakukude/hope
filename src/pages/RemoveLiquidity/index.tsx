import { splitSignature } from '@ethersproject/bytes'
import { Contract } from '@ethersproject/contracts'
import { TransactionResponse } from '@ethersproject/providers'
import { Currency, currencyEquals, ETHER, Percent, WETH } from '@uniswap/sdk'
import React, { useCallback, useContext, useMemo, useState } from 'react'
import { ArrowDown, Plus, PlusCircle } from 'react-feather'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components'
import { ButtonPrimary, ButtonLight, ButtonError, ButtonConfirmed } from '../../components/Button'
import { AutoColumn, ColumnCenter } from '../../components/Column'
import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent
} from '../../components/TransactionConfirmationModal'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import DoubleCurrencyLogo from '../../components/DoubleLogo'
import { MinimalPositionCard } from '../../components/PositionCard'
import Row, { RowBetween, RowFixed } from '../../components/Row'
import Slider from '../../components/Slider'
import CurrencyLogo from '../../components/CurrencyLogo'
import { ROUTER_ADDRESS } from '../../constants'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { usePairContract } from '../../hooks/useContract'
import useIsArgentWallet from '../../hooks/useIsArgentWallet'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'

import { useTransactionAdder } from '../../state/transactions/hooks'
import { StyledInternalLink, TYPE } from '../../theme'
import { calculateGasMargin, calculateSlippageAmount, getRouterContract } from '../../utils'
import { currencyId } from '../../utils/currencyId'
import useDebouncedChangeHandler from '../../utils/useDebouncedChangeHandler'
import { wrappedCurrency } from '../../utils/wrappedCurrency'
import { ClickableText, MaxButton } from '../Pool/styleds'
import { useApproveCallback, ApprovalState } from '../../hooks/useApproveCallback'
import { Dots } from '../../components/swap/styleds'
import { useBurnActionHandlers } from '../../state/burn/hooks'
import { useDerivedBurnInfo, useBurnState } from '../../state/burn/hooks'
import { Field } from '../../state/burn/actions'
import { useWalletModalToggle } from '../../state/application/hooks'
import { useUserSlippageTolerance } from '../../state/user/hooks'
import { BigNumber } from '@ethersproject/bignumber'
import { useHistory } from 'react-router-dom'
import { Divider } from 'antd'
import { GreyCard } from '../../components/Card'
import format from 'utils/format'

const PageWrapper = styled(ColumnCenter)`
  width: 100%;
  align-items: center;
  justify-content: center;
`

export default function RemoveLiquidity({ currencyIdA, currencyIdB }: { currencyIdA?: string; currencyIdB?: string }) {
  const [currencyA, currencyB] = [useCurrency(currencyIdA) ?? undefined, useCurrency(currencyIdB) ?? undefined]
  const { account, chainId, library } = useActiveWeb3React()
  const [tokenA, tokenB] = useMemo(() => [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)], [
    currencyA,
    currencyB,
    chainId
  ])
  const history = useHistory()
  const theme = useContext(ThemeContext)

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()

  // burn state
  const { independentField, typedValue } = useBurnState()
  const { pair, parsedAmounts, error } = useDerivedBurnInfo(currencyA ?? undefined, currencyB ?? undefined)
  const { onUserInput: _onUserInput } = useBurnActionHandlers()
  const isValid = !error

  const [pendingText, setPendingText] = useState('')

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [showDetailed, setShowDetailed] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm

  const [errorStatus, setErrorStatus] = useState<{ code: number; message: string } | undefined>()

  // txn values
  const [txHash, setTxHash] = useState<string>('')
  const deadline = useTransactionDeadline()
  const [allowedSlippage] = useUserSlippageTolerance()

  const formattedAmounts = {
    [Field.LIQUIDITY_PERCENT]: parsedAmounts[Field.LIQUIDITY_PERCENT].equalTo('0')
      ? '0'
      : parsedAmounts[Field.LIQUIDITY_PERCENT].lessThan(new Percent('1', '100'))
      ? '<1'
      : parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0),
    [Field.LIQUIDITY]:
      independentField === Field.LIQUIDITY ? typedValue : parsedAmounts[Field.LIQUIDITY]?.toSignificant(6) ?? '',
    [Field.CURRENCY_A]:
      independentField === Field.CURRENCY_A ? typedValue : parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) ?? '',
    [Field.CURRENCY_B]:
      independentField === Field.CURRENCY_B ? typedValue : parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) ?? ''
  }

  const atMaxAmount = parsedAmounts[Field.LIQUIDITY_PERCENT]?.equalTo(new Percent('1'))

  //status
  const onTxError = useCallback(error => {
    setTxHash('')
    setAttemptingTxn(false)
    setErrorStatus({ code: error?.code, message: error.message })
    setShowConfirm(true)
    setPendingText('')
  }, [])

  const onTxStart = useCallback(confirmMessage => {
    setPendingText(confirmMessage)
    setErrorStatus(undefined)
    setTxHash('')
    setShowConfirm(true)
    setAttemptingTxn(true)
  }, [])

  const onTxEnd = useCallback((hash?: string) => {
    setShowConfirm(true)
    setPendingText(``)
    setAttemptingTxn(false)
    hash && setTxHash(hash)
  }, [])

  // pair contract
  const pairContract: Contract | null = usePairContract(pair?.liquidityToken?.address)

  // allowance handling
  const [signatureData, setSignatureData] = useState<{ v: number; r: string; s: string; deadline: number } | null>(null)
  const [approval, approveCallback, token] = useApproveCallback(parsedAmounts[Field.LIQUIDITY], ROUTER_ADDRESS)

  const handleApprove = useCallback(() => {
    onTxStart(`Approve ${token?.symbol}`)
    approveCallback()
      .then((response: TransactionResponse | undefined) => {
        onTxEnd(response?.hash)
      })
      .catch(error => {
        onTxError(error)
      })
  }, [approveCallback, onTxEnd, onTxError, onTxStart, token])

  const isArgentWallet = useIsArgentWallet()

  async function onAttemptToApprove() {
    if (!pairContract || !pair || !library || !deadline) throw new Error('missing dependencies')
    const liquidityAmount = parsedAmounts[Field.LIQUIDITY]
    if (!liquidityAmount) throw new Error('missing liquidity amount')

    if (isArgentWallet) {
      return handleApprove()
    }

    setErrorStatus(undefined)
    setShowConfirm(true)
    setAttemptingTxn(true)
    setPendingText(`Approve ${pair.liquidityToken.symbol}`)
    // try to gather a signature for permission
    const nonce = await pairContract.nonces(account)

    const EIP712Domain = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' }
    ]
    const domain = {
      name: 'HOPE-SWAP',
      version: '1',
      chainId: chainId,
      verifyingContract: pair.liquidityToken.address
    }
    const Permit = [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' }
    ]
    const message = {
      owner: account,
      spender: ROUTER_ADDRESS,
      value: liquidityAmount.raw.toString(),
      nonce: nonce.toHexString(),
      deadline: deadline.toNumber()
    }
    const data = JSON.stringify({
      types: {
        EIP712Domain,
        Permit
      },
      domain,
      primaryType: 'Permit',
      message
    })

    return library
      .send('eth_signTypedData_v4', [account, data])
      .then(splitSignature)
      .then(signature => {
        setAttemptingTxn(false)
        setPendingText('')
        setShowConfirm(false)
        setSignatureData({
          v: signature.v,
          r: signature.r,
          s: signature.s,
          deadline: deadline.toNumber()
        })
      })
      .catch(error => {
        // for all errors other than 4001 (EIP-1193 user rejected request), fall back to manual approve
        if (error?.code !== 4001) {
          handleApprove()
        } else {
          onTxError(error)
        }
      })
  }

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      setSignatureData(null)
      return _onUserInput(field, typedValue)
    },
    [_onUserInput]
  )

  const onLiquidityInput = useCallback((typedValue: string): void => onUserInput(Field.LIQUIDITY, typedValue), [
    onUserInput
  ])
  const onCurrencyAInput = useCallback((typedValue: string): void => onUserInput(Field.CURRENCY_A, typedValue), [
    onUserInput
  ])
  const onCurrencyBInput = useCallback((typedValue: string): void => onUserInput(Field.CURRENCY_B, typedValue), [
    onUserInput
  ])

  // tx sending
  const addTransaction = useTransactionAdder()

  const onRemove = useCallback(async () => {
    if (!chainId || !library || !account || !deadline) throw new Error('missing dependencies')
    const { [Field.CURRENCY_A]: currencyAmountA, [Field.CURRENCY_B]: currencyAmountB } = parsedAmounts
    if (!currencyAmountA || !currencyAmountB) {
      throw new Error('missing currency amounts')
    }
    const router = getRouterContract(chainId, library, account)

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(currencyAmountA, allowedSlippage)[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(currencyAmountB, allowedSlippage)[0]
    }

    if (!currencyA || !currencyB) throw new Error('missing tokens')
    const liquidityAmount = parsedAmounts[Field.LIQUIDITY]
    if (!liquidityAmount) throw new Error('missing liquidity amount')

    const currencyBIsETH = currencyB === ETHER
    const oneCurrencyIsETH = currencyA === ETHER || currencyBIsETH

    if (!tokenA || !tokenB) throw new Error('could not wrap')

    let methodNames: string[], args: Array<string | string[] | number | boolean>
    // we have approval, use normal remove liquidity
    if (approval === ApprovalState.APPROVED) {
      // removeLiquidityETH
      if (oneCurrencyIsETH) {
        methodNames = ['removeLiquidityETH', 'removeLiquidityETHSupportingFeeOnTransferTokens']
        args = [
          currencyBIsETH ? tokenA.address : tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
          account,
          deadline.toHexString()
        ]
      }
      // removeLiquidity
      else {
        methodNames = ['removeLiquidity']
        args = [
          tokenA.address,
          tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[Field.CURRENCY_A].toString(),
          amountsMin[Field.CURRENCY_B].toString(),
          account,
          deadline.toHexString()
        ]
      }
    }
    // we have a signataure, use permit versions of remove liquidity
    else if (signatureData !== null) {
      // removeLiquidityETHWithPermit
      if (oneCurrencyIsETH) {
        methodNames = ['removeLiquidityETHWithPermit', 'removeLiquidityETHWithPermitSupportingFeeOnTransferTokens']
        args = [
          currencyBIsETH ? tokenA.address : tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
          account,
          signatureData.deadline,
          false,
          signatureData.v,
          signatureData.r,
          signatureData.s
        ]
      }
      // removeLiquidityETHWithPermit
      else {
        methodNames = ['removeLiquidityWithPermit']
        args = [
          tokenA.address,
          tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[Field.CURRENCY_A].toString(),
          amountsMin[Field.CURRENCY_B].toString(),
          account,
          signatureData.deadline,
          false,
          signatureData.v,
          signatureData.r,
          signatureData.s
        ]
      }
    } else {
      throw new Error('Attempting to confirm without approval or a signature. Please contact support.')
    }
    onTxStart(
      `Removing ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} ${currencyA?.symbol} and ${parsedAmounts[
        Field.CURRENCY_B
      ]?.toSignificant(6)} ${currencyB?.symbol}`
    )

    const safeGasEstimates: (BigNumber | undefined)[] = await Promise.all(
      methodNames.map(methodName =>
        router.estimateGas[methodName](...args)
          .then(calculateGasMargin)
          .catch(error => {
            onTxError(error)
            console.error(`estimateGas failed`, methodName, args, error)
            return undefined
          })
      )
    )

    const indexOfSuccessfulEstimation = safeGasEstimates.findIndex(safeGasEstimate =>
      BigNumber.isBigNumber(safeGasEstimate)
    )

    // all estimations failed...
    if (indexOfSuccessfulEstimation === -1) {
      console.error('This transaction would fail. Please contact support.')
    } else {
      const methodName = methodNames[indexOfSuccessfulEstimation]
      const safeGasEstimate = safeGasEstimates[indexOfSuccessfulEstimation]

      await router[methodName](...args, {
        gasLimit: safeGasEstimate
      })
        .then((response: TransactionResponse) => {
          onTxEnd(response?.hash)
          addTransaction(response, {
            summary:
              'Remove ' +
              parsedAmounts[Field.CURRENCY_A]?.toSignificant(3) +
              ' ' +
              currencyA?.symbol +
              ' and ' +
              parsedAmounts[Field.CURRENCY_B]?.toSignificant(3) +
              ' ' +
              currencyB?.symbol
          })
        })
        .catch((error: Error) => {
          onTxError(error)
        })
    }
  }, [
    account,
    addTransaction,
    allowedSlippage,
    approval,
    chainId,
    currencyA,
    currencyB,
    deadline,
    library,
    onTxEnd,
    onTxError,
    onTxStart,
    parsedAmounts,
    signatureData,
    tokenA,
    tokenB
  ])

  const modalHeader = useCallback(() => {
    return (
      <AutoColumn>
        <GreyCard mt={'20px'}>
          <AutoColumn gap={'md'}>
            <RowBetween align="flex-end">
              <RowFixed gap="4px">
                <CurrencyLogo currency={currencyA} size={'24px'} />
                <TYPE.white ml={'10px'} fontSize={20} fontWeight={500}>
                  {parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}
                </TYPE.white>
              </RowFixed>
              <TYPE.main fontSize={16} fontWeight={500} style={{ marginLeft: '10px' }}>
                {currencyA?.symbol}
              </TYPE.main>
            </RowBetween>
            <RowFixed>
              <PlusCircle style={{ marginLeft: 20 }} size="24" color={theme.text3} />
            </RowFixed>
            <RowBetween align="flex-end">
              <RowFixed gap="4px">
                <CurrencyLogo currency={currencyB} size={'20px'} />
                <TYPE.white ml={'10px'} fontSize={20} fontWeight={500}>
                  {parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}
                </TYPE.white>
              </RowFixed>
              <TYPE.main fontSize={16} fontWeight={500} style={{ marginLeft: '10px' }}>
                {currencyB?.symbol}
              </TYPE.main>
            </RowBetween>
          </AutoColumn>
        </GreyCard>
        <TYPE.main color={theme.text2} textAlign="left" mt={'24px'}>
          {`Output is estimated. If the price changes by more than ${allowedSlippage /
            100}% your transaction will revert.`}
        </TYPE.main>
      </AutoColumn>
    )
  }, [allowedSlippage, currencyA, currencyB, parsedAmounts, theme])

  const modalBottom = useCallback(() => {
    return (
      <>
        <Divider style={{ background: '#3D3E46', marginTop: -20 }} />
        <RowBetween>
          <Text color={theme.text2} fontWeight={500} fontSize={16}>
            {'LP ' + currencyA?.symbol + '/' + currencyB?.symbol} Burned
          </Text>
          <DoubleCurrencyLogo currency0={currencyA} currency1={currencyB} />
        </RowBetween>
        <TYPE.white textAlign={'right'} fontWeight={700} fontSize={16}>
          {parsedAmounts[Field.LIQUIDITY]?.toSignificant(6)}
        </TYPE.white>
        {pair && (
          <>
            <RowBetween>
              <Text color={theme.text2} fontWeight={500}>
                Price
              </Text>
              <Text fontWeight={700} color={theme.text1}>
                1 {currencyA?.symbol} = {tokenA ? pair.priceOf(tokenA).toSignificant(6) : '-'} {currencyB?.symbol}
              </Text>
            </RowBetween>
            <RowBetween>
              <div />
              <Text fontWeight={700} color={theme.text1}>
                1 {currencyB?.symbol} = {tokenB ? pair.priceOf(tokenB).toSignificant(6) : '-'} {currencyA?.symbol}
              </Text>
            </RowBetween>
          </>
        )}
        <ButtonPrimary
          mt={'20px'}
          disabled={!(approval === ApprovalState.APPROVED || signatureData !== null)}
          onClick={onRemove}
        >
          <Text fontWeight={500} fontSize={20}>
            Confirm
          </Text>
        </ButtonPrimary>
      </>
    )
  }, [
    approval,
    currencyA,
    currencyB,
    onRemove,
    pair,
    parsedAmounts,
    signatureData,
    theme.text1,
    theme.text2,
    tokenA,
    tokenB
  ])

  const liquidityPercentChangeCallback = useCallback(
    (value: number) => {
      onUserInput(Field.LIQUIDITY_PERCENT, value.toString())
    },
    [onUserInput]
  )

  const oneCurrencyIsETH = currencyA === ETHER || currencyB === ETHER
  const oneCurrencyIsWETH = Boolean(
    chainId &&
      ((currencyA && currencyEquals(WETH[chainId], currencyA)) ||
        (currencyB && currencyEquals(WETH[chainId], currencyB)))
  )

  const handleSelectCurrencyA = useCallback(
    (currency: Currency) => {
      if (currencyIdB && currencyId(currency) === currencyIdB) {
        history.push(`/remove/${currencyId(currency)}/${currencyIdA}`)
      } else {
        history.push(`/remove/${currencyId(currency)}/${currencyIdB}`)
      }
    },
    [currencyIdA, currencyIdB, history]
  )
  const handleSelectCurrencyB = useCallback(
    (currency: Currency) => {
      if (currencyIdA && currencyId(currency) === currencyIdA) {
        history.push(`/remove/${currencyIdB}/${currencyId(currency)}`)
      } else {
        history.push(`/remove/${currencyIdA}/${currencyId(currency)}`)
      }
    },
    [currencyIdA, currencyIdB, history]
  )

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    setSignatureData(null) // important that we clear signature data to avoid bad sigs
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.LIQUIDITY_PERCENT, '0')
    }
    setTxHash('')
  }, [onUserInput, txHash])

  const [innerLiquidityPercentage, setInnerLiquidityPercentage] = useDebouncedChangeHandler(
    Number.parseInt(parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0)),
    liquidityPercentChangeCallback
  )

  const confirmationContent = useCallback(
    () =>
      errorStatus ? (
        <TransactionErrorContent
          errorCode={errorStatus.code}
          onDismiss={() => setShowConfirm(false)}
          message={errorStatus.message}
        />
      ) : (
        <ConfirmationModalContent
          title={'You will receive'}
          onDismiss={handleDismissConfirmation}
          topContent={modalHeader}
          bottomContent={modalBottom}
        />
      ),
    [errorStatus, handleDismissConfirmation, modalBottom, modalHeader]
  )

  return (
    <PageWrapper>
      <AutoColumn style={{ width: '100%' }}>
        <AutoColumn>
          <TransactionConfirmationModal
            isOpen={showConfirm}
            onDismiss={handleDismissConfirmation}
            attemptingTxn={attemptingTxn}
            hash={txHash ? txHash : ''}
            content={confirmationContent}
            pendingText={pendingText}
          />
          <AutoColumn gap="md" style={{ marginTop: 20, padding: 20 }}>
            <AutoColumn gap="20px">
              {pair ? (
                <>
                  <AutoColumn style={{ minWidth: '20rem', width: '100%' }}>
                    <MinimalPositionCard showUnwrapped={oneCurrencyIsWETH} pair={pair} />
                  </AutoColumn>
                  <Divider style={{ background: '#3D3E46', margin: '10px 0' }} />
                </>
              ) : null}
              <RowBetween>
                <TYPE.main fontWeight={500}>Amount</TYPE.main>
                <ClickableText
                  fontWeight={500}
                  onClick={() => {
                    setShowDetailed(!showDetailed)
                  }}
                >
                  {showDetailed ? 'Simple' : 'Detailed'}
                </ClickableText>
              </RowBetween>
              <Row style={{ alignItems: 'flex-end' }}>
                <TYPE.yellow fontSize={30} fontWeight={500}>
                  {formattedAmounts[Field.LIQUIDITY_PERCENT]}%
                </TYPE.yellow>
              </Row>
              {!showDetailed && (
                <>
                  <Slider size={20} value={innerLiquidityPercentage} onChange={setInnerLiquidityPercentage} />
                  <RowBetween>
                    <MaxButton onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '25')} width="20%">
                      25%
                    </MaxButton>
                    <MaxButton onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '50')} width="20%">
                      50%
                    </MaxButton>
                    <MaxButton onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '75')} width="20%">
                      75%
                    </MaxButton>
                    <MaxButton onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '100')} width="20%">
                      Max
                    </MaxButton>
                  </RowBetween>
                </>
              )}
            </AutoColumn>

            {showDetailed && (
              <>
                <CurrencyInputPanel
                  value={formattedAmounts[Field.LIQUIDITY]}
                  onUserInput={onLiquidityInput}
                  onMax={() => {
                    onUserInput(Field.LIQUIDITY_PERCENT, '100')
                  }}
                  showMaxButton={!atMaxAmount}
                  disableCurrencySelect
                  currency={pair?.liquidityToken}
                  pair={pair}
                  id="liquidity-amount"
                />
                <ColumnCenter>
                  <ArrowDown size="16" color={theme.text2} />
                </ColumnCenter>
                <CurrencyInputPanel
                  hideBalance={true}
                  value={formattedAmounts[Field.CURRENCY_A]}
                  onUserInput={onCurrencyAInput}
                  onMax={() => onUserInput(Field.LIQUIDITY_PERCENT, '100')}
                  showMaxButton={!atMaxAmount}
                  currency={currencyA}
                  label={'Output'}
                  onCurrencySelect={handleSelectCurrencyA}
                  id="remove-liquidity-tokena"
                />
                <ColumnCenter>
                  <Plus size="16" color={theme.text2} />
                </ColumnCenter>
                <CurrencyInputPanel
                  hideBalance={true}
                  value={formattedAmounts[Field.CURRENCY_B]}
                  onUserInput={onCurrencyBInput}
                  onMax={() => onUserInput(Field.LIQUIDITY_PERCENT, '100')}
                  showMaxButton={!atMaxAmount}
                  currency={currencyB}
                  label={'Output'}
                  onCurrencySelect={handleSelectCurrencyB}
                  id="remove-liquidity-tokenb"
                />
              </>
            )}
            <div style={{ position: 'relative' }}>
              {!account ? (
                <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>
              ) : (
                <RowBetween>
                  <ButtonConfirmed
                    onClick={onAttemptToApprove}
                    confirmed={approval === ApprovalState.APPROVED || signatureData !== null}
                    disabled={approval !== ApprovalState.NOT_APPROVED || signatureData !== null}
                    mr="0.5rem"
                    fontWeight={500}
                    fontSize={16}
                  >
                    {approval === ApprovalState.PENDING ? (
                      <Dots>Approving</Dots>
                    ) : approval === ApprovalState.APPROVED || signatureData !== null ? (
                      'Approved'
                    ) : (
                      'Approve'
                    )}
                  </ButtonConfirmed>
                  <ButtonError
                    onClick={() => {
                      setErrorStatus(undefined)
                      setShowConfirm(true)
                    }}
                    disabled={!isValid || (signatureData === null && approval !== ApprovalState.APPROVED)}
                    error={!isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]}
                  >
                    <Text fontSize={16} fontWeight={500}>
                      {error || 'Remove'}
                    </Text>
                  </ButtonError>
                </RowBetween>
              )}
            </div>
            {chainId && (oneCurrencyIsWETH || oneCurrencyIsETH) ? (
              <RowBetween style={{ justifyContent: 'flex-end' }}>
                {oneCurrencyIsETH ? (
                  <StyledInternalLink
                    to={`/swap/liquidity/manager/withdraw/${
                      currencyA === ETHER ? WETH[chainId].address : currencyIdA
                    }/${currencyB === ETHER ? WETH[chainId].address : currencyIdB}`}
                  >
                    Receive WETH
                  </StyledInternalLink>
                ) : oneCurrencyIsWETH ? (
                  <StyledInternalLink
                    to={`/swap/liquidity/manager/withdraw/${
                      currencyA && currencyEquals(currencyA, WETH[chainId]) ? 'ETH' : currencyIdA
                    }/${currencyB && currencyEquals(currencyB, WETH[chainId]) ? 'ETH' : currencyIdB}`}
                  >
                    Receive ETH
                  </StyledInternalLink>
                ) : null}
              </RowBetween>
            ) : null}
            {!showDetailed && (
              <>
                <AutoColumn gap="10px">
                  <RowBetween>
                    <RowFixed>
                      <CurrencyLogo currency={currencyA} style={{ marginRight: '12px' }} />
                      <Text fontWeight={500} id="remove-liquidity-tokena-symbol">
                        {currencyA?.symbol}
                      </Text>
                    </RowFixed>
                    <Text fontWeight={500}>{format.separate(formattedAmounts[Field.CURRENCY_A], 6) || '-'}</Text>
                  </RowBetween>
                  <RowBetween>
                    <RowFixed>
                      <CurrencyLogo currency={currencyB} style={{ marginRight: '12px' }} />
                      <Text fontWeight={500} id="remove-liquidity-tokenb-symbol">
                        {currencyB?.symbol}
                      </Text>
                    </RowFixed>
                    <Text fontWeight={500}>{format.separate(formattedAmounts[Field.CURRENCY_B], 6) || '-'}</Text>
                  </RowBetween>
                </AutoColumn>
              </>
            )}
            {pair && (
              <AutoColumn gap={'10px'}>
                <RowBetween>
                  <TYPE.main>{currencyA?.symbol} Swap Rate</TYPE.main>
                  <div>
                    1 {currencyA?.symbol} ≈{' '}
                    {tokenA ? pair.priceOf(tokenA).toSignificant(6, { groupSeparator: ',' }) : '-'} {currencyB?.symbol}
                  </div>
                </RowBetween>
                <RowBetween>
                  <TYPE.main>{currencyA?.symbol} Swap Rate</TYPE.main>
                  <div>
                    1 {currencyB?.symbol} ≈{' '}
                    {tokenB ? pair.priceOf(tokenB).toSignificant(6, { groupSeparator: ',' }) : '-'} {currencyA?.symbol}
                  </div>
                </RowBetween>
              </AutoColumn>
            )}
          </AutoColumn>
        </AutoColumn>
      </AutoColumn>
    </PageWrapper>
  )
}
