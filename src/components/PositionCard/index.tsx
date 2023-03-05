import { JSBI, Pair, Percent, Token, TokenAmount } from '@uniswap/sdk'
import { darken } from 'polished'
import React, { useCallback, useEffect, useState } from 'react'
import { Text } from 'rebass'
import styled from 'styled-components'
import { useTotalSupply } from '../../data/TotalSupply'

import { useActiveWeb3React } from '../../hooks'
import { useTokenBalance } from '../../state/wallet/hooks'
import { ExternalLink, TYPE } from '../../theme'
import { unwrappedToken } from '../../utils/wrappedCurrency'

import { useColor } from '../../hooks/useColor'

import Card, { LightCard } from '../Card'
import { AutoColumn } from '../Column'
import DoubleCurrencyLogo from '../DoubleLogo'
import { RowBetween, RowFixed, AutoRow } from '../Row'
import { calculateGasMargin, getEtherscanLink } from '../../utils'
import { usePair } from '../../data/Reserves'
import CurrencyLogo from '../CurrencyLogo'
import TitleTips, { TitleTipsProps } from '../../pages/Portfolio/component/SelectTips'
import { useHistory } from 'react-router-dom'
import ClaimRewardModal from '../earn/ClaimRewardModal'
import { TransactionResponse } from '@ethersproject/providers'
import { useLtMinterContract } from '../../hooks/useContract'
import { useTransactionAdder } from '../../state/transactions/hooks'
import TransactionConfirmationModal, { TransactionErrorContent } from '../TransactionConfirmationModal'

export const FixedHeightRow = styled(RowBetween)`
  height: 24px;
`

export const HoverCard = styled(Card)`
  border: 1px solid transparent;
  :hover {
    border: 1px solid ${({ theme }) => darken(0.06, theme.bg2)};
  }
`
const StyledPositionCard = styled(LightCard)<{ bgColor: any }>`
  background-color: transparent;
  border-radius: 0;
  border: none;
  position: relative;
  overflow: hidden;
  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.bg3};
  }
`

const ContentRow = styled(RowFixed)<{ weight?: number }>`
  flex: ${({ weight }) => (weight ? weight : 1)};
`

const DataRow = styled(AutoRow)`
  flex-wrap: nowrap;
  width: fit-content;
`

interface PositionCardProps {
  pair: Pair
  showUnwrapped?: boolean
  border?: string
  stakedBalance?: TokenAmount // optional balance to indicate that liquidity is deposited in mining pool
}

export function MinimalPositionCard({ pair, showUnwrapped = false, border }: PositionCardProps) {
  const { account } = useActiveWeb3React()

  const currency0 = showUnwrapped ? pair.token0 : unwrappedToken(pair.token0)
  const currency1 = showUnwrapped ? pair.token1 : unwrappedToken(pair.token1)

  const [showMore, setShowMore] = useState(false)

  const userPoolBalance = useTokenBalance(account ?? undefined, pair.liquidityToken)
  const totalPoolTokens = useTotalSupply(pair.liquidityToken)

  const poolTokenPercentage =
    !!userPoolBalance && !!totalPoolTokens && JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
      : undefined

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? [
          pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
          pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false)
        ]
      : [undefined, undefined]

  return (
    <>
      {userPoolBalance && JSBI.greaterThan(userPoolBalance.raw, JSBI.BigInt(0)) ? (
        <AutoColumn gap="12px">
          <FixedHeightRow>
            <RowFixed>
              <Text fontWeight={700} fontSize={16}>
                My position
              </Text>
            </RowFixed>
          </FixedHeightRow>
          <FixedHeightRow onClick={() => setShowMore(!showMore)}>
            <RowFixed>
              <DoubleCurrencyLogo currency0={currency0} currency1={currency1} margin={true} size={20} />
              <Text fontWeight={700}>
                {currency0.symbol}/{currency1.symbol}
              </Text>
            </RowFixed>
            <RowFixed>
              <Text fontWeight={700}>{userPoolBalance ? userPoolBalance.toSignificant(4) : '-'}</Text>
            </RowFixed>
          </FixedHeightRow>
          <AutoColumn gap="4px">
            <FixedHeightRow>
              <TYPE.main fontWeight={500}>Your pool share</TYPE.main>
              <Text fontWeight={500}>{poolTokenPercentage ? poolTokenPercentage.toFixed(6) + '%' : '-'}</Text>
            </FixedHeightRow>
            <FixedHeightRow>
              <TYPE.main fontWeight={500}>{currency0.symbol}</TYPE.main>
              {token0Deposited ? (
                <RowFixed>
                  <Text fontWeight={500} marginLeft={'6px'}>
                    {token0Deposited?.toSignificant(6)}
                  </Text>
                </RowFixed>
              ) : (
                '-'
              )}
            </FixedHeightRow>
            <FixedHeightRow>
              <TYPE.main fontWeight={500}>{currency1.symbol}</TYPE.main>
              {token1Deposited ? (
                <RowFixed>
                  <Text fontWeight={500} marginLeft={'6px'}>
                    {token1Deposited?.toSignificant(6)}
                  </Text>
                </RowFixed>
              ) : (
                '-'
              )}
            </FixedHeightRow>
          </AutoColumn>
        </AutoColumn>
      ) : (
        <></>
      )}
    </>
  )
}

interface FullCardProps {
  pairInfo: { liquidityToken: Token; tokens: [Token, Token] }
  showUnwrapped?: boolean
  border?: string
  stakedBalance?: TokenAmount // optional balance to indicate that liquidity is deposited in mining pool
  feeRate?: number
  futureBoots?: string
  currentBoots?: string
  reward?: TokenAmount | undefined
  stakingAddress?: string
}

export default function FullPositionCard({
  pairInfo,
  border,
  stakedBalance,
  feeRate,
  futureBoots,
  currentBoots,
  reward,
  stakingAddress
}: FullCardProps) {
  const { account, chainId, library } = useActiveWeb3React()
  const history = useHistory()
  const currency0 = unwrappedToken(pairInfo.tokens[0])
  const currency1 = unwrappedToken(pairInfo.tokens[1])

  const ltMinterContract = useLtMinterContract()
  const addTransaction = useTransactionAdder()

  const [showClaimModal, setShowClaimModal] = useState(false)
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [pendingText, setPendingText] = useState('')
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm
  const [txHash, setTxHash] = useState<string>('')
  const [errorStatus, setErrorStatus] = useState<{ code: number; message: string } | undefined>()

  const [, pair] = usePair(currency0, currency1)

  const [newFutureBoots, setNewFutureBoots] = useState<string | undefined>(undefined)

  const userDefaultPoolBalance = useTokenBalance(account ?? undefined, pairInfo.liquidityToken)
  const totalPoolTokens = useTotalSupply(pairInfo.liquidityToken)
  // if staked balance balance provided, add to standard liquidity amount
  const userPoolBalance = stakedBalance ? userDefaultPoolBalance?.add(stakedBalance) : userDefaultPoolBalance
  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? [
          pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
          pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false)
        ]
      : [undefined, undefined]

  const backgroundColor = useColor(pair?.token0)

  const actions: TitleTipsProps[] = [
    {
      label: 'Manage Positions',
      value: 'Manage Positions',
      onClick: data => {
        history.push(`/swap/liquidity/manager/${pairInfo.tokens[0].address}/${pairInfo.tokens[1].address}`)
      }
    },
    {
      label: 'Yield Boost',
      value: 'Yield Boost',
      hide: !stakingAddress,
      onClick: data => {
        history.push(`/swap/liquidity/mining/${stakingAddress}`)
      }
    },
    {
      label: 'Claim Rewards',
      value: 'Claim Rewards',
      hide: !reward || !reward.greaterThan('0'),
      onClick: data => {
        setShowClaimModal(true)
      }
    },
    {
      label: 'Pool Details',
      value: 'Pool Details',
      onClick: data => {
        history.push(`/swap/liquidity/pool-detail/${pairInfo.liquidityToken.address}`)
      }
    }
  ]

  useEffect(() => {
    futureBoots && futureBoots !== '-' && setNewFutureBoots(futureBoots)
  }, [futureBoots])

  const onClaim = useCallback(async () => {
    if (!account) throw new Error('none account')
    if (!ltMinterContract) throw new Error('none contract')
    const method = 'mint'
    const args = [stakingAddress]
    return ltMinterContract.estimateGas[method](...args, { from: account }).then(estimatedGasLimit => {
      return ltMinterContract[method](...args, {
        gasLimit: calculateGasMargin(estimatedGasLimit),
        // gasLimit: '3500000',
        from: account
      }).then((response: TransactionResponse) => {
        addTransaction(response, {
          summary: `Claim ${reward?.toSignificant(6)} LT`
        })
        return response.hash
      })
    })
  }, [account, addTransaction, ltMinterContract, reward, stakingAddress])

  const onTxStart = useCallback(() => {
    setShowConfirm(true)
    setAttemptingTxn(true)
  }, [])

  const onTxSubmitted = useCallback((hash: string | undefined) => {
    setShowConfirm(true)
    setPendingText(``)
    setAttemptingTxn(false)
    setShowClaimModal(false)
    hash && setTxHash(hash)
  }, [])

  const onTxError = useCallback(error => {
    setShowConfirm(true)
    setTxHash('')
    setPendingText(``)
    setAttemptingTxn(false)
    setErrorStatus({ code: error?.code, message: error.message })
  }, [])

  const onClaimCallback = useCallback(async () => {
    if (!account || !library || !chainId || !reward) return
    setPendingText(`Claim ${reward?.toSignificant(6)} LT`)
    onTxStart()
    // sign
    onClaim()
      .then(hash => {
        onTxSubmitted(hash)
      })
      .catch((error: any) => {
        onTxError(error)
        throw error
      })
  }, [account, library, chainId, reward, onTxStart, onClaim, onTxSubmitted, onTxError])

  const confirmationContent = useCallback(() => {
    return (
      errorStatus && (
        <TransactionErrorContent
          errorCode={errorStatus.code}
          onDismiss={() => setShowConfirm(false)}
          message={errorStatus.message}
        />
      )
    )
  }, [errorStatus])

  return (
    <StyledPositionCard border={border} bgColor={backgroundColor}>
      {stakingAddress && (
        <ClaimRewardModal
          isOpen={showClaimModal}
          onDismiss={() => setShowClaimModal(false)}
          onClaim={onClaimCallback}
          stakingAddress={stakingAddress}
        />
      )}
      <TransactionConfirmationModal
        isOpen={showConfirm}
        onDismiss={() => setShowConfirm(false)}
        attemptingTxn={attemptingTxn}
        hash={txHash}
        content={confirmationContent}
        pendingText={pendingText}
      />
      <AutoRow>
        <ContentRow>
          <AutoColumn gap={'12px'}>
            <AutoRow>
              <DoubleCurrencyLogo margin currency0={currency0} currency1={currency1} size={24} />
              <TYPE.link
                as={ExternalLink}
                href={getEtherscanLink(chainId ?? 1, pairInfo.liquidityToken.address, 'address')}
                ml={10}
                fontWeight={500}
                fontSize={20}
              >
                {currency0 && currency1 ? (
                  <TYPE.white>{`${currency0.symbol} / ${currency1.symbol}`}</TYPE.white>
                ) : (
                  '-/-'
                )}
              </TYPE.link>
            </AutoRow>
            <AutoRow>
              <TYPE.main>Fee Rate: {feeRate ? `${feeRate * 100}%` : '--'}</TYPE.main>
            </AutoRow>
          </AutoColumn>
        </ContentRow>
        <ContentRow>
          <AutoColumn gap={'12px'}>
            <DataRow gap={'8px'}>
              <CurrencyLogo size={'16px'} currency={currency0} />
              <TYPE.white>{`${token0Deposited ? token0Deposited?.toSignificant(4) : '--'}`}</TYPE.white>
            </DataRow>
            <DataRow gap={'8px'}>
              <CurrencyLogo size={'16px'} currency={currency1} />
              <TYPE.white>{`${token1Deposited ? token1Deposited?.toSignificant(4) : '--'}`}</TYPE.white>
            </DataRow>
          </AutoColumn>
        </ContentRow>
        <ContentRow>
          <AutoColumn gap={'12px'}>
            <DataRow gap={'8px'}>
              <TYPE.white>{userPoolBalance ? userPoolBalance.toSignificant(4) : '--'} </TYPE.white>
            </DataRow>
            <DataRow gap={'8px'}>
              <TYPE.main>{stakedBalance ? `${stakedBalance.toSignificant(6)} %Staked` : '--'}</TYPE.main>
            </DataRow>
          </AutoColumn>
        </ContentRow>
        <ContentRow>
          <AutoColumn gap={'10px'}>
            <AutoRow>
              <TYPE.main>Current:&nbsp;</TYPE.main>
              <TYPE.white>{currentBoots}</TYPE.white>
            </AutoRow>
            <AutoRow>
              <TYPE.main>Future:&nbsp;&nbsp;</TYPE.main>
              <TYPE.white>{newFutureBoots}</TYPE.white>
            </AutoRow>
          </AutoColumn>
        </ContentRow>
        <ContentRow>--</ContentRow>
        <ContentRow>
          <AutoColumn gap={'10px'}>
            <TYPE.white>{reward ? reward.toFixed(4) : '--'}</TYPE.white>
            <TYPE.main>≈ $</TYPE.main>
          </AutoColumn>
        </ContentRow>

        <ContentRow weight={0.5}>
          <TitleTips options={actions} label={'More'} />
        </ContentRow>
      </AutoRow>
    </StyledPositionCard>
  )
}
