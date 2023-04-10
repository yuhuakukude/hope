import React, { useCallback, useMemo, useState } from 'react'
import Modal from '../Modal'
import { AutoColumn } from '../Column'
import styled from 'styled-components'
import { AutoRow, RowBetween, RowFixed } from '../Row'
import { TYPE, CloseIcon } from '../../theme'
import { ButtonError } from '../Button'
import { useLtMinterContract, useStakingContract } from '../../hooks/useContract'
import { useActiveWeb3React } from '../../hooks'
import { useSingleCallResult, useSingleContractMultipleData } from '../../state/multicall/hooks'
import { TokenAmount } from '@uniswap/sdk'
import CurrencyLogo from '../CurrencyLogo'
import { GreyCard } from '../Card'
import { useTokenPriceObject } from '../../hooks/liquidity/useBasePairs'
import { amountFormat, formatMessage } from '../../utils/format'
import { useToken } from '../../hooks/Tokens'
import { Radio } from 'antd'
import { calculateGasMargin } from '../../utils'
import { TransactionResponse } from '@ethersproject/providers'
import { useTransactionAdder } from '../../state/transactions/hooks'
import TransactionConfirmationModal, { TransactionErrorContent } from '../TransactionConfirmationModal'
import { getLTToken, getLTTokenAddress } from 'utils/addressHelpers'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
`

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
  stakingAddress: string
}

enum Reward {
  LT = 'claimReward',
  ALL = 'claimRewards'
}

export default function ClaimRewardModal({ isOpen, onDismiss, stakingAddress }: StakingModalProps) {
  const { account, chainId, library } = useActiveWeb3React()
  const [claimType, setClaimType] = useState<Reward | undefined>(Reward.LT)
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [pendingText, setPendingText] = useState('')
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm
  const [txHash, setTxHash] = useState<string>('')
  const [errorStatus, setErrorStatus] = useState<{ code: number; message: string } | undefined>()
  const stakingContract = useStakingContract(stakingAddress)
  const ltMinterContract = useLtMinterContract()
  const addTransaction = useTransactionAdder()

  const earnedRes = useSingleCallResult(stakingContract, 'claimableTokens', [account ?? undefined])
  const earnedAmount = earnedRes?.result?.[0] ? new TokenAmount(getLTToken(chainId), earnedRes?.result?.[0]) : undefined
  const ltRewards = useSingleCallResult(stakingContract, 'claimableReward', [
    account ?? undefined,
    getLTTokenAddress(chainId)
  ])
  const ltRewardsAmount = ltRewards?.result?.[0]
    ? new TokenAmount(getLTToken(chainId), ltRewards?.result?.[0])
    : undefined
  const totalRewards = ltRewardsAmount && earnedAmount ? earnedAmount.add(ltRewardsAmount) : undefined
  const contract = claimType === Reward.LT ? ltMinterContract : stakingContract
  const method = claimType === Reward.LT ? 'mint' : 'claimRewards'
  const rewardSummary = `Claim rewards`

  const count = useSingleCallResult(stakingContract, 'rewardCount')?.result?.[0]

  const addressArgs =
    count && count > 0 ? Array.from(new Array(Number(count.toString())).keys()).map(value => [value]) : []
  const tokenAddress = useSingleContractMultipleData(stakingContract, 'rewardTokens', addressArgs)
  const rewardArgs = useMemo(() => {
    return tokenAddress.map(token => [account, token?.result?.[0]])
  }, [account, tokenAddress])
  const rewards = useSingleContractMultipleData(
    account && tokenAddress[0]?.result ? stakingContract : undefined,
    'claimableReward',
    rewardArgs
  )

  const ltAddress = useMemo(() => [getLTTokenAddress(chainId).toLowerCase()], [chainId])
  const { result: priceResult } = useTokenPriceObject(ltAddress)

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
    setErrorStatus({ code: error?.code, message: formatMessage(error) ?? error.message })
  }, [])

  const onClaim = useCallback(async () => {
    if (!account) throw new Error('none account')
    if (!contract) throw new Error('none contract')
    const args = claimType === Reward.LT ? [stakingAddress] : []
    return contract.estimateGas[method](...args, { from: account }).then(estimatedGasLimit => {
      return contract[method](...args, {
        gasLimit: calculateGasMargin(estimatedGasLimit),
        // gasLimit: '3500000',
        from: account
      }).then((response: TransactionResponse) => {
        addTransaction(response, {
          summary: rewardSummary
        })
        return response.hash
      })
    })
  }, [account, addTransaction, claimType, contract, method, rewardSummary, stakingAddress])

  const onClaimCallback = useCallback(async () => {
    if (!account || !library || !chainId) return
    setPendingText(rewardSummary)
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
  }, [account, library, chainId, rewardSummary, onTxStart, onClaim, onTxSubmitted, onTxError])

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

  const onDismissFn = () => {
    setShowConfirm(false)
    onDismiss()
  }

  return (
    <Modal width={420} maxWidth={420} isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
      <ContentWrapper>
        <TransactionConfirmationModal
          isOpen={showConfirm}
          onDismiss={() => onDismissFn()}
          attemptingTxn={attemptingTxn}
          hash={txHash}
          content={confirmationContent}
          pendingText={pendingText}
        />
        <RowBetween p={'20px 24px'}>
          <TYPE.mediumHeader>Rewards Claim</TYPE.mediumHeader>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        <Radio.Group value={claimType} onChange={e => setClaimType(e.target.value)} defaultValue={Reward.LT}>
          <AutoColumn style={{ padding: '0 20px 20px  20px' }} gap={'20px'}>
            <AutoColumn gap={'lg'}>
              <RowBetween>
                <TYPE.main color={'text2'}>Total claimable Rewards</TYPE.main>
                <RowFixed>
                  <TYPE.white ml={'8px'} mr={'8px'} fontWeight={500}>
                    {totalRewards?.toFixed(2, { groupSeparator: ',' }) ?? '0'}
                  </TYPE.white>
                  <TYPE.white alignSelf={'end'}>LT</TYPE.white>
                </RowFixed>
              </RowBetween>
              <GreyCard
                className={claimType === Reward.LT ? 'border-primary' : ''}
                onClick={() => {
                  setClaimType(Reward.LT)
                }}
                padding={'0'}
                borderRadius={'10px'}
              >
                <AutoRow padding={'16px'} height={48} style={{ borderBottom: '1px solid #494949' }}>
                  <Radio value={Reward.LT} />
                  <TYPE.main ml={'8px'}>Mining Rewards</TYPE.main>
                </AutoRow>
                <RowBetween padding={'16px'} height={48}>
                  <RowFixed>
                    <CurrencyLogo size={'16px'} currency={getLTToken(chainId)} />
                    <TYPE.white ml={'8px'}>{earnedAmount?.toFixed(2, { groupSeparator: ',' }) ?? '--'} LT</TYPE.white>
                  </RowFixed>
                  <TYPE.white>
                    {priceResult
                      ? `≈$${amountFormat(
                          Number(earnedAmount?.toExact().toString()) * Number(priceResult[ltAddress[0]]),
                          2
                        )}`
                      : ''}
                  </TYPE.white>
                </RowBetween>
              </GreyCard>
              {rewards.length > 0 && (
                <GreyCard
                  className={claimType === Reward.ALL ? 'border-primary' : ''}
                  onClick={() => {
                    setClaimType(Reward.ALL)
                  }}
                  padding={'0'}
                  borderRadius={'10px'}
                >
                  <AutoRow padding={'16px'} height={48} style={{ borderBottom: '1px solid #494949' }}>
                    <Radio value={Reward.ALL} />
                    <TYPE.main ml={'8px'}>Other Rewards</TYPE.main>
                  </AutoRow>
                  {rewards
                    .filter(reward => {
                      return reward?.result?.[0]
                    })
                    .map((reward, index) => {
                      return (
                        <RewardCard
                          key={index}
                          address={tokenAddress[index].result?.[0]}
                          reward={reward.result?.[0].toString()}
                        />
                      )
                    })}
                </GreyCard>
              )}
            </AutoColumn>
            <ButtonError
              height={56}
              disabled={(Number(earnedAmount?.toExact().toString()) <= 0 && claimType === Reward.LT) || !claimType}
              onClick={onClaimCallback}
            >
              {'Claim'}
            </ButtonError>
          </AutoColumn>
        </Radio.Group>
      </ContentWrapper>
    </Modal>
  )
}

function RewardCard({ address, reward }: { address: string; reward: string }) {
  const token = useToken(address)
  const rewardAmount = token ? new TokenAmount(token, reward) : undefined
  const addresses = useMemo(() => {
    return [address.toLowerCase()]
  }, [address])
  const { result: priceResult } = useTokenPriceObject(addresses)

  return (
    <RowBetween padding={'16px'} height={48}>
      <RowFixed>
        <CurrencyLogo size={'16px'} currency={token ?? undefined} />
        <TYPE.white ml={'8px'}>
          {rewardAmount?.toFixed(2, { groupSeparator: ',' }) ?? '--'} {token?.symbol}
        </TYPE.white>
      </RowFixed>
      <TYPE.white>
        {priceResult
          ? `≈$${amountFormat(Number(rewardAmount?.toExact().toString()) * Number(priceResult[addresses[0]]), 2)}`
          : '$--'}
      </TYPE.white>
    </RowBetween>
  )
}
