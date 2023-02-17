import React, { useContext, useMemo } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { Pair, JSBI } from '@uniswap/sdk'
import { Link } from 'react-router-dom'
import { SwapPoolTabs } from '../../components/NavigationTabs'

import FullPositionCard from '../../components/PositionCard'
import { useTokenBalancesWithLoadingIndicator } from '../../state/wallet/hooks'
import { ExternalLink, TYPE, HideSmall } from '../../theme'

import Card from '../../components/Card'
import { AutoRow, RowBetween, RowFixed } from '../../components/Row'
import { ButtonOutlined, ButtonPrimary } from '../../components/Button'
import { AutoColumn, GapColumn } from '../../components/Column'

import { useActiveWeb3React } from '../../hooks'
import { usePairs } from '../../data/Reserves'
import { toV2LiquidityToken, useTrackedTokenPairs } from '../../state/user/hooks'
import { Dots } from '../../components/swap/styleds'
import { CardSection } from '../../components/earn/styled'
import { useStakingInfo } from '../../state/stake/hooks'
import { BIG_INT_ZERO } from '../../constants'
import empty from '../../assets/images/empty.png'
import {useWalletModalToggle} from "../../state/application/hooks";

const PageWrapper = styled(AutoColumn)`
  padding: 0 30px;
  width: 100%;
  min-width: 1390px;
`

const VoteCard = styled(GapColumn)`
  background: ${({ theme }) => theme.bg1};
  border-radius: 20px;
  overflow: hidden;
  padding: 40px;
  justify-content: center;
  align-items: center;
`

const TitleRow = styled(RowBetween)`
  margin-bottom: 2rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
    flex-direction: column-reverse;
  `};
`

const ButtonRow = styled(RowFixed)`
  width: 300px;
  gap: 8px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    flex-direction: row-reverse;
    justify-content: space-between;
  `};
`

// const ResponsiveButtonPrimary = styled(ButtonPrimary)`
//   width: fit-content;
//   ${({ theme }) => theme.mediaWidth.upToSmall`
//     width: 48%;
//   `};
// `

// const ResponsiveButtonSecondary = styled(ButtonSecondary)`
//   width: fit-content;
//   ${({ theme }) => theme.mediaWidth.upToSmall`
//     width: 48%;
//   `};
// `

const EmptyProposals = styled.div`
  border: 1px solid ${({ theme }) => theme.text4};
  padding: 16px 12px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`
const EmptyCover = styled.img`
  width: 80%;
  height: fit-content;
`

const PositionTitleWrapper = styled(AutoRow)`
  border-radius: 10px;
  background-color: ${({ theme }) => theme.bg3};
  padding: 20px;
`

const PositionTitle = styled(TYPE.subHeader)`
  flex: 1;
`

export default function Pool() {
  const theme = useContext(ThemeContext)
  const { account } = useActiveWeb3React()

  const toggleWalletModal = useWalletModalToggle()

  // fetch the user's balances of all tracked V2 LP tokens
  const trackedTokenPairs = useTrackedTokenPairs()
  const tokenPairsWithLiquidityTokens = useMemo(
    () => trackedTokenPairs.map(tokens => ({ liquidityToken: toV2LiquidityToken(tokens), tokens })),
    [trackedTokenPairs]
  )
  const liquidityTokens = useMemo(() => tokenPairsWithLiquidityTokens.map(tpwlt => tpwlt.liquidityToken), [
    tokenPairsWithLiquidityTokens
  ])
  const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
    account ?? undefined,
    liquidityTokens
  )

  // fetch the reserves for all V2 pools in which the user has a balance
  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
        v2PairsBalances[liquidityToken.address]?.greaterThan('0')
      ),
    [tokenPairsWithLiquidityTokens, v2PairsBalances]
  )

  const v2Pairs = usePairs(liquidityTokensWithBalances.map(({ tokens }) => tokens))
  const v2IsLoading =
    fetchingV2PairBalances || v2Pairs?.length < liquidityTokensWithBalances.length || v2Pairs?.some(V2Pair => !V2Pair)

  const allV2PairsWithLiquidity = v2Pairs.map(([, pair]) => pair).filter((v2Pair): v2Pair is Pair => Boolean(v2Pair))

  // show liquidity even if its deposited in rewards contract
  const stakingInfo = useStakingInfo()
  const stakingInfosWithBalance = stakingInfo?.filter(pool => JSBI.greaterThan(pool.stakedAmount.raw, BIG_INT_ZERO))
  const stakingPairs = usePairs(stakingInfosWithBalance?.map(stakingInfo => stakingInfo.tokens))

  // remove any pairs that also are included in pairs with stake in mining pool
  const v2PairsWithoutStakedAmount = allV2PairsWithLiquidity.filter(v2Pair => {
    return (
      stakingPairs
        ?.map(stakingPair => stakingPair[1])
        .filter(stakingPair => stakingPair?.liquidityToken.address === v2Pair.liquidityToken.address).length === 0
    )
  })

  return (
    <>
      <PageWrapper>
        <TitleRow padding={'0'}>
          <HideSmall>
            <TYPE.mediumHeader style={{ marginTop: '0.5rem', justifySelf: 'flex-start' }}>
              My liquidity
            </TYPE.mediumHeader>
          </HideSmall>
          {account && (
            <ButtonRow>
              <ButtonPrimary as={Link} padding="12px 16px" to="/swap/find">
                Import
              </ButtonPrimary>
              <ButtonPrimary id="join-pool-button" as={Link} padding="12px 16px" borderRadius="12px" to="/add/ETH">
                New Position
              </ButtonPrimary>
            </ButtonRow>
          )}
        </TitleRow>
        <SwapPoolTabs active={'pool'} />
        <VoteCard gap={'lg'}>
          {!account && (
            <CardSection style={{ maxWidth: 580 }} justify={'center'}>
              <AutoColumn justify={'center'} gap="md">
                <RowBetween>
                  <TYPE.white fontSize={14}>
                    {`Liquidity providers earn a 0.3% fee on all trades proportional to their share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.`}
                  </TYPE.white>
                </RowBetween>
                <RowBetween>
                  <ExternalLink
                    style={{ color: 'white', textDecoration: 'underline' }}
                    target="_blank"
                    href="https://uniswap.org/docs/v2/core-concepts/pools/"
                  >
                    <TYPE.link fontSize={14}>Read more about providing liquidity</TYPE.link>
                  </ExternalLink>
                </RowBetween>
              </AutoColumn>
              <EmptyCover src={empty} />
            </CardSection>
          )}
          <GapColumn gap="lg" style={{ width: '100%' }}>
            <GapColumn gap="lg" style={{ width: '100%' }}>
              {!account ? (
                <Card padding="40px">
                  <TYPE.white textAlign="center">Connect to a wallet to view your liquidity.</TYPE.white>
                  <ButtonOutlined onClick={toggleWalletModal} margin={'auto'} width={'400px'} mt={'40px'} primary>
                    Connect Wallet
                  </ButtonOutlined>
                </Card>
              ) : v2IsLoading ? (
                <EmptyProposals>
                  <TYPE.body color={theme.text3} textAlign="center">
                    <Dots>Loading</Dots>
                  </TYPE.body>
                </EmptyProposals>
              ) : allV2PairsWithLiquidity?.length > 0 || stakingPairs?.length > 0 ? (
                <>
                  {/*<ButtonSecondary>*/}
                  {/*  <RowBetween>*/}
                  {/*    <ExternalLink href={'https://uniswap.info/account/' + account}>*/}
                  {/*      Account analytics and accrued fees*/}
                  {/*    </ExternalLink>*/}
                  {/*    <span> ↗</span>*/}
                  {/*  </RowBetween>*/}
                  {/*</ButtonSecondary>*/}
                  <PositionTitleWrapper>
                    <PositionTitle>Pool</PositionTitle>
                    <PositionTitle>My Liquidity</PositionTitle>
                    <PositionTitle>My Pool Tokens</PositionTitle>
                    <PositionTitle>My Pool Share</PositionTitle>
                    <PositionTitle>Actions</PositionTitle>
                  </PositionTitleWrapper>
                  {v2PairsWithoutStakedAmount.map(v2Pair => (
                    <FullPositionCard key={v2Pair.liquidityToken.address} pair={v2Pair} />
                  ))}
                </>
              ) : (
                <EmptyProposals>
                  <CardSection style={{ maxWidth: 620 }} justify={'center'}>
                    <AutoColumn justify={'center'} gap="lg">
                      <EmptyCover src={empty} />
                      <RowBetween>
                        <TYPE.white fontSize={14}>
                          {`Liquidity providers earn a 0.3% fee on all trades proportional to their share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.`}
                        </TYPE.white>
                      </RowBetween>
                      <ButtonOutlined primary mt={20} width={'70%'}>
                        <TYPE.link textAlign="center">Learn about providing liquidity</TYPE.link>
                      </ButtonOutlined>
                    </AutoColumn>
                  </CardSection>
                </EmptyProposals>
              )}
            </GapColumn>
          </GapColumn>
        </VoteCard>
      </PageWrapper>
    </>
  )
}
