import React from 'react'
import { StakeInfo } from '../../state/stake/hooks'
import styled from 'styled-components'
import { Token } from '@uniswap/sdk'
import { useActiveWeb3React } from '../../hooks'
import DoubleCurrencyLogo from '../DoubleLogo'
import { AutoRowBetween, RowBetween, RowFixed } from '../Row'
import { TYPE } from '../../theme'
import { AutoColumn } from '../Column'
import { ButtonOutlined, ButtonPrimary } from '../Button'
import Card from '../Card'
import { Divider } from 'antd'

const Wrapper = styled(RowFixed)`
  background-color: ${({ theme }) => theme.bg1};
  border-radius: 10px;
  padding: 40px 30px 20px 30px;
  width: 406px;
`

export default function LTPoolCard({ stakingInfo }: { stakingInfo: StakeInfo }) {
  const { chainId } = useActiveWeb3React()
  const token0Data = stakingInfo.pair?.token0
  const token1Data = stakingInfo.pair?.token0

  const token0 = chainId && token0Data ? new Token(chainId, token0Data?.id, Number(token0Data?.decimals)) : undefined
  const token1 = chainId && token1Data ? new Token(chainId, token1Data?.id, Number(token1Data.decimals)) : undefined
  return (
    <Wrapper>
      <Card padding={'0'}>
        <AutoColumn gap={'lg'}>
          <RowFixed>
            <DoubleCurrencyLogo margin size={24} currency0={token0} currency1={token1} />
            <RowFixed>
              <TYPE.white fontSize={24} fontWeight={500}>{`${token0Data?.symbol ?? '--'} / ${token1Data?.symbol ??
                '--'}`}</TYPE.white>
            </RowFixed>
          </RowFixed>
          <RowBetween>
            <AutoColumn gap={'md'}>
              <TYPE.green fontWeight={500} fontSize={28}>
                6.25%
              </TYPE.green>
              <TYPE.main>BASE APR</TYPE.main>
            </AutoColumn>
            <AutoColumn>
              <TYPE.main>2.50x</TYPE.main>
            </AutoColumn>
            <AutoColumn gap={'md'}>
              <TYPE.green fontWeight={500} fontSize={28}>
                6.25%
              </TYPE.green>
              <TYPE.main>Max Possible</TYPE.main>
            </AutoColumn>
          </RowBetween>
          <AutoColumn gap={'md'}>
            <RowBetween>
              <TYPE.main>Reward Token</TYPE.main>
              <TYPE.white>LT</TYPE.white>
            </RowBetween>
            <RowBetween>
              <TYPE.main>Pool Liquidity</TYPE.main>
              <TYPE.white>{stakingInfo.pair.reserveUSD.match(/^(0|[1-9]\d*)(.\d{1,2})?$/)}</TYPE.white>
            </RowBetween>
            <RowBetween>
              <TYPE.main>Total staked</TYPE.main>
              <TYPE.white>89.28%</TYPE.white>
            </RowBetween>
          </AutoColumn>
          <Divider style={{ margin: '8px 0', backgroundColor: '#3D3E46' }} />
          <AutoColumn gap={'md'}>
            <RowBetween>
              <TYPE.main>Reward Token</TYPE.main>
              <TYPE.white>LT</TYPE.white>
            </RowBetween>
            <RowBetween>
              <TYPE.main>Pool Liquidity</TYPE.main>
              <TYPE.white>≈$12,345,987.90</TYPE.white>
            </RowBetween>
            <RowBetween>
              <TYPE.main>Total staked</TYPE.main>
              <TYPE.white>89.28%</TYPE.white>
            </RowBetween>
            <RowBetween>
              <TYPE.main>Total staked</TYPE.main>
              <TYPE.white>89.28%</TYPE.white>
            </RowBetween>
          </AutoColumn>
          <AutoRowBetween gap={'20px'}>
            <ButtonPrimary height={40}>Stake</ButtonPrimary>
            <ButtonOutlined height={40} primary>
              Unstake
            </ButtonOutlined>
          </AutoRowBetween>
        </AutoColumn>
      </Card>
    </Wrapper>
  )
}
