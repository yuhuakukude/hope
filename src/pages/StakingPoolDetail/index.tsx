import React from 'react'
import { Link, RouteComponentProps } from 'react-router-dom'
import { useStakingPool } from '../../hooks/useLPStaking'
import { AutoRow, AutoRowBetween, RowBetween } from '../../components/Row'
import { AutoColumn } from '../../components/Column'
import CurrencyLogo from '../../components/CurrencyLogo'
import { TYPE } from '../../theme'
import { LightCard } from '../../components/Card'
import { LT } from '../../constants'
import { useActiveWeb3React } from '../../hooks'
import { ButtonGray, ButtonPrimary } from '../../components/Button'
import BasePoolInfoCard, { CardHeader } from '../../components/pool/PoolInfoCard'

export default function StakingPoolDetail({
  match: {
    params: { address }
  }
}: RouteComponentProps<{ address: string }>) {
  const { account, chainId } = useActiveWeb3React()
  const { result: pool } = useStakingPool(address)
  console.log('result', pool)
  return (
    <AutoRow padding={'20px'} gap={'20px'}>
      <AutoColumn style={{ flex: 4 }}>
        <LightCard>
          <AutoRow>
            <CurrencyLogo currency={pool?.tokens[0]} />
            <TYPE.white></TYPE.white>
          </AutoRow>
          <AutoRow>
            <CurrencyLogo currency={pool?.tokens[1]} />
          </AutoRow>
        </LightCard>
      </AutoColumn>
      <AutoColumn gap={'30px'} style={{ flex: 3 }}>
        <LightCard padding={'0'}>
          <CardHeader>
            <TYPE.white fontSize={20} fontWeight={700}>
              My Rewards
            </TYPE.white>
            <TYPE.white fontSize={20}>--</TYPE.white>
          </CardHeader>
          <AutoColumn style={{ padding: 30 }} gap={'lg'}>
            <RowBetween>
              <AutoRow gap={'10px'}>
                <CurrencyLogo currency={LT[chainId ?? 1]} />
                <TYPE.white>LT</TYPE.white>
              </AutoRow>
              <TYPE.gray>--</TYPE.gray>
            </RowBetween>
            <ButtonPrimary fontSize={20}>{account ? 'Connect to wallet' : 'Yield Boost'}</ButtonPrimary>
          </AutoColumn>
        </LightCard>
        <LightCard>
          <CardHeader>
            <TYPE.white fontSize={20} fontWeight={700}>
              My Rewards
            </TYPE.white>
            <TYPE.white fontSize={20}>{''}</TYPE.white>
          </CardHeader>
          <BasePoolInfoCard pool={pool} />
          {pool?.stakingRewardAddress && (
            <AutoRowBetween gap={'30px'}>
              <ButtonGray as={Link} to={`/swap/withdraw/${pool?.stakingRewardAddress}`}>
                Unstaking
              </ButtonGray>
              <ButtonPrimary as={Link} to={`/swap/stake/${pool?.stakingRewardAddress}`}>
                Staking
              </ButtonPrimary>
            </AutoRowBetween>
          )}
        </LightCard>
      </AutoColumn>
    </AutoRow>
  )
}
