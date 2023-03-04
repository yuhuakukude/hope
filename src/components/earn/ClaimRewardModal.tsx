import React from 'react'
import Modal from '../Modal'
import { AutoColumn } from '../Column'
import styled from 'styled-components'
import { AutoRow, RowBetween, RowFixed } from '../Row'
import { TYPE, CloseIcon } from '../../theme'
import { ButtonError } from '../Button'
import { PoolInfo } from '../../state/stake/hooks'
import { useStakingContract } from '../../hooks/useContract'
import { useActiveWeb3React } from '../../hooks'
import { useSingleCallResult } from '../../state/multicall/hooks'
import { TokenAmount } from '@uniswap/sdk'
import { LT } from '../../constants'
import CurrencyLogo from '../CurrencyLogo'
import { GreyCard } from '../Card'
import { CheckCircle } from 'react-feather'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
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

  const totalRes = useSingleCallResult(stakingContract, 'integrateFraction', [account ?? undefined])
  const totalRewardAmount = totalRes?.result?.[0] ? new TokenAmount(LT[chainId ?? 1], totalRes?.result?.[0]) : undefined

  return (
    <Modal width={420} maxWidth={420} isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
      <ContentWrapper gap="lg">
        <RowBetween p={'20px 24px'}>
          <TYPE.mediumHeader>Rewards Claim</TYPE.mediumHeader>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        <AutoColumn style={{ padding: 20 }} gap={'20px'}>
          <AutoColumn gap={'lg'}>
            <RowBetween>
              <TYPE.main color={'text2'}>Total Rewards</TYPE.main>
              <RowFixed>
                <TYPE.white ml={'8px'} mr={'8px'} fontWeight={500}>
                  {totalRewardAmount?.toFixed(2, { groupSeparator: ',' }) ?? '0'}
                </TYPE.white>
                <TYPE.white alignSelf={'end'}>LT</TYPE.white>
              </RowFixed>
            </RowBetween>
            <GreyCard padding={'0'} borderRadius={'10px'}>
              <AutoRow padding={'16px'} height={48} style={{ borderBottom: '1px solid #494949' }}>
                <CheckCircle size={16} />
                <TYPE.main ml={8}>Mining Rewards</TYPE.main>
              </AutoRow>
              <RowBetween padding={'16px'} height={48}>
                <RowFixed>
                  <CurrencyLogo size={'16px'} currency={LT[chainId ?? 1]} />
                  <TYPE.white ml={'8px'}>{earnedAmount?.toFixed(2, { groupSeparator: ',' }) ?? '--'}LT</TYPE.white>
                </RowFixed>
                <TYPE.white>$</TYPE.white>
              </RowBetween>
            </GreyCard>
          </AutoColumn>
          <ButtonError disabled={!earnedAmount} onClick={onClaim}>
            {'Claim'}
          </ButtonError>
        </AutoColumn>
      </ContentWrapper>
    </Modal>
  )
}
