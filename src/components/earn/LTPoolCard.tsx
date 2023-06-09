import React from 'react'
import { PoolInfo } from '../../state/stake/hooks'
import styled from 'styled-components'
import DoubleCurrencyLogo from '../DoubleLogo'
import { AutoRowBetween, RowBetween, RowFixed } from '../Row'
import { CustomLightSpinner, TYPE } from '../../theme'
import { AutoColumn } from '../Column'
import { ButtonOutlined, ButtonPrimary } from '../Button'
import Card from '../Card'
import { Divider } from 'antd'
import { useActiveWeb3React } from '../../hooks'
import { useTokenBalance } from '../../state/wallet/hooks'
import { useSingleCallResult } from '../../state/multicall/hooks'
import { JSBI, Percent, TokenAmount } from '@uniswap/sdk'
import { useStakingContract } from '../../hooks/useContract'
import format from 'utils/format'
import { getLTToken } from 'utils/addressHelpers'
import { useActionPending } from '../../state/transactions/hooks'
import spinner from '../../assets/svg/spinner.svg'

const Wrapper = styled(RowFixed)`
  background-color: ${({ theme }) => theme.bg1};
  border-radius: 20px;
  padding: 40px 30px 30px 30px;
  width: 406px;
`

export default function LTPoolCard({
  pool,
  onStake,
  onUnstake,
  onClaim
}: {
  pool: PoolInfo
  onStake: () => void
  onUnstake: () => void
  onClaim: () => void
}) {
  const { account, chainId } = useActiveWeb3React()
  const [token0, token1] = pool.tokens
  const { pending } = useActionPending(`claim-${account}-${pool.id}`)
  const stakingContract = useStakingContract(pool?.stakingRewardAddress, true)
  const userLiquidityUnstaked = useTokenBalance(account ?? undefined, pool.lpToken)
  const stakedAmount = useTokenBalance(account ?? undefined, pool.stakingToken)
  const earnedRes = useSingleCallResult(stakingContract, 'claimableTokens', [account ?? undefined])
  const earnedAmount = earnedRes?.result?.[0] ? new TokenAmount(getLTToken(chainId), earnedRes?.result?.[0]) : undefined
  // const totalRes = useSingleCallResult(stakingContract, 'integrateFraction', [account ?? undefined])
  return (
    <Wrapper>
      <Card borderRadius={'0'} padding={'0'}>
        <AutoColumn gap={'lg'}>
          <RowFixed>
            <DoubleCurrencyLogo margin size={24} currency0={token0} currency1={token1} />
            <RowFixed>
              <TYPE.white fontSize={24} fontWeight={700}>{`${token0?.symbol ?? '--'} / ${token1?.symbol ??
                '--'}`}</TYPE.white>
            </RowFixed>
          </RowFixed>
          <RowBetween>
            <AutoColumn gap={'md'}>
              <TYPE.green fontWeight={700} fontSize={28}>
                {format.rate(`${pool.baseApr}`)}
              </TYPE.green>
              <TYPE.main>BASE APR</TYPE.main>
            </AutoColumn>
            <AutoColumn>
              <TYPE.main>2.50x</TYPE.main>
            </AutoColumn>
            <AutoColumn gap={'md'}>
              <TYPE.green fontWeight={700} fontSize={28}>
                {format.rate(`${pool.maxApr}`)}
              </TYPE.green>
              <TYPE.main>Max Possible</TYPE.main>
            </AutoColumn>
          </RowBetween>
          <AutoColumn gap={'20px'}>
            <RowBetween>
              <TYPE.main>Reward Token</TYPE.main>
              <TYPE.white>LT</TYPE.white>
            </RowBetween>
            <RowBetween>
              <TYPE.main>Pool Liquidity</TYPE.main>
              <TYPE.white>
                {pool.totalLiquidity ? '≈$' + pool.totalLiquidity.toFixed(2, { groupSeparator: ',' }) : '0'}
              </TYPE.white>
            </RowBetween>
            <RowBetween>
              <TYPE.main>Total staked</TYPE.main>
              <TYPE.white>
                {pool.totalStakedAmount && pool?.totalSupply
                  ? new Percent(pool.totalStakedAmount.raw, pool?.totalSupply.raw).toFixed(2)
                  : '0'}{' '}
                %
              </TYPE.white>
            </RowBetween>
          </AutoColumn>
          <Divider style={{ margin: '10px 0', backgroundColor: '#3D3E46' }} />
          <AutoColumn gap={'lg'}>
            <RowBetween>
              <TYPE.main>My Position</TYPE.main>
              <TYPE.white>
                {userLiquidityUnstaked && stakedAmount && pool.totalLiquidity && pool.totalStakedAmount
                  ? `≈$${pool.totalLiquidity
                      .multiply(
                        new Percent(JSBI.ADD(userLiquidityUnstaked.raw, stakedAmount.raw), pool?.totalStakedAmount.raw)
                      )
                      .toFixed(2, { groupSeparator: ',' })} (${new Percent(
                      JSBI.ADD(userLiquidityUnstaked.raw, stakedAmount.raw),
                      pool?.totalStakedAmount.raw
                    ).toFixed(2)}%)`
                  : '--'}
              </TYPE.white>
            </RowBetween>
            <RowBetween>
              <TYPE.main>My Stakeable</TYPE.main>
              <TYPE.white>
                {userLiquidityUnstaked ? `${userLiquidityUnstaked.toFixed(2, { groupSeparator: ',' })} LP token` : '--'}
              </TYPE.white>
            </RowBetween>
            <RowBetween>
              <TYPE.main>My Staked</TYPE.main>
              <TYPE.white>
                {stakedAmount ? `${stakedAmount.toFixed(2, { groupSeparator: ',' })} LP token` : '--'}
              </TYPE.white>
            </RowBetween>
            <RowBetween>
              <TYPE.main>My Reward</TYPE.main>
              <RowFixed>
                <TYPE.white>
                  {earnedAmount ? `${earnedAmount.toFixed(2, { groupSeparator: ',' })} LT` : '--'}
                </TYPE.white>
                {earnedAmount && earnedAmount.greaterThan(JSBI.BigInt(0)) && (
                  <ButtonOutlined
                    disabled={pending}
                    ml={'12px'}
                    borderRadius={'4px'}
                    padding={'0 4px'}
                    width={'auto'}
                    height={20}
                    fontSize={12}
                    primary
                    onClick={onClaim}
                  >
                    {pending ? (
                      <RowFixed fontSize={12} padding={'0 4px'} gap="6px" justify="center">
                        Claiming <CustomLightSpinner style={{ marginLeft: 10 }} size={'16px'} src={spinner} />
                      </RowFixed>
                    ) : (
                      'Claim Rewards'
                    )}
                  </ButtonOutlined>
                )}
              </RowFixed>
            </RowBetween>
          </AutoColumn>
          <AutoRowBetween gap={'20px'} mt="20px">
            <ButtonPrimary onClick={onStake} height={40}>
              Stake
            </ButtonPrimary>
            <ButtonOutlined onClick={onUnstake} height={40} primary>
              Unstake
            </ButtonOutlined>
          </AutoRowBetween>
        </AutoColumn>
      </Card>
    </Wrapper>
  )
}
