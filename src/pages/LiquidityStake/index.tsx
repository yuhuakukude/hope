import { BigNumber } from '@ethersproject/bignumber'
import { TransactionResponse } from '@ethersproject/providers'
import { Currency, ETHER, JSBI, TokenAmount } from '@uniswap/sdk'
import React, { useCallback, useContext, useState } from 'react'
import { PlusCircle } from 'react-feather'
import { RouteComponentProps } from 'react-router-dom'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components'
import { ButtonError, ButtonLight, ButtonPrimary } from '../../components/Button'
import { GreyCard, LightCard } from '../../components/Card'
import { AutoColumn, ColumnCenter, GapColumn } from '../../components/Column'
import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent
} from '../../components/TransactionConfirmationModal'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import DoubleCurrencyLogo from '../../components/DoubleLogo'
import { AddRemoveTabs, StyledMenuIcon } from '../../components/NavigationTabs'
import Row, { AutoRowBetween, RowBetween, RowFixed, RowFlat } from '../../components/Row'

import { PERMIT2_ADDRESS, ROUTER_ADDRESS } from '../../constants'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import { useWalletModalToggle } from '../../state/application/hooks'
import { Field } from '../../state/mint/actions'
import { useDerivedMintInfo, useMintActionHandlers, useMintState } from '../../state/mint/hooks'

import { useTransactionAdder } from '../../state/transactions/hooks'
import { useUserSlippageTolerance } from '../../state/user/hooks'
import { StyledInternalLink, TYPE } from '../../theme'
import { calculateGasMargin, calculateSlippageAmount, getRouterContract } from '../../utils'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { wrappedCurrency } from '../../utils/wrappedCurrency'
import { Dots, Wrapper } from '../Pool/styleds'
import { currencyId } from '../../utils/currencyId'
import { useStakingPool } from '../../hooks/useLPStaking'
import { ConfirmAddModalBottom } from '../AddLiquidity/ConfirmAddModalBottom'
import { useTokenBalance } from '../../state/wallet/hooks'
import { tryParseAmount } from '../../state/swap/hooks'
import { getPermitData, Permit, PERMIT_EXPIRATION, toDeadline } from '../../permit2/domain'
import { ethers } from 'ethers'
import { useStakingContract } from '../../hooks/useContract'
import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'
import BasePoolInfoCard from '../../components/pool/PoolInfoCard'
import TotalApr from '../../components/pool/TotalApr'

const PageWrapper = styled(GapColumn)`
  width: 100%;
  align-items: center;
  justify-content: center;
`

const StyledDropDown = styled(DropDown)<{ selected: boolean }>`
  height: 20px;
  cursor: pointer;

  path {
    stroke: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
    stroke-width: 1.5px;
  }
`

enum TX_TYPE {
  APPROVE,
  ADD_LIQUIDITY,
  STAKING
}

export default function LiquidityStake({
  match: {
    params: { stakingRewardAddress }
  },
  history
}: RouteComponentProps<{ stakingRewardAddress?: string }>) {
  const { account, chainId, library } = useActiveWeb3React()
  const { result: pool } = useStakingPool(stakingRewardAddress ?? '')
  const theme = useContext(ThemeContext)
  const currencyIdA = pool?.tokens[0].address
  const currencyIdB = pool?.tokens[1].address

  const currencyA = useCurrency(currencyIdA)
  const currencyB = useCurrency(currencyIdB)

  const toggleWalletModal = useWalletModalToggle() // toggle wallet when disconnected

  // mint state
  const { independentField, typedValue, otherTypedValue } = useMintState()
  const {
    dependentField,
    currencies,
    pair,
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
  const [errorStatus, setErrorStatus] = useState<{ code: number; message: string } | undefined>()

  const [txType, setTxType] = useState<TX_TYPE>(TX_TYPE.APPROVE)
  console.log('txType', txType)
  // stake values
  const [stakeType, setStakeType] = useState('')
  const [showStaking, setShowStaking] = useState(true)
  const lpBalance = useTokenBalance(account ?? undefined, pool?.lpToken)
  const stakeTypeAmount = tryParseAmount(stakeType, pool?.lpToken)
  const maxStakeAmountInput = maxAmountSpend(lpBalance)
  const atStakeMaxAmount = Boolean(maxStakeAmountInput && stakeTypeAmount?.equalTo(maxStakeAmountInput))

  const stakingContract = useStakingContract(pool?.stakingRewardAddress, true)

  const handleStakeMax = useCallback(() => {
    maxStakeAmountInput && setStakeType(maxStakeAmountInput.toExact())
  }, [maxStakeAmountInput])

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

  // check whether the user has approved the router on the tokens
  const [approvalA, approveACallback] = useApproveCallback(parsedAmounts[Field.CURRENCY_A], ROUTER_ADDRESS)
  const [approvalB, approveBCallback] = useApproveCallback(parsedAmounts[Field.CURRENCY_B], ROUTER_ADDRESS)

  const [approvalLP, approveLPCallback] = useApproveCallback(stakeTypeAmount, PERMIT2_ADDRESS[chainId ?? 1])

  const addTransaction = useTransactionAdder()

  const onTxError = useCallback(error => {
    setTxHash('')
    setAttemptingTxn(false)
    setErrorStatus({ code: error?.code, message: error.message })
    setShowConfirm(true)
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

  const approveCallback = useCallback(
    (symbol: string, approve: () => Promise<TransactionResponse | undefined>) => {
      onTxStart(`Approve ${symbol}`)
      setTxType(TX_TYPE.APPROVE)
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

  const stakeCallback = useCallback(() => {
    if (!account || !library || !chainId || !stakeTypeAmount || !stakingContract || !pool) return
    setTxType(TX_TYPE.STAKING)
    const deadline = toDeadline(PERMIT_EXPIRATION)
    const nonce = ethers.utils.randomBytes(32)
    const permit: Permit = {
      permitted: {
        token: pool.lpToken.address,
        amount: stakeTypeAmount.raw.toString()
      },
      nonce: nonce,
      spender: pool.stakingRewardAddress,
      deadline
    }

    const { domain, types, values } = getPermitData(permit, PERMIT2_ADDRESS[chainId ?? 1], chainId)
    onTxStart(`Approve HOPE`)

    library
      .getSigner(account)
      ._signTypedData(domain, types, values)
      .then(signature => {
        onTxStart(`Stake ${stakeType} ${pool?.lpToken.symbol}`)
        const args = [stakeTypeAmount.raw.toString(), nonce, deadline, signature]
        const method = 'deposit'
        stakingContract.estimateGas[method](...args, { from: account }).then(estimatedGasLimit => {
          return stakingContract[method](...args, {
            gasLimit: calculateGasMargin(estimatedGasLimit),
            // gasLimit: '3500000',
            from: account
          })
            .then((response: TransactionResponse) => {
              onTxEnd(response?.hash)
              addTransaction(response, {
                summary: `Stake ${stakeType}  ${pool?.lpToken.symbol}`
              })
            })
            .catch((error: any) => {
              onTxError(error)
            })
        })
      })
      .catch(error => {
        onTxError(error)
      })
  }, [
    account,
    addTransaction,
    chainId,
    library,
    onTxEnd,
    onTxError,
    onTxStart,
    pool,
    stakeType,
    stakeTypeAmount,
    stakingContract
  ])

  const addCallback = useCallback(() => {
    if (!chainId || !library || !account) return
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
      `Supplying ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} ${
        currencies[Field.CURRENCY_A]?.symbol
      } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} ${currencies[Field.CURRENCY_B]?.symbol}`
    )
    estimate(...args, value ? { value } : {})
      .then(estimatedGasLimit =>
        method(...args, {
          ...(value ? { value } : {}),
          gasLimit: calculateGasMargin(estimatedGasLimit)
        }).then(response => {
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
      <AutoColumn gap="20px">
        <RowFlat style={{ marginTop: '20px' }}>
          <Text fontSize="48px" fontWeight={500} lineHeight="42px" marginRight={10}>
            {liquidityMinted?.toSignificant(6)}
          </Text>
          <DoubleCurrencyLogo
            currency0={currencies[Field.CURRENCY_A]}
            currency1={currencies[Field.CURRENCY_B]}
            size={30}
          />
        </RowFlat>
        <Row>
          <Text fontSize="24px">
            {currencies[Field.CURRENCY_A]?.symbol + '/' + currencies[Field.CURRENCY_B]?.symbol + ' Pool Tokens'}
          </Text>
        </Row>
        <TYPE.main fontSize={12} textAlign="left" padding={'8px 0 0 0 '}>
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

  // const pendingText = `Supplying ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} ${
  //   currencies[Field.CURRENCY_A]?.symbol
  // } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} ${currencies[Field.CURRENCY_B]?.symbol}`

  const handleCurrencyASelect = useCallback(
    (currencyA: Currency) => {
      const newCurrencyIdA = currencyId(currencyA)
      if (newCurrencyIdA === currencyIdB) {
        history.push(`/swap/add/${currencyIdB}/${currencyIdA}`)
      } else {
        history.push(`/swap/add/${newCurrencyIdA}/${currencyIdB}`)
      }
    },
    [currencyIdB, history, currencyIdA]
  )
  const handleCurrencyBSelect = useCallback(
    (currencyB: Currency) => {
      const newCurrencyIdB = currencyId(currencyB)
      if (currencyIdA === newCurrencyIdB) {
        if (currencyIdB) {
          history.push(`/swap/add/${currencyIdB}/${newCurrencyIdB}`)
        } else {
          history.push(`/swap/add/${newCurrencyIdB}`)
        }
      } else {
        history.push(`/swap/add/${currencyIdA ? currencyIdA : 'ETH'}/${newCurrencyIdB}`)
      }
    },
    [currencyIdA, history, currencyIdB]
  )

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onFieldAInput('')
    }
    setTxHash('')
  }, [onFieldAInput, txHash])

  const isCreate = history.location.pathname.includes('/create')

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
          title={noLiquidity ? 'You are creating a pool' : 'You will receive'}
          onDismiss={handleDismissConfirmation}
          topContent={modalHeader}
          bottomContent={modalBottom}
        />
      ),
    [errorStatus, handleDismissConfirmation, modalBottom, modalHeader, noLiquidity]
  )

  return (
    <PageWrapper gap={'20px'}>
      <TransactionConfirmationModal
        isOpen={showConfirm}
        onDismiss={handleDismissConfirmation}
        attemptingTxn={attemptingTxn}
        hash={txHash}
        content={() => confirmationContent()}
        pendingText={pendingText}
        currencyToAdd={pair?.liquidityToken}
      />
      <AddRemoveTabs creating={isCreate} adding={true} />
      <AutoRowBetween align={'flex-start'} gap={'30px'} padding={'30px'}>
        <LightCard flex={4} padding={'20px'}>
          <AutoColumn gap={'30px'}>
            <AutoColumn style={{ borderBottom: '1px solid #3D3E46', paddingBottom: 40 }}>
              <RowBetween mt={'20px'}>
                <TYPE.white fontSize={18} fontWeight={700}>
                  1. Add Liquidity
                </TYPE.white>
                <StyledInternalLink to={'/swap/settings'}>
                  <StyledMenuIcon />
                </StyledInternalLink>
              </RowBetween>
              <Wrapper style={{ padding: 0 }}>
                <AutoColumn gap="20px">
                  <CurrencyInputPanel
                    disableCurrencySelect
                    label={' '}
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
                  </ColumnCenter>
                  <CurrencyInputPanel
                    label={' '}
                    disableCurrencySelect
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

                  {!account ? (
                    <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>
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
                                  <Dots>Approving {currencies[Field.CURRENCY_A]?.symbol}</Dots>
                                ) : (
                                  'Approve ' + currencies[Field.CURRENCY_A]?.symbol
                                )}
                              </ButtonPrimary>
                            )}
                            {approvalB !== ApprovalState.APPROVED && (
                              <ButtonPrimary
                                onClick={() => approveCallback(currencyA?.symbol ?? '', approveBCallback)}
                                disabled={approvalB === ApprovalState.PENDING}
                                width={approvalA !== ApprovalState.APPROVED ? '48%' : '100%'}
                              >
                                {approvalB === ApprovalState.PENDING ? (
                                  <Dots>Approving {currencies[Field.CURRENCY_B]?.symbol}</Dots>
                                ) : (
                                  'Approve ' + currencies[Field.CURRENCY_B]?.symbol
                                )}
                              </ButtonPrimary>
                            )}
                          </RowBetween>
                        )}
                      <ButtonError
                        onClick={addCallback}
                        disabled={
                          !isValid || approvalA !== ApprovalState.APPROVED || approvalB !== ApprovalState.APPROVED
                        }
                        error={!isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]}
                      >
                        <Text fontSize={16} fontWeight={500}>
                          {error ?? 'Supply'}
                        </Text>
                      </ButtonError>
                    </AutoColumn>
                  )}
                </AutoColumn>
              </Wrapper>
            </AutoColumn>
            <AutoColumn gap={'30px'}>
              <RowBetween>
                <TYPE.white fontSize={20}>2. Stake Liquidity</TYPE.white>
                <RowFixed onClick={() => setShowStaking(!showStaking)}>
                  <StyledDropDown
                    selected={
                      showStaking &&
                      !!lpBalance?.raw &&
                      JSBI.lessThan(JSBI.BigInt(lpBalance?.raw.toString()), JSBI.BigInt('0'))
                    }
                  />
                </RowFixed>
              </RowBetween>
              <GreyCard padding={'20px'} borderRadius={'10px'}>
                Stake your liquidity tokens to receive incentive rewards on top of your pool fee rewards
              </GreyCard>
              <>
                {!!lpBalance?.raw &&
                  JSBI.greaterThan(JSBI.BigInt(lpBalance?.raw.toString()), JSBI.BigInt('0')) &&
                  showStaking && (
                    <CurrencyInputPanel
                      value={stakeType}
                      onUserInput={typed => setStakeType(typed)}
                      onMax={handleStakeMax}
                      showMaxButton={!atStakeMaxAmount}
                      currency={pool?.pair.liquidityToken}
                      pair={pool?.pair}
                      label={`${currencyA?.symbol}-${currencyB?.symbol} Pool Token`}
                      disableCurrencySelect={true}
                      customBalanceText={'Available to deposit: '}
                      id="stake-liquidity-token"
                    />
                  )}
              </>
            </AutoColumn>
            {!!lpBalance?.raw &&
              JSBI.greaterThan(JSBI.BigInt(lpBalance?.raw.toString()), JSBI.BigInt('0')) &&
              showStaking && (
                <RowBetween>
                  <ButtonError
                    disabled={
                      approvalLP === ApprovalState.PENDING ||
                      approvalLP === ApprovalState.UNKNOWN ||
                      !lpBalance ||
                      !stakeTypeAmount ||
                      (lpBalance &&
                        stakeTypeAmount &&
                        JSBI.lessThan(
                          JSBI.BigInt(lpBalance?.raw.toString()),
                          JSBI.BigInt(stakeTypeAmount.raw.toString())
                        ))
                    }
                    error={
                      lpBalance &&
                      stakeTypeAmount &&
                      JSBI.lessThan(JSBI.BigInt(lpBalance?.raw.toString()), JSBI.BigInt(stakeTypeAmount.raw.toString()))
                    }
                    onClick={() =>
                      approvalLP === ApprovalState.NOT_APPROVED
                        ? approveCallback(pool?.lpToken.symbol ?? '', approveLPCallback)
                        : stakeCallback()
                    }
                  >
                    {approvalLP === ApprovalState.PENDING ? (
                      <Dots>Approving {currencies[Field.CURRENCY_B]?.symbol}</Dots>
                    ) : approvalLP === ApprovalState.NOT_APPROVED ? (
                      `Approve ${pool?.lpToken.symbol}`
                    ) : lpBalance &&
                      stakeTypeAmount &&
                      JSBI.lessThan(
                        JSBI.BigInt(lpBalance?.raw.toString()),
                        JSBI.BigInt(stakeTypeAmount.raw.toString())
                      ) ? (
                      'Insufficient LP'
                    ) : (
                      'Stake'
                    )}
                  </ButtonError>
                </RowBetween>
              )}
          </AutoColumn>
        </LightCard>
        <LightCard flex={3}>
          <TotalApr address={stakingRewardAddress}></TotalApr>
          <BasePoolInfoCard pool={pool} />
        </LightCard>
      </AutoRowBetween>
    </PageWrapper>
  )
}
