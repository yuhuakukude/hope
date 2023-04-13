import { Link, RouteComponentProps, useHistory, useLocation } from 'react-router-dom'
import { useStakingPool } from '../../hooks/useLPStaking'
import styled from 'styled-components'
import { AutoColumn, GapColumn } from '../../components/Column'
import AppBody from '../AppBody'
import { TYPE } from '../../theme'
import Row, { AutoRow, RowBetween } from '../../components/Row'
import React, { useCallback, useMemo, useState } from 'react'
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
import TransactionConfirmationModal, { TransactionErrorContent } from '../../components/TransactionConfirmationModal'
import { useStakingContract } from '../../hooks/useContract'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { StakeTabs } from '../../components/NavigationTabs'
import { StakingTips } from '../LiquidityManager/component/Tips'
import Loader from '../../components/Loader'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import noData from '../../assets/images/no_data.png'
import { formatMessage } from '../../utils/format'
import { getPermit2Address } from 'utils/addressHelpers'
import ActionButton from 'components/Button/ActionButton'

const CustomTabWrapper = styled(Row)<{ flexW?: number; left: number }>`
  padding: 2px;
  width: fit-content;
  background-color: #1b1b1f;
  border-radius: 8px;
  position: relative;
  margin: 0 20px;
  width: auto;
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: ${({ left }) => (left ? `${left}%` : '0')};
    height: 100%;
    width: ${({ flexW }) => (flexW ? `${flexW}%` : '50%')};
    border-radius: 8px;
    background-color: #3d3e46;
    box-sizing: border-box;
    transition: all ease 0.25s;
    border: 2px solid #1b1b1f;
  }
`
const CustomTab = styled.div<{ isActive?: boolean }>`
  color: ${({ isActive, theme }) => (isActive ? theme.text1 : '#a8a8aa')};
  width: 50%;
  height: 38px;
  border-radius: 8px;
  font-size: 14px;
  font-family: Arboria-Medium;
  cursor: pointer;
  user-select: none;
  position: relative;
  z-index: 2;
  // background: ${({ isActive, theme }) => (isActive ? theme.bg3 : theme.bg5)};
  text-align: center;
  line-height: 38px;

  &:hover {
    color: ${({ theme }) => theme.text1};
  }
`
const PageWrapper = styled(GapColumn)`
  width: 100%;
  align-items: center;
  justify-content: center;
`

const NoData = styled.img`
  width: 60px;
`

export default function LiquidityMining({
  match: {
    params: { stakingRewardAddress }
  }
}: RouteComponentProps<{ stakingRewardAddress?: string }>) {
  const { account, library, chainId } = useActiveWeb3React()
  const location = useLocation()
  const addTransaction = useTransactionAdder()
  const history = useHistory()
  const { result: pool } = useStakingPool(stakingRewardAddress ?? '')
  const [staking, setStaking] = useState(!location.search.includes('type=unstake'))
  const [typedValue, setTypedValue] = useState('')
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [pendingText, setPendingText] = useState('')
  const [errorStatus, setErrorStatus] = useState<{ code: number; message: string } | undefined>()
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm
  const [txHash, setTxHash] = useState<string>('')
  const dummyPair = pool
    ? new Pair(new TokenAmount(pool.tokens[0], '0'), new TokenAmount(pool.tokens[1], '0'))
    : undefined
  const permit2Address = useMemo(() => getPermit2Address(chainId), [chainId])
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

  const [approvalState, approveCallback] = useApproveCallback(staking ? parsedAmount : undefined, permit2Address)

  const stakingContract = useStakingContract(stakingRewardAddress, true)

  const onTxStart = useCallback(() => {
    setShowConfirm(true)
    setAttemptingTxn(true)
  }, [])

  const onTxSubmitted = useCallback((hash: string | undefined) => {
    setShowConfirm(true)
    setPendingText(``)
    setTypedValue('')
    setAttemptingTxn(false)
    hash && setTxHash(hash)
  }, [])

  const onTxError = useCallback(error => {
    setShowConfirm(true)
    setTxHash('')
    setPendingText(``)
    setAttemptingTxn(false)
    setErrorStatus({ code: error?.code, message: formatMessage(error) ?? error.message })
  }, [])

  const [approvePendingText, setApprovePendingText] = useState('')
  const onApprove = useCallback(() => {
    onTxStart()
    setApprovePendingText(`Approve ${pool?.lpToken.symbol}`)
    approveCallback()
      .then((response: TransactionResponse | undefined) => {
        onTxSubmitted(response?.hash)
      })
      .catch(error => {
        onTxError(error)
      })
      .finally(() => {
        setApprovePendingText('')
      })
  }, [approveCallback, onTxError, onTxStart, onTxSubmitted, pool, setApprovePendingText])

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
            summary: `Stake ${amount.toFixed(4, { groupSeparator: ',' })} ${pool?.lpToken.symbol}`
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
            summary: `Unstake ${amount.toFixed(4, { groupSeparator: ',' })} ${pool?.lpToken.symbol}`
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
    const { domain, types, values } = getPermitData(permit, permit2Address, chainId)
    library
      .getSigner(account)
      ._signTypedData(domain, types, values)
      .then(signature => {
        setPendingText(`Stake  ${parsedAmount.toFixed(4, { groupSeparator: ',' })} ${pool.lpToken.symbol}`)
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
  }, [account, parsedAmount, library, chainId, pool, permit2Address, onTxStart, onStake, onTxSubmitted, onTxError])

  const onUnstakeCallback = useCallback(async () => {
    if (!account || !parsedAmount || !library || !chainId || !pool) return
    setPendingText(`Unstake ${typedValue} ${pool.lpToken.symbol}`)
    onTxStart()
    onUnstake(parsedAmount)
      .then(hash => {
        onTxSubmitted(hash)
      })
      .catch((error: any) => {
        onTxError(error)
        throw error
      })
  }, [account, parsedAmount, library, chainId, pool, typedValue, onTxStart, onUnstake, onTxSubmitted, onTxError])

  function NoLiquidityView() {
    return (
      <AutoColumn justify={'center'} gap={'24px'} style={{ padding: 60 }}>
        <NoData src={noData} />
        <TYPE.white maxWidth={227} textAlign={'center'}>
          {staking
            ? 'Sorry, you have not yet deposited any liquidity.'
            : 'Sorry, you have not yet deposited any liquidity.'}
        </TYPE.white>
        {staking && (
          <TYPE.link
            mt={4}
            onClick={() =>
              history.push(`/swap/liquidity/manager/deposit/${pool?.tokens[0].address}/${pool?.tokens[1].address}`)
            }
            as={Link}
            m={'auto'}
          >
            Become a Liquidity Provider
          </TYPE.link>
        )}
      </AutoColumn>
    )
  }
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
              Liquidity Farming
            </TYPE.white>
            <StakingTips />
          </RowBetween>
          <CustomTabWrapper left={staking ? 0 : 50}>
            <CustomTab
              onClick={() => {
                setTypedValue('')
                setStaking(true)
              }}
              isActive={staking}
            >
              Stake
            </CustomTab>
            <CustomTab
              onClick={() => {
                setTypedValue('')
                setStaking(false)
              }}
              isActive={!staking}
            >
              Unstake
            </CustomTab>
          </CustomTabWrapper>
          {(staking && balance && balance.greaterThan(JSBI.BigInt(0))) ||
          (!staking && stakedAmount && stakedAmount.greaterThan(JSBI.BigInt(0))) ? (
            <AutoColumn gap={'20px'} style={{ padding: 20 }}>
              <AutoRow>
                <CurrencyLogo currency={pool?.tokens[0]} />
                <CurrencyLogo currency={pool?.tokens[1]} />
                <TYPE.white ml={20} fontWeight={700}>
                  {pool?.tokens[0].symbol}/{pool?.tokens[1].symbol}
                </TYPE.white>
              </AutoRow>
              <RowBetween>
                <TYPE.main>Staked</TYPE.main>
                <TYPE.white>{stakedAmount ? stakedAmount.toFixed(4, { groupSeparator: ',' }) : '--'}</TYPE.white>
              </RowBetween>
              <CurrencyInputPanel
                hideCurrency
                value={typedValue}
                onUserInput={onUserInput}
                onMax={handleMax}
                isError={error === 'Insufficient Liquidity'}
                showMaxButton={!atMaxAmount}
                currency={staking ? pool?.lpToken : pool?.stakingToken}
                pair={dummyPair}
                label={staking ? 'Available for Staking' : 'Available for Unstaking'}
                disableCurrencySelect={true}
                customBalanceText={` `}
                id="stake-liquidity-token"
              />
              {(approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING) && (
                <ActionButton
                  pendingText={approvePendingText}
                  actionText={`${`Approve ${pool?.lpToken.symbol}`}`}
                  pending={!!approvePendingText || approvalState === ApprovalState.PENDING}
                  onAction={onApprove}
                />
              )}
              <ButtonError
                onClick={staking ? onStakeCallback : onUnstakeCallback}
                disabled={
                  (!!error && error !== 'Connect Wallet') ||
                  !!pendingText ||
                  !!approvePendingText ||
                  approvalState === ApprovalState.PENDING ||
                  approvalState === ApprovalState.NOT_APPROVED
                }
                error={!!error && !!parsedAmount}
              >
                {pendingText ? (
                  <AutoRow gap="6px" justify="center">
                    Confirm in your wallet
                    <Loader stroke="white" />
                  </AutoRow>
                ) : (
                  error ?? `${staking ? 'Stake' : 'Unstake'}`
                )}
              </ButtonError>
            </AutoColumn>
          ) : (
            <NoLiquidityView />
          )}
        </AutoColumn>
      </AppBody>
    </PageWrapper>
  )
}
