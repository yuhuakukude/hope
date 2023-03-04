import { RouteComponentProps } from 'react-router-dom'
import { useStakingPool } from '../../hooks/useLPStaking'
import styled from 'styled-components'
import { TabItem, TabWrapper } from '../../components/Tab'
import { AutoColumn, GapColumn } from '../../components/Column'
import AppBody from '../AppBody'
import { TYPE } from '../../theme'
import { AutoRow, RowBetween } from '../../components/Row'
import QuestionHelper from '../../components/QuestionHelper'
import React, { useCallback, useState } from 'react'
import CurrencyLogo from '../../components/CurrencyLogo'
import { useTokenBalance } from '../../state/wallet/hooks'
import { useActiveWeb3React } from '../../hooks'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { CurrencyAmount, Pair, TokenAmount } from '@uniswap/sdk'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { useDerivedStakeInfo } from '../../state/stake/hooks'
import { ButtonError } from '../../components/Button'
import JSBI from 'jsbi'
import { calculateGasMargin } from '../../utils'
import { TransactionResponse } from '@ethersproject/providers'
import { getPermitData, Permit, PERMIT_EXPIRATION, toDeadline } from '../../permit2/domain'
import { ethers } from 'ethers'
import { PERMIT2_ADDRESS } from '../../constants'
import TransactionConfirmationModal, { TransactionErrorContent } from '../../components/TransactionConfirmationModal'
import { useStakingContract } from '../../hooks/useContract'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { StakeTabs } from '../../components/NavigationTabs'

const CustomTabWrapper = styled(TabWrapper)`
  width: auto;
  margin: 0 20px;
`
const CustomTab = styled(TabItem)`
  width: auto;
  flex: 1;
`
const PageWrapper = styled(GapColumn)`
  width: 100%;
  align-items: center;
  justify-content: center;
`

export default function LiquidityMining({
  match: {
    params: { stakingRewardAddress }
  }
}: RouteComponentProps<{ stakingRewardAddress?: string }>) {
  const { account, library, chainId } = useActiveWeb3React()
  const addTransaction = useTransactionAdder()
  const { result: pool } = useStakingPool(stakingRewardAddress ?? '')
  const [staking, setStaking] = useState(true)
  const [typedValue, setTypedValue] = useState('')
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [pendingText, setPendingText] = useState('')
  const [errorStatus, setErrorStatus] = useState<{ code: number; message: string } | undefined>()
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm
  const [txHash, setTxHash] = useState<string>('')
  const dummyPair = pool
    ? new Pair(new TokenAmount(pool.tokens[0], '0'), new TokenAmount(pool.tokens[1], '0'))
    : undefined

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback((typedValue: string) => {
    setTypedValue(typedValue)
  }, [])

  const balance = useTokenBalance(account ?? undefined, pool?.lpToken)
  const stakedAmount = useTokenBalance(account ?? undefined, pool?.stakingToken)

  const { parsedAmount, error } = useDerivedStakeInfo(typedValue, pool?.lpToken, staking ? balance : stakedAmount)

  const maxAmountInput = maxAmountSpend(staking ? balance : stakedAmount)
  const atMaxAmount = Boolean(maxAmountInput && parsedAmount?.equalTo(maxAmountInput))
  const handleMax = useCallback(() => {
    maxAmountInput && onUserInput(maxAmountInput.toExact())
  }, [maxAmountInput, onUserInput])

  const stakingContract = useStakingContract(stakingRewardAddress, true)

  const onTxStart = useCallback(() => {
    setShowConfirm(true)
    setAttemptingTxn(true)
  }, [])

  const onTxSubmitted = useCallback((hash: string | undefined) => {
    setShowConfirm(true)
    setPendingText(``)
    setAttemptingTxn(false)
    hash && setTxHash(hash)
  }, [])

  const onTxError = useCallback(error => {
    setShowConfirm(true)
    setTxHash('')
    setPendingText(``)
    setAttemptingTxn(false)
    setErrorStatus({ code: error?.code, message: error.message })
  }, [])

  const onStake = useCallback(
    async (amount: CurrencyAmount, NONCE, DEADLINE, sigVal) => {
      if (!account) throw new Error('none account')
      if (!stakingContract) throw new Error('none contract')
      if (amount.equalTo(JSBI.BigInt('0'))) throw new Error('amount is un support')
      const args = [amount?.raw.toString(), NONCE, DEADLINE, sigVal]
      const method = 'deposit'
      return stakingContract.estimateGas[method](...args, { from: account }).then(estimatedGasLimit => {
        return stakingContract[method](...args, {
          gasLimit: calculateGasMargin(estimatedGasLimit),
          // gasLimit: '3500000',
          from: account
        }).then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Stake ${amount.toSignificant()} ${pool?.lpToken.symbol}`
          })
          return response.hash
        })
      })
    },
    [account, addTransaction, pool, stakingContract]
  )

  const onUnstake = useCallback(
    async (amount: CurrencyAmount) => {
      if (!account) throw new Error('none account')
      if (!stakingContract) throw new Error('none contract')
      if (amount.equalTo(JSBI.BigInt('0'))) throw new Error('amount is un support')
      const args = [amount.raw.toString()]
      const method = 'withdraw'
      return stakingContract.estimateGas[method](...args, { from: account }).then(estimatedGasLimit => {
        return stakingContract[method](...args, {
          gasLimit: calculateGasMargin(estimatedGasLimit),
          // gasLimit: '3500000',
          from: account
        }).then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Unstake ${amount.toSignificant()} ${pool?.lpToken.symbol}`
          })
          return response.hash
        })
      })
    },
    [account, addTransaction, pool, stakingContract]
  )

  const onStakeCallback = useCallback(async () => {
    if (!account || !parsedAmount || !library || !chainId || !pool) return
    setPendingText(`Approve ${pool.lpToken.symbol}`)
    onTxStart()
    // sign
    const deadline = toDeadline(PERMIT_EXPIRATION)
    const nonce = ethers.utils.randomBytes(32)
    const permit: Permit = {
      permitted: {
        token: pool.lpToken.address,
        amount: parsedAmount.raw.toString()
      },
      nonce: nonce,
      spender: pool.stakingRewardAddress,
      deadline
    }
    const { domain, types, values } = getPermitData(permit, PERMIT2_ADDRESS[chainId ?? 1], chainId)
    library
      .getSigner(account)
      ._signTypedData(domain, types, values)
      .then(signature => {
        setPendingText(`Stake  ${parsedAmount.toSignificant()} ${pool.lpToken.symbol}`)
        onStake(parsedAmount, nonce, deadline, signature)
          .then(hash => {
            onTxSubmitted(hash)
          })
          .catch((error: any) => {
            onTxError(error)
            throw error
          })
      })
      .catch(error => {
        onTxError(error)
      })
  }, [account, parsedAmount, library, chainId, pool, onTxStart, onStake, onTxSubmitted, onTxError])

  const onUnstakeCallback = useCallback(async () => {
    if (!account || !parsedAmount || !library || !chainId || !pool) return
    setPendingText(`Unstake ${typedValue} ${pool.lpToken.symbol}`)
    onTxStart()
    // sign
    setPendingText(`Stake  ${parsedAmount.toSignificant()} ${pool.lpToken.symbol}`)
    onUnstake(parsedAmount)
      .then(hash => {
        onTxSubmitted(hash)
      })
      .catch((error: any) => {
        onTxError(error)
        throw error
      })
  }, [account, parsedAmount, library, chainId, pool, typedValue, onTxStart, onUnstake, onTxSubmitted, onTxError])

  return (
    <PageWrapper gap={'50px'}>
      <TransactionConfirmationModal
        isOpen={showConfirm}
        onDismiss={() => setShowConfirm(false)}
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
      <StakeTabs />
      <AppBody>
        <AutoColumn>
          <RowBetween padding={'30px 20px'}>
            <TYPE.white fontSize={18} fontWeight={700}>
              Liquidity Mining
            </TYPE.white>
            <QuestionHelper
              text={`About Deposit When you add liquidity, you will receive pool tokens representing your position. These tokens automatically earn fees proportional to your share of the pool, and can be redeemed at any time. By adding liquidity you'll earn 0.3% of all trades on this pair proportional to your share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.`}
            />
          </RowBetween>
          <CustomTabWrapper>
            <CustomTab onClick={() => setStaking(true)} isActive={staking}>
              Stake
            </CustomTab>
            <CustomTab
              onClick={() => {
                setStaking(false)
              }}
              isActive={!staking}
            >
              Unstake
            </CustomTab>
          </CustomTabWrapper>
          <AutoColumn style={{ padding: 20 }} gap={'20px'}>
            <AutoRow>
              <CurrencyLogo currency={pool?.tokens[0]} />
              <CurrencyLogo currency={pool?.tokens[1]} />
              <TYPE.white ml={20} fontWeight={700}>
                {pool?.tokens[0].symbol}/{pool?.tokens[1].symbol}
              </TYPE.white>
            </AutoRow>
            <RowBetween>
              <TYPE.main>Available</TYPE.main>
              <TYPE.white>
                {staking ? (balance ? balance.toFixed(4) : '--') : stakedAmount ? stakedAmount.toFixed(4) : '--'}
              </TYPE.white>
            </RowBetween>
            <RowBetween>
              <TYPE.main>Staked</TYPE.main>
              <TYPE.white>{stakedAmount ? stakedAmount.toFixed(4) : '--'}</TYPE.white>
            </RowBetween>
            <CurrencyInputPanel
              hideCurrency
              value={typedValue}
              onUserInput={onUserInput}
              onMax={handleMax}
              showMaxButton={!atMaxAmount}
              currency={staking ? pool?.lpToken : pool?.stakingToken}
              pair={dummyPair}
              label={'Amount'}
              disableCurrencySelect={true}
              customBalanceText={` `}
              id="stake-liquidity-token"
            />
            <ButtonError
              onClick={staking ? onStakeCallback : onUnstakeCallback}
              disabled={!!error && error !== 'Connect Wallet'}
              error={!!error && !!parsedAmount}
            >
              {error ?? `${staking ? 'Stake' : 'Unstake'}`}
            </ButtonError>
          </AutoColumn>
        </AutoColumn>
      </AppBody>
    </PageWrapper>
  )
}
