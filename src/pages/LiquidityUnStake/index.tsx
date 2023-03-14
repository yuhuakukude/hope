import { TransactionResponse } from '@ethersproject/providers'
import { JSBI, TokenAmount } from '@uniswap/sdk'
import React, { useCallback, useState } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import styled from 'styled-components'
import { ButtonError } from '../../components/Button'
import { GreyCard, LightCard } from '../../components/Card'
import { AutoColumn, GapColumn } from '../../components/Column'
import TransactionConfirmationModal, { TransactionErrorContent } from '../../components/TransactionConfirmationModal'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { AddRemoveTabs } from '../../components/NavigationTabs'
import { AutoRowBetween, RowBetween } from '../../components/Row'

import { useTransactionAdder } from '../../state/transactions/hooks'
import { useActiveWeb3React } from '../../hooks'
import { calculateGasMargin } from '../../utils'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { useStakingPool } from '../../hooks/useLPStaking'
import { useTokenBalance } from '../../state/wallet/hooks'
import { tryParseAmount } from '../../state/swap/hooks'
import { useStakingContract } from '../../hooks/useContract'
import BasePoolInfoCard from '../../components/pool/PoolInfoCard'
import { MaxButton } from '../Pools/styleds'

import TotalApr from '../../components/pool/TotalApr'

const PageWrapper = styled(GapColumn)`
  width: 100%;
  align-items: center;
  justify-content: center;
`

const PercentButton = styled(MaxButton)`
  padding: 0.5rem 3rem;
  font-size: 1.2rem;
`

export default function LiquidityUnStake({
  match: {
    params: { stakingRewardAddress }
  }
}: RouteComponentProps<{ stakingRewardAddress?: string }>) {
  const { account, chainId, library } = useActiveWeb3React()
  const { result: pool } = useStakingPool(stakingRewardAddress ?? '')

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm
  const [pendingText, setPendingText] = useState('')
  const [errorStatus, setErrorStatus] = useState<{ code: number; message: string } | undefined>()

  // stake values
  const [stakeType, setStakeType] = useState('')
  const stakedAmount = useTokenBalance(account ?? undefined, pool?.stakingToken)
  const stakeTypeAmount = tryParseAmount(stakeType, pool?.lpToken)
  const maxUnStakeAmountInput = maxAmountSpend(stakedAmount)
  const atUnStakeMaxAmount = Boolean(maxUnStakeAmountInput && stakeTypeAmount?.equalTo(maxUnStakeAmountInput))

  const stakingContract = useStakingContract(pool?.stakingRewardAddress, true)

  const handleStakeMax = useCallback(() => {
    maxUnStakeAmountInput && setStakeType(maxUnStakeAmountInput.toExact())
  }, [maxUnStakeAmountInput])

  // txn values
  const [txHash, setTxHash] = useState<string>('')

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

  const unStakeCallback = useCallback(() => {
    if (!account || !library || !chainId || !stakeTypeAmount || !stakingContract || !pool) return

    onTxStart(`Unstake ${stakeType} ${pool?.lpToken.symbol}`)
    const args = [stakeTypeAmount.raw.toString()]
    const method = 'withdraw'
    stakingContract.estimateGas[method](...args, { from: account }).then(estimatedGasLimit => {
      return stakingContract[method](...args, {
        gasLimit: calculateGasMargin(estimatedGasLimit),
        // gasLimit: '3500000',
        from: account
      })
        .then((response: TransactionResponse) => {
          onTxEnd(response?.hash)
          addTransaction(response, {
            summary: `Withdraw ${stakeType}  ${pool?.lpToken.symbol}`
          })
        })
        .catch((error: any) => {
          onTxError(error)
        })
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

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    // if there was a tx hash, we want to clear the input
    setTxHash('')
  }, [])

  return (
    <PageWrapper gap={'20px'}>
      <TransactionConfirmationModal
        isOpen={showConfirm}
        onDismiss={handleDismissConfirmation}
        attemptingTxn={attemptingTxn}
        hash={txHash}
        content={() => (
          <TransactionErrorContent
            errorCode={errorStatus?.code}
            onDismiss={() => setShowConfirm(false)}
            message={errorStatus?.message ?? ''}
          />
        )}
        pendingText={pendingText}
      />
      <AddRemoveTabs />
      <AutoRowBetween align={'flex-start'} gap={'30px'} padding={'30px'}>
        <LightCard flex={4} padding={'20px'}>
          <AutoColumn gap={'30px'}>
            <GreyCard padding={'20px'} borderRadius={'10px'}>
              If you withdraw all staked USDC-BUSD Pool tokens you will no longer receive mint rewards
            </GreyCard>
            <CurrencyInputPanel
              value={stakeType}
              onUserInput={typed => setStakeType(typed)}
              onMax={handleStakeMax}
              showMaxButton={!atUnStakeMaxAmount}
              currency={pool?.stakingToken}
              pair={pool?.pair}
              label={`${pool?.tokens[0]?.symbol}-${pool?.tokens[1]?.symbol} Pool Token`}
              disableCurrencySelect={true}
              customBalanceText={'Available to deposit: '}
              id="stake-liquidity-token"
            />
            <RowBetween>
              <PercentButton
                onClick={() =>
                  stakedAmount &&
                  setStakeType(
                    new TokenAmount(
                      stakedAmount.token,
                      JSBI.divide(JSBI.BigInt(stakedAmount.raw), JSBI.BigInt(4))
                    ).toExact()
                  )
                }
                width="20%"
              >
                25%
              </PercentButton>
              <PercentButton
                onClick={() => {
                  stakedAmount &&
                    setStakeType(
                      new TokenAmount(
                        stakedAmount.token,
                        JSBI.divide(JSBI.BigInt(stakedAmount.raw), JSBI.BigInt(2))
                      ).toExact()
                    )
                }}
                width="20%"
              >
                50%
              </PercentButton>
              <PercentButton
                onClick={() => {
                  stakedAmount &&
                    setStakeType(
                      new TokenAmount(
                        stakedAmount.token,
                        JSBI.divide(JSBI.multiply(JSBI.BigInt(stakedAmount.raw), JSBI.BigInt(75)), JSBI.BigInt(100))
                      ).toExact()
                    )
                }}
                width="20%"
              >
                75%
              </PercentButton>
              <PercentButton
                onClick={() => {
                  stakedAmount && setStakeType(stakedAmount?.toExact())
                }}
                width="20%"
              >
                Max
              </PercentButton>
            </RowBetween>
          </AutoColumn>
          <RowBetween mt={'30px'}>
            <ButtonError
              disabled={
                !stakeTypeAmount ||
                (stakedAmount &&
                  stakeTypeAmount &&
                  JSBI.lessThan(JSBI.BigInt(stakedAmount?.raw.toString()), JSBI.BigInt(stakeTypeAmount.raw.toString())))
              }
              error={
                stakedAmount &&
                stakeTypeAmount &&
                JSBI.lessThan(JSBI.BigInt(stakedAmount?.raw.toString()), JSBI.BigInt(stakeTypeAmount.raw.toString()))
              }
              onClick={unStakeCallback}
            >
              {!stakeTypeAmount
                ? 'Enter Amount'
                : stakedAmount &&
                  stakeTypeAmount &&
                  JSBI.lessThan(JSBI.BigInt(stakedAmount?.raw.toString()), JSBI.BigInt(stakeTypeAmount.raw.toString()))
                ? 'Insufficient Balance'
                : 'Unstake'}
            </ButtonError>
          </RowBetween>
        </LightCard>
        <LightCard flex={3}>
          <TotalApr address={stakingRewardAddress}></TotalApr>
          <BasePoolInfoCard pool={pool} />
        </LightCard>
      </AutoRowBetween>
    </PageWrapper>
  )
}
