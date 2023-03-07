import React, { useMemo } from 'react'
import Modal from '../Modal'
import { AutoColumn } from '../Column'
import styled from 'styled-components'
import { AutoRow, RowBetween, RowFixed } from '../Row'
import { TYPE, CloseIcon } from '../../theme'
import { ButtonError } from '../Button'
import { useStakingContract } from '../../hooks/useContract'
import { useActiveWeb3React } from '../../hooks'
import { useSingleCallResult, useSingleContractMultipleData } from '../../state/multicall/hooks'
import { TokenAmount } from '@uniswap/sdk'
import { LT } from '../../constants'
import CurrencyLogo from '../CurrencyLogo'
import { GreyCard } from '../Card'
import { CheckCircle } from 'react-feather'
import { useTokenPriceObject } from '../../hooks/liquidity/useBasePairs'
import { amountFormat } from '../../utils/format'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
`

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
  onClaim: () => void
  stakingAddress: string
}

export default function ClaimRewardModal({ isOpen, onDismiss, stakingAddress, onClaim }: StakingModalProps) {
  const { account, chainId } = useActiveWeb3React()

  const stakingContract = useStakingContract(stakingAddress)

  const earnedRes = useSingleCallResult(stakingContract, 'claimableTokens', [account ?? undefined])
  const earnedAmount = earnedRes?.result?.[0] ? new TokenAmount(LT[chainId ?? 1], earnedRes?.result?.[0]) : undefined

  const totalRes = useSingleCallResult(stakingContract, 'integrateFraction', [account ?? undefined])
  const totalRewardAmount = totalRes?.result?.[0] ? new TokenAmount(LT[chainId ?? 1], totalRes?.result?.[0]) : undefined

  const count = useSingleCallResult(stakingContract, 'rewardCount')?.result?.[0]
  const tokenAddress = useSingleContractMultipleData(
    stakingContract,
    'rewardTokens',
    count ? [Array.from(new Array(count ?? 1).keys())] : []
  )
  console.log('tag-->', tokenAddress)

  // const rewardArgs = useMemo(() => {
  //   return tokenAddress.map(token =>
  //     account && token.result?.[0] ? [account, token.result?.[0]] : [undefined, undefined]
  //   )
  // }, [account, tokenAddress])
  // const rewards = useSingleContractMultipleData(stakingContract, 'claimableReward', [rewardArgs])
  // console.log('rewards', rewards)
  const ltAddress = useMemo(() => {
    return [LT[chainId ?? 1].address.toString()]
  }, [chainId])
  const { result: priceResult } = useTokenPriceObject(ltAddress)

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
                <TYPE.main ml={'8px'}>Mining Rewards</TYPE.main>
              </AutoRow>
              <RowBetween padding={'16px'} height={48}>
                <RowFixed>
                  <CurrencyLogo size={'16px'} currency={LT[chainId ?? 1]} />
                  <TYPE.white ml={'8px'}>{earnedAmount?.toFixed(2, { groupSeparator: ',' }) ?? '--'}LT</TYPE.white>
                </RowFixed>
                <TYPE.white>
                  {priceResult
                    ? `$${amountFormat(Number(earnedAmount?.toExact().toString()) * Number(priceResult[ltAddress[0]]))}`
                    : '$--'}
                </TYPE.white>
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
