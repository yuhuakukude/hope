import React, { RefObject, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { AutoColumn, ColumnCenter } from '../../components/Column'
import Row, { AutoRow, RowBetween, RowFixed } from '../../components/Row'
import { CustomLightSpinner, ExternalLink, TYPE } from '../../theme'
import { ButtonGray, ButtonOutlined, ButtonPrimary } from '../../components/Button'
import { TabItem, TabWrapper } from '../../components/Tab'
import usePairsInfo, { PAIR_SEARCH } from '../../hooks/usePairInfo'
import PoolCard from '../../components/pool/PoolCard'
import FullPositionCard from '../../components/PositionCard'
import { SearchInput } from '../../components/SearchModal/styleds'
import { Pagination } from 'antd'
import { useHistory } from 'react-router-dom'
import { CardSection } from '../../components/earn/styled'
import empty from '../../assets/images/empty.png'
import Card from '../../components/Card'
import { useWalletModalToggle } from '../../state/application/hooks'
import { useActiveWeb3React } from '../../hooks'
import Circle from '../../assets/images/blue-loader.svg'
import { LT } from '../../constants'
import { Switch } from 'antd'
import { useTokenPriceObject } from '../../hooks/liquidity/useBasePairs'

const PageWrapper = styled(AutoColumn)`
  padding: 0 30px;
  width: 100%;
  max-width: 1340px;
`

const EmptyProposals = styled.div`
  background-color: ${({ theme }) => theme.bg1};
  border: 1px solid ${({ theme }) => theme.text4};
  margin-top: 30px;
  padding: 30px 12px;
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

const TableWrapper = styled(AutoColumn)`
  margin-top: 30px;
`

const TableTitleWrapper = styled(AutoColumn)`
  display: flex;
  padding: 14px 30px;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.bg1};
`

const TableTitle = styled(TYPE.main)`
  flex: 1;
  font-size: 14px;
`

const poolTitles = [
  { value: 'Pools', weight: 1.5 },
  { value: 'TVL' },
  { value: 'Volume (24h)' },
  { value: 'Fees APR' },
  { value: 'Rewards APR' },
  { value: 'Mining Rewards' },
  { value: ' ', weight: 0.1 }
]

const positionTitles = [
  { value: 'Pools', weight: 1 },
  { value: 'My Composition' },
  { value: 'LP Tokens' },
  { value: 'Boost' },
  { value: 'APR', weight: 1.5 },
  { value: 'Claimable Rewards' },
  { value: 'Actions', weight: 0.5 }
]
export default function Pools() {
  const { account, chainId } = useActiveWeb3React()
  const inputRef = useRef<HTMLInputElement>()
  const [searchValue, setSearchValue] = useState('')
  const [searchType, setSearchType] = useState(PAIR_SEARCH.ALL)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(5)
  const toggleWalletModal = useWalletModalToggle()
  const history = useHistory()
  const { pairInfos, total, loading } = usePairsInfo(pageSize, currentPage, searchType, searchValue)

  const ltAddress = useMemo(() => {
    return [LT[chainId ?? 1].address.toString()]
  }, [chainId])
  const { result: priceResult } = useTokenPriceObject(ltAddress)
  const handleSearchInput = (event: any) => {
    const input = event.target.value
    setSearchValue(input)
  }

  const onPagesChange = (page: any, pageSize: any) => {
    setCurrentPage(Number(page))
    setPageSize(Number(pageSize))
  }

  function ConnectView() {
    return (
      <EmptyProposals>
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
                href="https://docs.hope.money/hope-1/lRGc3srjpd2008mDaMdR/tokens/usdhope-token"
              >
                <TYPE.link fontSize={14}>Read more about providing liquidity</TYPE.link>
              </ExternalLink>
            </RowBetween>
          </AutoColumn>
          <EmptyCover src={empty} />
          <Card padding="40px 40px 0 40px">
            <TYPE.white textAlign="center">Connect to a wallet to view your liquidity.</TYPE.white>
            <ButtonOutlined onClick={toggleWalletModal} margin={'auto'} width={'400px'} mt={'40px'} primary>
              Connect Wallet
            </ButtonOutlined>
          </Card>
        </CardSection>
      </EmptyProposals>
    )
  }

  function EmptyView() {
    return (
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
    )
  }

  return (
    <PageWrapper>
      <RowBetween>
        <TYPE.largeHeader>Pools</TYPE.largeHeader>
        <ButtonPrimary
          onClick={() => history.push(`/swap/liquidity/manager`)}
          width={'150px'}
          height={'42px'}
          className="text-medium"
        >
          New Position
        </ButtonPrimary>
      </RowBetween>
      　
      <AutoRow mt={30}>
        <RowBetween>
          <TabWrapper>
            <TabItem
              onClick={() => {
                setCurrentPage(1)
                setSearchType(PAIR_SEARCH.ALL)
              }}
              isActive={searchType === PAIR_SEARCH.ALL}
            >
              All
            </TabItem>
            <TabItem
              onClick={() => {
                setCurrentPage(1)
                setSearchType(PAIR_SEARCH.USER_LIQUIDITY)
              }}
              isActive={searchType === PAIR_SEARCH.USER_LIQUIDITY || searchType === PAIR_SEARCH.USER_STAKE}
            >
              My Positions
            </TabItem>
          </TabWrapper>
          <AutoColumn>
            <RowFixed gap={'md'}>
              <AutoRow gap={'12px'}>
                <TYPE.main>My Farms</TYPE.main>
                <Switch
                  className="pool-switch"
                  onChange={() => {
                    setCurrentPage(1)
                    searchType === PAIR_SEARCH.USER_STAKE
                      ? setSearchType(PAIR_SEARCH.USER_LIQUIDITY)
                      : setSearchType(PAIR_SEARCH.USER_STAKE)
                  }}
                />
              </AutoRow>
              <div style={{ width: '440px', margin: 'auto', marginLeft: 40 }}>
                <div className="flex">
                  <div style={{ position: 'relative', width: '440px' }} className="flex m-r-20">
                    <SearchInput
                      fontSize={'16px'}
                      padding={'10px 16px 10px 45px'}
                      type="text"
                      id="token-search-input"
                      placeholder={'Search Token Symbol / Address'}
                      autoComplete="off"
                      ref={inputRef as RefObject<HTMLInputElement>}
                      value={searchValue}
                      onChange={handleSearchInput}
                    />
                    <i className="iconfont search-input-icon">&#xe61b;</i>
                  </div>
                  <ButtonGray padding={'12px 24px'} style={{ width: 'max-content' }} onClick={() => {}}>
                    Search
                  </ButtonGray>
                </div>
              </div>
            </RowFixed>
          </AutoColumn>
        </RowBetween>
      </AutoRow>
      {pairInfos.length !== 0 && (
        <TableWrapper>
          <TableTitleWrapper>
            {(searchType === PAIR_SEARCH.ALL ? poolTitles : positionTitles).map(({ value, weight }, index) => (
              <TableTitle key={index} flex={weight ?? 1}>
                {value}
              </TableTitle>
            ))}
          </TableTitleWrapper>
        </TableWrapper>
      )}
      {loading ? (
        <ColumnCenter
          style={{ height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center', marginTop: 50 }}
        >
          <CustomLightSpinner src={Circle} alt="loader" size={'30px'} />
          <TYPE.main mt={20}>Loading</TYPE.main>
        </ColumnCenter>
      ) : searchType === PAIR_SEARCH.ALL ? (
        <>
          {pairInfos.map(amountPair => (
            <PoolCard
              pairData={amountPair}
              key={amountPair.pair.liquidityToken.address}
              tvl={amountPair.tvl}
              pairInfo={amountPair}
            />
          ))}
        </>
      ) : (
        <>
          {!account ? (
            <ConnectView />
          ) : pairInfos.length === 0 ? (
            <EmptyView />
          ) : (
            <>
              {pairInfos.map((amountPair, index) => (
                <FullPositionCard
                  key={amountPair.pair.liquidityToken.address}
                  ltPrice={priceResult ? Number(priceResult[ltAddress[0].toLowerCase()]) : undefined}
                  stakingAddress={amountPair.stakingAddress}
                  reward={amountPair.reward}
                  futureBoots={amountPair?.futureBoots}
                  currentBoots={amountPair?.currentBoots}
                  feeRate={amountPair.feeRate}
                  pairInfo={amountPair.pair}
                  stakedBalance={amountPair.stakedAmount}
                  feeApr={amountPair.feeApr}
                  RewardsApr={amountPair.ltApr}
                  maxApr={amountPair.maxApr}
                />
              ))}
            </>
          )}
        </>
      )}
      <ColumnCenter style={{ marginTop: 30 }}>
        {(account || (!account && searchType === PAIR_SEARCH.ALL)) && !loading && pairInfos.length !== 0 && total > 0 && (
          <Row justify="center">
            <Pagination
              showQuickJumper
              total={total}
              current={currentPage}
              pageSize={pageSize}
              showSizeChanger
              pageSizeOptions={['5', '10', '20', '30', '40']}
              onChange={onPagesChange}
              onShowSizeChange={onPagesChange}
            />{' '}
            <span className="m-l-15" style={{ color: '#868790' }}>
              Total {total}
            </span>
          </Row>
        )}
      </ColumnCenter>
    </PageWrapper>
  )
}
