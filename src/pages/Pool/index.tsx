import React, { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { Link } from 'react-router-dom'
import { SwapPoolTabs } from '../../components/NavigationTabs'

import FullPositionCard from '../../components/PositionCard'
import { ExternalLink, TYPE, HideSmall } from '../../theme'

import Card from '../../components/Card'
import { AutoRow, RowBetween, RowFixed } from '../../components/Row'
import { ButtonOutlined, ButtonPrimary } from '../../components/Button'
import { AutoColumn, GapColumn } from '../../components/Column'

import { useActiveWeb3React } from '../../hooks'
import { Dots } from '../../components/swap/styleds'
import { CardSection } from '../../components/earn/styled'
import empty from '../../assets/images/empty.png'
import { useWalletModalToggle } from '../../state/application/hooks'
import usePairsInfo from '../../hooks/usePairInfo'

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
  const { pairInfos, loading } = usePairsInfo()

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
              <ButtonPrimary id="join-pool-button" as={Link} padding="12px 16px" borderRadius="12px" to="/swap/add/ETH">
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
              ) : loading ? (
                <EmptyProposals>
                  <TYPE.body color={theme.text3} textAlign="center">
                    <Dots>Loading</Dots>
                  </TYPE.body>
                </EmptyProposals>
              ) : pairInfos?.length > 0 ? (
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
                  {pairInfos.map(amountPair => (
                    <FullPositionCard
                      key={amountPair.pair.liquidityToken.address}
                      pairInfo={amountPair.pair}
                      stakedBalance={amountPair.stakedAmount}
                    />
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
                      <a
                        style={{ width: `400px` }}
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`https://docs.hope.money/hope-1/lRGc3srjpd2008mDaMdR/`}
                      >
                        <ButtonOutlined primary mt={20}>
                          <TYPE.link textAlign="center">Learn about providing liquidity</TYPE.link>
                        </ButtonOutlined>
                      </a>
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
