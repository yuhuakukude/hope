import { Currency, ETHER, JSBI, TokenAmount } from '@uniswap/sdk'
import React, { useCallback, useEffect, useState } from 'react'
import { PlusCircle } from 'react-feather'
import { Text } from 'rebass'
import { ButtonDropdownLight, ButtonError, ButtonOutlined, ButtonPrimary } from '../../components/Button'
import { GreyCard, LightCard } from '../../components/Card'
import { AutoColumn, ColumnCenter } from '../../components/Column'
import CurrencyLogo from '../../components/CurrencyLogo'
import { FindPoolTabs, StyledMenuIcon } from '../../components/NavigationTabs'
import { MinimalPositionCard } from '../../components/PositionCard'
import Row from '../../components/Row'
import CurrencySearchModal from '../../components/SearchModal/CurrencySearchModal'
import { PairState, usePair } from '../../data/Reserves'
import { useActiveWeb3React } from '../../hooks'
import { usePairAdder } from '../../state/user/hooks'
import { useTokenBalance } from '../../state/wallet/hooks'
import { currencyId } from '../../utils/currencyId'
import AppBody from '../AppBody'
import { Dots } from '../Pool/styleds'
import { StyledInternalLink, TYPE } from '../../theme'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

enum Fields {
  TOKEN0 = 0,
  TOKEN1 = 1
}

const Wrapper = styled(AutoColumn)`
  width: 100%;
  align-items: center;
`

export default function PoolFinder() {
  const { account } = useActiveWeb3React()

  const [showSearch, setShowSearch] = useState<boolean>(false)
  const [activeField, setActiveField] = useState<number>(Fields.TOKEN1)

  const [currency0, setCurrency0] = useState<Currency | null>(ETHER)
  const [currency1, setCurrency1] = useState<Currency | null>(null)

  const [pairState, pair] = usePair(currency0 ?? undefined, currency1 ?? undefined)
  const addPair = usePairAdder()
  useEffect(() => {
    if (pair) {
      addPair(pair)
    }
  }, [pair, addPair])

  const validPairNoLiquidity: boolean =
    pairState === PairState.NOT_EXISTS ||
    Boolean(
      pairState === PairState.EXISTS &&
        pair &&
        JSBI.equal(pair.reserve0.raw, JSBI.BigInt(0)) &&
        JSBI.equal(pair.reserve1.raw, JSBI.BigInt(0))
    )

  const position: TokenAmount | undefined = useTokenBalance(account ?? undefined, pair?.liquidityToken)
  const hasPosition = Boolean(position && JSBI.greaterThan(position.raw, JSBI.BigInt(0)))

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      if (activeField === Fields.TOKEN0) {
        setCurrency0(currency)
      } else {
        setCurrency1(currency)
      }
    },
    [activeField]
  )

  const handleSearchDismiss = useCallback(() => {
    setShowSearch(false)
  }, [setShowSearch])

  const prerequisiteMessage = (
    <LightCard padding="45px 10px">
      <Text textAlign="center">
        {!account ? 'Connect to a wallet to find pools' : 'Select a token to find your liquidity.'}
      </Text>
    </LightCard>
  )

  return (
    <Wrapper gap={'lg'} justify={'center'}>
      <FindPoolTabs />
      <AppBody>
        <AutoColumn style={{ padding: '1rem' }} gap="lg">
          <StyledInternalLink to={'/swap/settings'}>
            <StyledMenuIcon />
          </StyledInternalLink>
          <GreyCard borderRadius={'10px'} padding={'20px'}>
            <AutoColumn gap="10px">
              <TYPE.link fontWeight={400} color={'text1'}>
                <b>Tip:</b> Use this tool to find pairs that don&apos;t automatically appear in the interface.
              </TYPE.link>
            </AutoColumn>
          </GreyCard>
          <ButtonDropdownLight
            onClick={() => {
              setShowSearch(true)
              setActiveField(Fields.TOKEN0)
            }}
          >
            {currency0 ? (
              <Row>
                <CurrencyLogo currency={currency0} />
                <Text fontWeight={500} marginLeft={'12px'}>
                  {currency0.symbol}
                </Text>
              </Row>
            ) : (
              <Text fontWeight={500} marginLeft={'12px'}>
                Select a Token
              </Text>
            )}
          </ButtonDropdownLight>

          <ColumnCenter>
            <PlusCircle size="20" color="#888D9B" />
          </ColumnCenter>

          <ButtonDropdownLight
            onClick={() => {
              setShowSearch(true)
              setActiveField(Fields.TOKEN1)
            }}
          >
            {currency1 ? (
              <Row>
                <CurrencyLogo currency={currency1} />
                <Text fontWeight={500} marginLeft={'12px'}>
                  {currency1.symbol}
                </Text>
              </Row>
            ) : (
              <Text fontWeight={500} marginLeft={'12px'}>
                Select a Token
              </Text>
            )}
          </ButtonDropdownLight>

          {currency0 && currency1 ? (
            pairState === PairState.EXISTS ? (
              hasPosition && pair ? (
                <MinimalPositionCard pair={pair} border="1px solid #CED0D9" />
              ) : (
                <LightCard padding="45px 10px">
                  <AutoColumn gap="lg" justify="center">
                    <Text textAlign="center">You don’t have liquidity in this pool yet.</Text>
                    <ButtonPrimary as={Link} to={`/add/${currencyId(currency0)}/${currencyId(currency1)}`}>
                      <Text textAlign="center">Add liquidity.</Text>
                    </ButtonPrimary>
                  </AutoColumn>
                </LightCard>
              )
            ) : validPairNoLiquidity ? (
              <LightCard padding="45px 10px">
                <AutoColumn gap="lg" justify="center">
                  <Text textAlign="center">No pool found.</Text>
                  <ButtonPrimary as={Link} to={`/add/${currencyId(currency0)}/${currencyId(currency1)}`}>
                    Create pool.
                  </ButtonPrimary>
                </AutoColumn>
              </LightCard>
            ) : pairState === PairState.INVALID ? (
              <LightCard padding="45px 10px">
                <ButtonError error disabled>
                  Invalid pair.
                </ButtonError>
              </LightCard>
            ) : pairState === PairState.LOADING ? (
              <LightCard padding="45px 10px">
                <ButtonOutlined disabled>
                  Loading
                  <Dots />
                </ButtonOutlined>
              </LightCard>
            ) : null
          ) : (
            prerequisiteMessage
          )}
        </AutoColumn>

        {hasPosition && (
          <LightCard padding="0px 10px 30px 10px">
            <ButtonPrimary as={Link} to={'/swap/pools'}>
              <Text textAlign="center">Add to my liquidity list</Text>
            </ButtonPrimary>
          </LightCard>
        )}

        <CurrencySearchModal
          isOpen={showSearch}
          onCurrencySelect={handleCurrencySelect}
          onDismiss={handleSearchDismiss}
          showCommonBases
          selectedCurrency={(activeField === Fields.TOKEN0 ? currency1 : currency0) ?? undefined}
        />
      </AppBody>
    </Wrapper>
  )
}
