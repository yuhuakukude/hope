import { BigNumber } from '@ethersproject/bignumber'
import { TransactionResponse } from '@ethersproject/providers'
import { Currency, currencyEquals, ETHER, TokenAmount, WETH } from '@uniswap/sdk'
import React, { useCallback, useContext, useMemo, useState } from 'react'
import { PlusCircle } from 'react-feather'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components'
import { ButtonConfirmed, ButtonError, ButtonPrimary } from '../../components/Button'
import { GreyCard, LightCard } from '../../components/Card'
import { AutoColumn, ColumnCenter, GapColumn } from '../../components/Column'
import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent
} from '../../components/TransactionConfirmationModal'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import DoubleCurrencyLogo from '../../components/DoubleLogo'
import { MinimalPositionCard } from '../../components/PositionCard'
import Row, { AutoRow, RowBetween, RowFlat } from '../../components/Row'

import { PairState } from '../../data/Reserves'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import { useWalletModalToggle } from '../../state/application/hooks'
import { Field } from '../../state/mint/actions'
import { useDerivedMintInfo, useMintActionHandlers, useMintState } from '../../state/mint/hooks'

import { useTransactionAdder } from '../../state/transactions/hooks'
import { useUserSlippageTolerance } from '../../state/user/hooks'
import { CustomLightSpinner, TYPE } from '../../theme'
import { calculateGasMargin, calculateSlippageAmount, getRouterContract } from '../../utils'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { wrappedCurrency } from '../../utils/wrappedCurrency'
import { Wrapper } from '../Pools/styleds'
import { ConfirmAddModalBottom } from './ConfirmAddModalBottom'
import { currencyId } from '../../utils/currencyId'
import { PoolPriceBar } from './PoolPriceBar'
import { useIsTransactionUnsupported } from 'hooks/Trades'
import UnsupportedCurrencyFooter from 'components/swap/UnsupportedCurrencyFooter'
import spinner from '../../assets/svg/spinner.svg'
import { useHistory } from 'react-router-dom'
import { formatMessage } from '../../utils/format'
import { getRouterAddress } from 'utils/addressHelpers'
import Loader from '../../components/Loader'

const PageWrapper = styled(GapColumn)`
  width: 100%;
  align-items: center;
  justify-content: center;
`

export default function AddLiquidity({ currencyIdA, currencyIdB }: { currencyIdA?: string; currencyIdB?: string }) {
  const { account, chainId, library } = useActiveWeb3React()
  const routerAddress = useMemo(() => getRouterAddress(chainId), [chainId])
  const history = useHistory()
  const theme = useContext(ThemeContext)
  const currencyA = useCurrency(currencyIdA)
  const currencyB = useCurrency(currencyIdB)

  const oneCurrencyIsWETH = Boolean(
    chainId &&
      ((currencyA && currencyEquals(currencyA, WETH[chainId])) ||
        (currencyB && currencyEquals(currencyB, WETH[chainId])))
  )

  const toggleWalletModal = useWalletModalToggle() // toggle wallet when disconnected

  // const expertMode = useIsExpertMode()

  // mint state
  const { independentField, typedValue, otherTypedValue } = useMintState()
  const {
    dependentField,
    currencies,
    pair,
    pairState,
    currencyBalances,
    parsedAmounts,
    price,
    noLiquidity,
    liquidityMinted,
    poolTokenPercentage,
    error
  } = useDerivedMintInfo(currencyA ?? undefined, currencyB ?? undefined)

  const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noLiquidity)

  const isValid = !error

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm
  const [pendingText, setPendingText] = useState('')
  const [isApproveTx, setIsApproveTx] = useState(false)
  const [errorStatus, setErrorStatus] = useState<{ code: number; message: string } | undefined>()

  // txn values
  const deadline = useTransactionDeadline() // custom from users settings
  const [allowedSlippage] = useUserSlippageTolerance() // custom from users
  const [txHash, setTxHash] = useState<string>('')

  // get formatted amounts
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: noLiquidity ? otherTypedValue : parsedAmounts[dependentField]?.toSignificant(6) ?? ''
  }

  // get the max amounts user can add
  const maxAmounts: { [field in Field]?: TokenAmount } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmountSpend(currencyBalances[field])
      }
    },
    {}
  )

  const atMaxAmounts: { [field in Field]?: TokenAmount } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmounts[field]?.equalTo(parsedAmounts[field] ?? '0')
      }
    },
    {}
  )

  const onTxError = useCallback(error => {
    setTxHash('')
    setAttemptingTxn(false)
    setErrorStatus({ code: error?.code, message: formatMessage(error) ?? error.message })
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

  // check whether the user has approved the router on the tokens
  const [approvalA, approveACallback] = useApproveCallback(parsedAmounts[Field.CURRENCY_A], routerAddress)
  const [approvalB, approveBCallback] = useApproveCallback(parsedAmounts[Field.CURRENCY_B], routerAddress)

  const approveCallback = useCallback(
    (symbol: string, approve: () => Promise<TransactionResponse | undefined>) => {
      setIsApproveTx(true)
      onTxStart(`Approve ${symbol}`)
      approve()
        .then((response: TransactionResponse | undefined) => {
          onTxEnd(response?.hash)
        })
        .catch(error => {
          onTxError(error)
        })
    },
    [onTxEnd, onTxError, onTxStart]
  )

  const addTransaction = useTransactionAdder()

  const addCallback = useCallback(() => {
    if (!chainId || !library || !account) return
    setIsApproveTx(false)
    const router = getRouterContract(chainId, library, account)

    const { [Field.CURRENCY_A]: parsedAmountA, [Field.CURRENCY_B]: parsedAmountB } = parsedAmounts
    if (!parsedAmountA || !parsedAmountB || !currencyA || !currencyB || !deadline) {
      return
    }

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(parsedAmountA, noLiquidity ? 0 : allowedSlippage)[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(parsedAmountB, noLiquidity ? 0 : allowedSlippage)[0]
    }

    let estimate,
      method: (...args: any) => Promise<TransactionResponse>,
      args: Array<string | string[] | number>,
      value: BigNumber | null
    if (currencyA === ETHER || currencyB === ETHER) {
      const tokenBIsETH = currencyB === ETHER
      estimate = router.estimateGas.addLiquidityETH
      method = router.addLiquidityETH
      args = [
        wrappedCurrency(tokenBIsETH ? currencyA : currencyB, chainId)?.address ?? '', // token
        (tokenBIsETH ? parsedAmountA : parsedAmountB).raw.toString(), // token desired
        amountsMin[tokenBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(), // token min
        amountsMin[tokenBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(), // eth min
        account,
        deadline.toHexString()
      ]
      value = BigNumber.from((tokenBIsETH ? parsedAmountB : parsedAmountA).raw.toString())
    } else {
      estimate = router.estimateGas.addLiquidity
      method = router.addLiquidity
      args = [
        wrappedCurrency(currencyA, chainId)?.address ?? '',
        wrappedCurrency(currencyB, chainId)?.address ?? '',
        parsedAmountA.raw.toString(),
        parsedAmountB.raw.toString(),
        amountsMin[Field.CURRENCY_A].toString(),
        amountsMin[Field.CURRENCY_B].toString(),
        account,
        deadline.toHexString()
      ]
      value = null
    }

    onTxStart(
      `Depositing ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} ${
        currencies[Field.CURRENCY_A]?.symbol
      } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} ${currencies[Field.CURRENCY_B]?.symbol}`
    )
    estimate(...args, value ? { value } : {})
      .then(estimatedGasLimit =>
        method(...args, {
          ...(value ? { value } : {}),
          gasLimit: calculateGasMargin(estimatedGasLimit)
        }).then(response => {
          onFieldAInput('')
          addTransaction(response, {
            summary:
              'Add ' +
              parsedAmounts[Field.CURRENCY_A]?.toSignificant(3) +
              ' ' +
              currencies[Field.CURRENCY_A]?.symbol +
              ' and ' +
              parsedAmounts[Field.CURRENCY_B]?.toSignificant(3) +
              ' ' +
              currencies[Field.CURRENCY_B]?.symbol
          })

          onTxEnd(response?.hash)
        })
      )
      .catch(error => {
        onTxError(error)
      })
  }, [
    account,
    addTransaction,
    allowedSlippage,
    chainId,
    currencies,
    currencyA,
    currencyB,
    deadline,
    library,
    noLiquidity,
    onFieldAInput,
    onTxEnd,
    onTxError,
    onTxStart,
    parsedAmounts
  ])

  const modalHeader = useCallback(() => {
    return noLiquidity ? (
      <AutoColumn gap="20px">
        <LightCard mt="20px" borderRadius="20px">
          <RowFlat>
            <Text fontSize="48px" fontWeight={500} lineHeight="42px" marginRight={10}>
              {currencies[Field.CURRENCY_A]?.symbol + '/' + currencies[Field.CURRENCY_B]?.symbol}
            </Text>
            <DoubleCurrencyLogo
              currency0={currencies[Field.CURRENCY_A]}
              currency1={currencies[Field.CURRENCY_B]}
              size={30}
            />
          </RowFlat>
        </LightCard>
      </AutoColumn>
    ) : (
      <AutoColumn gap={'20px'} style={{ marginTop: 30 }}>
        <GreyCard>
          <AutoColumn gap="20px">
            <RowFlat>
              <DoubleCurrencyLogo
                currency0={currencies[Field.CURRENCY_A]}
                currency1={currencies[Field.CURRENCY_B]}
                size={24}
              />
              <Text ml={'8px'} fontSize="16px">
                {currencies[Field.CURRENCY_A]?.symbol + '/' + currencies[Field.CURRENCY_B]?.symbol + ' Pool Tokens'}
              </Text>
            </RowFlat>
            <Row>
              <Text fontSize="24px" fontWeight={500} marginRight={10}>
                {liquidityMinted?.toSignificant(6)}
              </Text>
            </Row>
          </AutoColumn>
        </GreyCard>
        <TYPE.main fontSize={16} textAlign="left" padding={'8px 0 0 0 '}>
          {`Output is estimated. If the price changes by more than ${allowedSlippage /
            100}% your transaction will revert.`}
        </TYPE.main>
      </AutoColumn>
    )
  }, [allowedSlippage, currencies, liquidityMinted, noLiquidity])

  const modalBottom = useCallback(() => {
    return (
      <ConfirmAddModalBottom
        price={price}
        currencies={currencies}
        parsedAmounts={parsedAmounts}
        noLiquidity={noLiquidity}
        onAdd={addCallback}
        poolTokenPercentage={poolTokenPercentage}
      />
    )
  }, [addCallback, currencies, noLiquidity, parsedAmounts, poolTokenPercentage, price])

  const handleCurrencyASelect = useCallback(
    (currencyA: Currency) => {
      const newCurrencyIdA = currencyId(currencyA)
      if (newCurrencyIdA === currencyIdB) {
        history.push(`/swap/liquidity/manager/deposit/${currencyIdB}/${currencyIdA}`)
      } else {
        history.push(`/swap/liquidity/manager/deposit/${newCurrencyIdA}/${currencyIdB}`)
      }
    },
    [currencyIdB, history, currencyIdA]
  )
  const handleCurrencyBSelect = useCallback(
    (currencyB: Currency) => {
      const newCurrencyIdB = currencyId(currencyB)
      if (currencyIdA === newCurrencyIdB) {
        if (currencyIdB) {
          history.push(`/swap/liquidity/manager/deposit/${currencyIdB}/${newCurrencyIdB}`)
        } else {
          history.push(`/swap/liquidity/manager/deposit/${newCurrencyIdB}`)
        }
      } else {
        history.push(`/swap/liquidity/manager/deposit/${currencyIdA ? currencyIdA : 'ETH'}/${newCurrencyIdB}`)
      }
    },
    [currencyIdA, history, currencyIdB]
  )

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    // if there was a tx hash, we want to clear the input
    setTxHash('')
  }, [])

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
          title={noLiquidity ? 'You Are Creating A Pool' : 'You Will Receive'}
          onDismiss={handleDismissConfirmation}
          topContent={modalHeader}
          bottomContent={modalBottom}
        />
      ),
    [errorStatus, handleDismissConfirmation, modalBottom, modalHeader, noLiquidity]
  )

  const addIsUnsupported = useIsTransactionUnsupported(currencies?.CURRENCY_A, currencies?.CURRENCY_B)

  return (
    <PageWrapper gap={'20px'}>
      <AutoColumn style={{ width: '100%' }}>
        <Wrapper>
          <TransactionConfirmationModal
            isOpen={showConfirm}
            onDismiss={handleDismissConfirmation}
            attemptingTxn={attemptingTxn}
            hash={txHash}
            content={confirmationContent}
            pendingText={pendingText}
            currencyToAdd={isApproveTx ? undefined : pair?.liquidityToken}
          />
          <AutoColumn gap="20px">
            {/*{noLiquidity ||*/}
            {/*  (isCreate ? (*/}
            {/*    <ColumnCenter>*/}
            {/*      <GreyCard>*/}
            {/*        <AutoColumn gap="10px">*/}
            {/*          <TYPE.link fontWeight={600} color={'text1'}>*/}
            {/*            You are the first liquidity provider.*/}
            {/*          </TYPE.link>*/}
            {/*          <TYPE.link fontWeight={400} color={'text1'}>*/}
            {/*            The ratio of tokens you add will set the price of this pool.*/}
            {/*          </TYPE.link>*/}
            {/*          <TYPE.link fontWeight={400} color={'text1'}>*/}
            {/*            Once you are happy with the rate click supply to review.*/}
            {/*          </TYPE.link>*/}
            {/*        </AutoColumn>*/}
            {/*      </GreyCard>*/}
            {/*    </ColumnCenter>*/}
            {/*  ) : (*/}
            {/*    <ColumnCenter>*/}
            {/*      <GreyCard>*/}
            {/*        <AutoColumn gap="10px">*/}
            {/*          <TYPE.link fontWeight={400} color={'text1'}>*/}
            {/*            <b>Tip:</b> When you add liquidity, you will receive pool tokens representing your position.*/}
            {/*            These tokens automatically earn fees proportional to your share of the pool, and can be redeemed*/}
            {/*            at any time.*/}
            {/*          </TYPE.link>*/}
            {/*        </AutoColumn>*/}
            {/*      </GreyCard>*/}
            {/*    </ColumnCenter>*/}
            {/*  ))}*/}
            <CurrencyInputPanel
              label={' '}
              isError={
                error === 'Insufficient ' + currencies[Field.CURRENCY_A]?.symbol + ' balance' &&
                !!parsedAmounts[Field.CURRENCY_A]
              }
              value={formattedAmounts[Field.CURRENCY_A]}
              onUserInput={onFieldAInput}
              onMax={() => {
                onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
              }}
              onCurrencySelect={handleCurrencyASelect}
              showMaxButton={!atMaxAmounts[Field.CURRENCY_A]}
              currency={currencies[Field.CURRENCY_A]}
              id="add-liquidity-input-tokena"
              showCommonBases
            />
            <ColumnCenter>
              <PlusCircle size="20" color={theme.text2} />
              {/* <i className="iconfont font-24 hope-icon-common p-2">&#xe630;</i> */}
            </ColumnCenter>
            <CurrencyInputPanel
              label={' '}
              isError={
                error === 'Insufficient ' + currencies[Field.CURRENCY_B]?.symbol + ' balance' &&
                !!parsedAmounts[Field.CURRENCY_B]
              }
              value={formattedAmounts[Field.CURRENCY_B]}
              onUserInput={onFieldBInput}
              onCurrencySelect={handleCurrencyBSelect}
              onMax={() => {
                onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '')
              }}
              showMaxButton={!atMaxAmounts[Field.CURRENCY_B]}
              currency={currencies[Field.CURRENCY_B]}
              id="add-liquidity-input-tokenb"
              showCommonBases
            />
            {currencies[Field.CURRENCY_A] && currencies[Field.CURRENCY_B] && pairState !== PairState.INVALID && (
              <>
                <AutoColumn gap={'20px'}>
                  <PoolPriceBar
                    currencies={currencies}
                    poolTokenPercentage={poolTokenPercentage}
                    noLiquidity={noLiquidity}
                    price={price}
                    liquidityMinted={liquidityMinted}
                  />
                </AutoColumn>
              </>
            )}

            {noLiquidity && (
              <Row align={'flex-start'}>
                <i style={{ color: '#FBDD55', fontSize: 12, fontWeight: 700 }} className="iconfont">
                  &#xe614;
                </i>
                <TYPE.gray ml={10} fontWeight={400} color={'text5'}>
                  You are the first liquidity provider! The token ratio that you choose here will set the price on this
                  pool.
                </TYPE.gray>
              </Row>
            )}

            {addIsUnsupported ? (
              <ButtonPrimary disabled={true}>
                <TYPE.main mb="4px">Unsupported Asset</TYPE.main>
              </ButtonPrimary>
            ) : !account ? (
              <ButtonPrimary onClick={toggleWalletModal}>Connect Wallet</ButtonPrimary>
            ) : (
              <AutoColumn gap={'md'}>
                {(approvalA === ApprovalState.NOT_APPROVED ||
                  approvalA === ApprovalState.PENDING ||
                  approvalB === ApprovalState.NOT_APPROVED ||
                  approvalB === ApprovalState.PENDING) &&
                  isValid && (
                    <RowBetween>
                      {approvalA !== ApprovalState.APPROVED && (
                        <ButtonPrimary
                          onClick={() => approveCallback(currencyA?.symbol ?? '', approveACallback)}
                          disabled={approvalA === ApprovalState.PENDING}
                          width={approvalB !== ApprovalState.APPROVED ? '48%' : '100%'}
                        >
                          {approvalA === ApprovalState.PENDING ? (
                            <AutoRow gap="6px" justify="center">
                              Approving <Loader stroke="white" />
                            </AutoRow>
                          ) : (
                            'Approve ' + currencies[Field.CURRENCY_A]?.symbol
                          )}
                        </ButtonPrimary>
                      )}
                      {approvalB !== ApprovalState.APPROVED && (
                        <ButtonPrimary
                          onClick={() => approveCallback(currencyB?.symbol ?? '', approveBCallback)}
                          disabled={approvalB === ApprovalState.PENDING}
                          width={approvalA !== ApprovalState.APPROVED ? '48%' : '100%'}
                        >
                          {approvalB === ApprovalState.PENDING ? (
                            <AutoRow gap="6px" justify="center">
                              Approving <Loader stroke="white" />
                            </AutoRow>
                          ) : (
                            'Approve ' + currencies[Field.CURRENCY_B]?.symbol
                          )}
                        </ButtonPrimary>
                      )}
                    </RowBetween>
                  )}
                {pendingText && !isApproveTx ? (
                  <ButtonConfirmed
                    altDisabledStyle={!!pendingText} // show solid button while waiting
                    confirmed={!!pendingText}
                  >
                    <AutoRow gap="6px" justify="center">
                      Confirm in your wallet
                      <CustomLightSpinner style={{ marginLeft: 10 }} size={'16px'} src={spinner} />
                    </AutoRow>
                  </ButtonConfirmed>
                ) : (
                  <ButtonError
                    onClick={() => {
                      setErrorStatus(undefined)
                      setShowConfirm(true)
                    }}
                    disabled={!isValid || approvalA !== ApprovalState.APPROVED || approvalB !== ApprovalState.APPROVED}
                    error={!isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]}
                  >
                    <Text fontSize={16} fontWeight={500}>
                      {error ?? 'Deposit'}
                    </Text>
                  </ButtonError>
                )}
              </AutoColumn>
            )}
          </AutoColumn>
          {!addIsUnsupported ? (
            pair && !noLiquidity && pairState !== PairState.INVALID ? (
              <AutoColumn style={{ minWidth: '20rem', width: '100%', maxWidth: '400px', marginTop: '1rem' }}>
                <MinimalPositionCard showUnwrapped={oneCurrencyIsWETH} pair={pair} />
              </AutoColumn>
            ) : null
          ) : (
            <UnsupportedCurrencyFooter
              show={addIsUnsupported}
              currencies={[currencies.CURRENCY_A, currencies.CURRENCY_B]}
            />
          )}
        </Wrapper>
      </AutoColumn>
    </PageWrapper>
  )
}
