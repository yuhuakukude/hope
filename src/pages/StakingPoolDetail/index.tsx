import React from 'react'
import { Link, RouteComponentProps } from 'react-router-dom'
import { useStakingPairPool } from '../../hooks/useLPStaking'
import Row, { AutoRow, AutoRowBetween, RowBetween, RowFlat } from '../../components/Row'
import { AutoColumn } from '../../components/Column'
import CurrencyLogo from '../../components/CurrencyLogo'
import { TYPE } from '../../theme'
import { LightCard } from '../../components/Card'
import { LT } from '../../constants'
import { useActiveWeb3React } from '../../hooks'
import { ButtonGray, ButtonPrimary } from '../../components/Button'
import BasePoolInfoCard, { CardHeader } from '../../components/pool/PoolInfoCard'
import PieCharts from '../../components/pool/PieCharts'
import LineCharts from '../../components/pool/LineCharts'
import styled from 'styled-components'
import { Box } from 'rebass/styled-components'
import Overview from '../../components/pool/Overview'

const Circular = styled(Box)<{
  color?: string
}>`
  background: ${({ color }) => color ?? '#E1C991'};
  width: 7px;
  height: 7px;
  border-radius: 50%;
  margin-right: 8px;
`

export default function StakingPoolDetail({
  match: {
    params: { address }
  }
}: RouteComponentProps<{ address: string }>) {
  const { account, chainId } = useActiveWeb3React()
  const { result: pool } = useStakingPairPool(address)
  console.log('result', pool)
  return (
    <>
      <AutoRow justify={'space-between'} padding={'0 30px'}>
        <TYPE.white fontSize={28} fontWeight={700}>{`${pool?.tokens[0].symbol || '-'}/${pool?.tokens[1].symbol ||
          '-'}`}</TYPE.white>
        <RowFlat>
          <ButtonPrimary
            as={Link}
            width={'100px'}
            style={{ marginRight: '20px' }}
            to={`/swap/stake/${pool?.stakingRewardAddress}`}
          >
            Trade
          </ButtonPrimary>
          <ButtonPrimary as={Link} width={'150px'} to={`/swap/stake/${pool?.stakingRewardAddress}`}>
            Add Liquidity
          </ButtonPrimary>
        </RowFlat>
      </AutoRow>
      <AutoRow padding={'30px 15px'} gap={'30px 15px'} align={''}>
        <AutoColumn style={{ flex: 4 }}>
          <LightCard padding={'30px'}>
            <RowBetween>
              <Row>
                <PieCharts data={[100, 50]}></PieCharts>
                <div className="m-l-20">
                  <Row>
                    <Circular></Circular>
                    <CurrencyLogo currency={pool?.tokens[0]} />
                    <TYPE.body marginLeft={9}>123,456.10 USDC (50.21%)</TYPE.body>
                  </Row>
                  <Row margin={'35px 0 0 0'}>
                    <Circular color={'#8FFBAE'}></Circular>
                    <CurrencyLogo currency={pool?.tokens[1]} />
                    <TYPE.body marginLeft={9}>1,456.1000 BUSD (49.79%)</TYPE.body>
                  </Row>
                </div>
              </Row>
              <div style={{ width: '266px' }}>
                <Row>
                  <div>
                    <TYPE.body>Base APR</TYPE.body>
                    <TYPE.white fontSize={30} marginTop={12} fontFamily={'Arboria-Medium'}>
                      26.98%
                    </TYPE.white>
                  </div>
                  <div className="m-l-30">
                    <TYPE.body>
                      After <span className="text-primary">Boost</span>
                    </TYPE.body>
                    <TYPE.green fontSize={30} marginTop={12} fontFamily={'Arboria-Medium'}>
                      38.00%{' '}
                    </TYPE.green>
                  </div>
                </Row>
                <p className="m-t-15 text-normal">Fees: 4.13% </p>
                <p className="m-t-10 text-normal">Rewards: 22.86% (100,447.37 LT per day) </p>
              </div>
            </RowBetween>
            <Row marginTop={30}>
              <CurrencyLogo currency={pool?.tokens[1]} />
              <TYPE.body marginLeft={9} marginRight={40}>
                1.00 BUSD = 0.998 USDC
              </TYPE.body>
              <CurrencyLogo currency={pool?.tokens[0]} />
              <TYPE.body marginLeft={9}> 1.00 USDC = 1.002 BUSD</TYPE.body>
            </Row>
          </LightCard>
          <Overview smallSize={true}></Overview>
          <LightCard style={{ marginTop: '20px' }} padding={'30px 40px'}>
            <div style={{ height: '435px' }}>
              <LineCharts
                xData={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
                yData={[820, 32, 901, 134, 1290, 900, 620]}
              ></LineCharts>
            </div>
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
    </>
  )
}
