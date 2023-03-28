import React, { RefObject, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { AutoColumn, ColumnCenter } from '../../components/Column'
import Row, { AutoRow, RowBetween, RowFixed } from '../../components/Row'
import { CustomLightSpinner, ExternalLink, TYPE } from '../../theme'
import { ButtonGray, ButtonOutlined, ButtonPrimary } from '../../components/Button'
import usePairsInfo from '../../hooks/usePairInfo'
import PoolCard from '../../components/pool/PoolCard'
import FullPositionCard from '../../components/PositionCard'
import { SearchInput } from '../../components/SearchModal/styleds'
import { Pagination } from 'antd'
import { useHistory } from 'react-router-dom'
import { CardSection } from '../../components/earn/styled'
import empty1 from '../../assets/images/empty.png'
import empty2 from '../../assets/images/empty2.png'
import farmsEmpty from '../../assets/images/farms-empty.png'
import Card from '../../components/Card'
import { useWalletModalToggle } from '../../state/application/hooks'
import { useActiveWeb3React } from '../../hooks'
import Circle from '../../assets/images/blue-loader.svg'
import { Switch } from 'antd'
import NoData from '../../assets/images/no_data.png'
import { useTokenPriceObject } from '../../hooks/liquidity/useBasePairs'
import useTheme from '../../hooks/useTheme'
import { DOCS_URL } from 'constants/config'
import { useLiquiditySearchType } from '../../state/liquidity/hooks'
import { Field } from '../../state/liquidity/actions'
import { getLTTokenAddress } from 'utils/addressHelpers'

const PageWrapper = styled(AutoColumn)`
  padding: 0 30px;
  width: 100%;
  max-width: 1340px;
`

const EmptyProposals = styled.div`
  margin-top: 30px;
  padding: 30px 12px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

const TabWrapper = styled(Row)<{ flexW?: number; left: number }>`
  padding: 2px;
  width: fit-content;
  background-color: #1b1b1f;
  border-radius: 8px;
  position: relative;
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: ${({ left }) => (left ? `${left}%` : '0')};
    height: 100%;
    width: ${({ flexW }) => (flexW ? `${flexW}%` : '50%')};
    border-radius: 8px;
    background-color: #3d3e46;
    box-sizing: border-box;
    transition: all ease 0.25s;
    border: 2px solid #1b1b1f;
  }
`

const TabItem = styled.div<{ isActive?: boolean }>`
  color: ${({ isActive, theme }) => (isActive ? theme.text1 : '#a8a8aa')};
  width: 118px;
  height: 38px;
  border-radius: 8px;
  font-size: 14px;
  font-family: Arboria-Medium;
  cursor: pointer;
  user-select: none;
  position: relative;
  z-index: 2;
  // background: ${({ isActive, theme }) => (isActive ? theme.bg3 : theme.bg5)};
  text-align: center;
  line-height: 38px;

  &:hover {
    color: ${({ theme }) => theme.text1};
  }
`

const EmptyCover = styled.img`
  width: 206px;
  height: 168px;
  height: fit-content;
  margin-top: 40px;
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
  font-family: Arboria-Medium;
`

const poolTitles = [
  { value: 'Pools', weight: 1.5 },
  { value: 'TVL' },
  { value: 'Volume (24h)' },
  { value: 'Fees APR' },
  { value: 'Farming APR', weight: 1.5 },
  { value: 'Daily Farming Rewards' },
  { value: ' ', weight: 0.1 }
]

const positionTitles = [
  { value: 'Pools', weight: 1 },
  { value: 'My Deposits' },
  { value: 'LP Tokens' },
  { value: 'Boost' },
  { value: 'APR', weight: 1.5 },
  { value: 'Claimable Rewards' },
  { value: 'Actions', weight: 0.5, alignCenter: true }
]
export default function Pools() {
  const theme = useTheme()
  const { account, chainId } = useActiveWeb3React()
  const [liquiditySearchType, setLiquiditySearchType] = useLiquiditySearchType()
  const inputRef = useRef<HTMLInputElement>()
  const [searchValue, setSearchValue] = useState('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const toggleWalletModal = useWalletModalToggle()
  const history = useHistory()
  const [reload, setReload] = useState(0)
  const { pairInfos, total, loading, isError } = usePairsInfo(
    pageSize,
    currentPage,
    liquiditySearchType,
    searchValue,
    reload
  )

  const ltAddress = useMemo(() => [getLTTokenAddress(chainId)], [chainId])
  const { result: priceResult } = useTokenPriceObject(ltAddress)
  const handleSearchInput = (event: any) => {
    const input = event.target.value
    setCurrentPage(1)
    setSearchValue(input)
  }

  const onPagesChange = (page: any, pageSize: any) => {
    setCurrentPage(Number(page))
    setPageSize(Number(pageSize))
  }

  function ConnectView() {
    return (
      <EmptyProposals>
        <CardSection style={{ maxWidth: 716 }} justify={'center'}>
          <AutoColumn justify={'center'} gap="md">
            <RowBetween>
              <TYPE.white fontSize={16} lineHeight={'24px'}>
                {liquiditySearchType === Field.USER_STAKING
                  ? `Stake your liquidity position (LP Token) to earn LT rewards`
                  : `Liquidity providers earn a 0.3% fee on all trades proportional to their share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing liquidity provided. `}
              </TYPE.white>
            </RowBetween>
            <RowBetween>
              <ExternalLink
                style={{ color: 'white', fontSize: '16px', textDecoration: 'none' }}
                target="_blank"
                href={DOCS_URL['HopeToken']}
              >
                {liquiditySearchType !== Field.USER_STAKING && (
                  <TYPE.link fontSize={16}>Read more about providing liquidity</TYPE.link>
                )}
              </ExternalLink>
            </RowBetween>
          </AutoColumn>
          <EmptyCover src={empty2} />
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
            <EmptyCover src={liquiditySearchType === Field.USER_STAKING ? farmsEmpty : empty1} />
            <RowBetween>
              <TYPE.white fontSize={16} lineHeight={'24px'}>
                {liquiditySearchType === Field.USER_STAKING
                  ? `Stake your liquidity position (LP Token) to earn LT rewards`
                  : `Liquidity providers earn a 0.3% fee on all trades proportional to their share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing liquidity provided. `}
              </TYPE.white>
            </RowBetween>
            <a
              style={{ width: `400px`, fontSize: '16px', textDecoration: 'none' }}
              target="_blank"
              rel="noopener noreferrer"
              href={DOCS_URL['WelcomeToHope']}
            >
              <ButtonOutlined primary mt={20}>
                <TYPE.link textAlign="center">
                  {liquiditySearchType !== Field.USER_STAKING
                    ? 'Learn about providing liquidity'
                    : 'Learn About Liquidity Farming'}
                </TYPE.link>
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
          <TabWrapper left={liquiditySearchType === Field.ALL ? 0 : 50}>
            <TabItem
              onClick={() => {
                setCurrentPage(1)
                setLiquiditySearchType(Field.ALL)
              }}
              isActive={liquiditySearchType === Field.ALL}
            >
              All
            </TabItem>
            <TabItem
              onClick={() => {
                setCurrentPage(1)
                setLiquiditySearchType(Field.USER_LIQUIDITY)
              }}
              isActive={liquiditySearchType === Field.USER_LIQUIDITY || liquiditySearchType === Field.USER_STAKING}
            >
              My Positions
            </TabItem>
          </TabWrapper>
          <AutoColumn>
            <RowFixed gap={'md'}>
              <AutoRow gap={'12px'}>
                <TYPE.main>My Farms</TYPE.main>
                <Switch
                  checked={liquiditySearchType === Field.USER_STAKING}
                  className="pool-switch"
                  onChange={(e: any) => {
                    setCurrentPage(1)
                    setLiquiditySearchType(e ? Field.USER_STAKING : Field.USER_LIQUIDITY)
                  }}
                />
              </AutoRow>
              <div style={{ width: '440px', margin: 'auto', marginLeft: 40 }}>
                <div className="flex">
                  <div style={{ position: 'relative', width: '440px' }} className="flex">
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
                </div>
              </div>
            </RowFixed>
          </AutoColumn>
        </RowBetween>
      </AutoRow>
      {liquiditySearchType === Field.ALL && (
        <TableWrapper>
          <TableTitleWrapper>
            {poolTitles.map(({ value, weight }, index) => (
              <TableTitle key={index} flex={weight ?? 1}>
                {value}
              </TableTitle>
            ))}
          </TableTitleWrapper>
        </TableWrapper>
      )}
      {liquiditySearchType !== Field.ALL && account && (
        <TableWrapper>
          <TableTitleWrapper>
            {positionTitles.map(({ value, weight, alignCenter }, index) => (
              <TableTitle key={index} flex={weight ?? 1}>
                <p style={{ textAlign: alignCenter ? 'center' : 'left' }}>{value}</p>
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
      ) : liquiditySearchType === Field.ALL ? (
        <>
          {pairInfos.length > 0 ? (
            pairInfos.map(amountPair => (
              <PoolCard
                pairData={amountPair}
                key={amountPair.pair.liquidityToken.address}
                tvl={amountPair.tvl}
                pairInfo={amountPair}
              />
            ))
          ) : (
            <AutoColumn gap={'15px'} style={{ width: '115px', margin: '60px auto' }}>
              <div
                style={{
                  width: '60px',
                  height: '40px',
                  margin: '0 auto',
                  background: `url(${NoData}) no-repeat center`,
                  backgroundSize: 'contain'
                }}
              ></div>
              <p className="font-nor" style={{ color: '#63636A' }}>
                No data found
              </p>
              {isError && (
                <ButtonGray style={{ color: theme.primary1 }} height={42} mt={15} onClick={() => setReload(reload + 1)}>
                  Reload
                </ButtonGray>
              )}
            </AutoColumn>
          )}
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
                  RewardsApr={amountPair.ltApr || '0'}
                  maxBoost={Number(amountPair.maxBoost) === 0 ? 1 : amountPair.maxBoost}
                />
              ))}
            </>
          )}
        </>
      )}
      <ColumnCenter style={{ marginTop: 30 }}>
        {(account || (!account && liquiditySearchType === Field.ALL)) &&
          !loading &&
          pairInfos.length !== 0 &&
          total > 0 && (
            <Row justify="flex-end">
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
