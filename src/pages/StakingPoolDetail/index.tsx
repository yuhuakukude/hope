import React, { useState, useEffect, useCallback } from 'react'
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
import { Decimal } from 'decimal.js'
import AprApi from '../../api/apr.api'
import format from '../../utils/format'
import { tryParseAmount } from '../../state/swap/hooks'

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
  const [aprInfo, setAprInfo] = useState<any>({})

  const getScale = (amount: string | undefined) => {
    if (!amount) return '--'
    const total = new Decimal(pool?.token0Amount.toFixed(2) || 0)
      .add(new Decimal(pool?.token1Amount.toFixed(2) || 0))
      .toNumber()
    return (
      new Decimal(amount)
        .div(new Decimal(total))
        .mul(100)
        .toNumber()
        .toFixed(2) + '%'
    )
  }

  const initFn = useCallback(async () => {
    if (!address) return
    const res = await AprApi.getHopeFeeApr(address)
    if (res && res.result) {
      setAprInfo(res.result)
    }
  }, [address])

  useEffect(() => {
    initFn()
  }, [initFn])

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
                <PieCharts data={[pool?.token0Amount.toFixed(2), pool?.token1Amount.toFixed(2)]}></PieCharts>
                <div className="m-l-20">
                  <Row>
                    <Circular></Circular>
                    <CurrencyLogo currency={pool?.tokens[0]} />
                    <TYPE.body marginLeft={9}>
                      {pool?.token0Amount.toFixed(2, { groupSeparator: ',' })} {pool?.tokens[0].symbol} (
                      {getScale(pool?.token0Amount.toFixed(2))})
                    </TYPE.body>
                  </Row>
                  <Row margin={'35px 0 0 0'}>
                    <Circular color={'#8FFBAE'}></Circular>
                    <CurrencyLogo currency={pool?.tokens[1]} />
                    <TYPE.body marginLeft={9}>
                      {pool?.token1Amount.toFixed(2, { groupSeparator: ',' })} {pool?.tokens[1].symbol} (
                      {getScale(pool?.token1Amount.toFixed(2))})
                    </TYPE.body>
                  </Row>
                </div>
              </Row>
              <div style={{ width: '266px' }}>
                <Row>
                  <div>
                    <TYPE.body>Base APR</TYPE.body>
                    <TYPE.white fontSize={30} marginTop={12} fontFamily={'Arboria-Medium'}>
                      {format.rate(aprInfo.ltApr)}
                    </TYPE.white>
                  </div>
                  <div className="m-l-30">
                    <TYPE.body>
                      After <span className="text-primary">Boost</span>
                    </TYPE.body>
                    <TYPE.green fontSize={30} marginTop={12} fontFamily={'Arboria-Medium'}>
                      {format.rate(aprInfo.baseApr)}{' '}
                    </TYPE.green>
                  </div>
                </Row>
                <p className="m-t-15 text-normal">Fees: {format.rate(aprInfo.feeApr)} </p>
                {aprInfo.rewardRate && (
                  <p className="m-t-10 text-normal">
                    Rewards: {format.rate(aprInfo.rewardRate)} (
                    {tryParseAmount(aprInfo?.ltAmountPerDay, LT[chainId ?? 1])?.toFixed(2, { groupSeparator: ',' })} LT
                    per day){' '}
                  </p>
                )}
              </div>
            </RowBetween>
            {pool && (
              <Row marginTop={30}>
                <CurrencyLogo currency={pool?.tokens[1]} />
                <TYPE.body marginLeft={9} marginRight={40}>
                  1.00 {pool?.tokens[0].symbol} = {pool?.token1Price} {pool?.tokens[1].symbol}
                </TYPE.body>
                <CurrencyLogo currency={pool?.tokens[0]} />
                <TYPE.body marginLeft={9}>
                  {' '}
                  1.00 {pool?.tokens[1].symbol} = {pool?.token0Price} {pool?.tokens[0].symbol}
                </TYPE.body>
              </Row>
            )}
          </LightCard>
          <Overview smallSize={true}></Overview>
          <LightCard style={{ marginTop: '20px' }} padding={'30px 40px'}>
            <div style={{ height: '435px' }}>
              <LineCharts address={address}></LineCharts>
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
