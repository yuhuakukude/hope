import React from 'react'
import Modal from '../Modal'
import { AutoColumn } from '../Column'
import styled from 'styled-components'
import { RowBetween, RowFixed } from '../Row'
import { TYPE, CloseIcon } from '../../theme'
import { ButtonError } from '../Button'
import { PoolInfo } from '../../state/stake/hooks'
import { useStakingContract } from '../../hooks/useContract'
import { useActiveWeb3React } from '../../hooks'
import { useSingleCallResult } from '../../state/multicall/hooks'
import { TokenAmount } from '@uniswap/sdk'
import { LT } from '../../constants'
import CurrencyLogo from '../CurrencyLogo'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 2rem;
`

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
  onClaim: () => void
  stakingInfo: PoolInfo
}

export default function ClaimRewardModal({ isOpen, onDismiss, stakingInfo, onClaim }: StakingModalProps) {
  const { account, chainId } = useActiveWeb3React()

  const stakingContract = useStakingContract(stakingInfo.stakingRewardAddress)

  const earnedRes = useSingleCallResult(stakingContract, 'claimableTokens', [account ?? undefined])
  const earnedAmount = earnedRes?.result?.[0] ? new TokenAmount(LT[chainId ?? 1], earnedRes?.result?.[0]) : undefined

  const claimedRes = useSingleCallResult(stakingContract, 'rewardsReceiver', [account ?? undefined])
  const totalRewardAmount = claimedRes?.result?.[0]
    ? new TokenAmount(LT[chainId ?? 1], claimedRes?.result?.[0])
    : undefined

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
      <ContentWrapper gap="lg">
        <RowBetween>
          <TYPE.mediumHeader>LT Rewards Claim</TYPE.mediumHeader>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        <AutoColumn gap={'lg'}>
          <AutoColumn gap={'md'}>
            <TYPE.gray color={'text2'} fontSize={18}>
              Total Rewards
            </TYPE.gray>
            <RowFixed>
              <CurrencyLogo currency={stakingInfo.lpToken} />
              <TYPE.white ml={'8px'} mr={'8px'} fontSize={20} fontWeight={500}>
                {totalRewardAmount?.toFixed(2, { groupSeparator: ',' }) ?? '0'}
              </TYPE.white>
              <TYPE.gray alignSelf={'end'}>LT</TYPE.gray>
            </RowFixed>
          </AutoColumn>
          <AutoColumn gap={'md'}>
            <TYPE.gray color={'text2'} fontSize={18}>
              Claimable Rewards
            </TYPE.gray>
            <RowFixed>
              <CurrencyLogo currency={stakingInfo.lpToken} />
              <TYPE.white ml={'8px'} mr={'8px'} fontSize={20} fontWeight={500}>
                {earnedAmount?.toFixed(2, { groupSeparator: ',' }) ?? '0'}
              </TYPE.white>
              <TYPE.gray alignSelf={'end'}>LT</TYPE.gray>
            </RowFixed>
          </AutoColumn>
        </AutoColumn>
        <ButtonError disabled={!earnedAmount} onClick={onClaim}>
          {'Submit'}
        </ButtonError>
      </ContentWrapper>
    </Modal>
  )
}
