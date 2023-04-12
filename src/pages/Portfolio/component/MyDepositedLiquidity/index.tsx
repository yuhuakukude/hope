import { ColumnCenter } from '../../../../components/Column'
import Circle from '../../../../assets/images/blue-loader.svg'

import { useActiveWeb3React } from 'hooks'
import React, { useState, useMemo, useCallback } from 'react'
import Card from '../Card'
import ClaimRewards from '../ClaimRewards'
import Head, { IHeadItem } from './components/head'
import { ButtonPrimary } from '../../../../components/Button'
import { Link } from 'react-router-dom'
import { CustomLightSpinner, TYPE } from '../../../../theme'
import { DOCS_URL } from 'constants/config'
import { useTokenPriceObject } from 'hooks/liquidity/useBasePairs'
import { getLTToken, getLTTokenAddress } from 'utils/addressHelpers'
import { JSBI, TokenAmount } from '@uniswap/sdk'

import { AutoColumn } from 'components/Column'
import usePairsInfo from 'hooks/usePairInfo'
import FullPositionCard from 'components/PositionCard'
import Row from 'components/Row'
import { Pagination } from 'antd'
import { Field } from 'state/liquidity/actions'
import styled from 'styled-components'
import { unwrappedToken } from 'utils/wrappedCurrency'

const TableWrapper = styled(AutoColumn)`
  margin-top: 30px;
`
const TableTitleWrapper = styled(AutoColumn)`
  display: flex;
  padding: 14px 30px;
  border-radius: 10px;
  background-color: #3d3e46;
`
const TableTitle = styled(TYPE.main)`
  flex: 1;
  font-size: 14px;
  font-family: Arboria-Medium;
`

const positionTitles = [
  { value: 'Pools', weight: 1 },
  { value: 'My Deposits' },
  { value: 'LP Tokens' },
  { value: 'Boost' },
  { value: 'APR', weight: 1.5 },
  { value: 'Claimable Rewards' },
  { value: 'Actions', weight: 0.5, alignCenter: true }
]

export default function MyDepositedLiquidity() {
  const { chainId } = useActiveWeb3React()
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const liquiditySearchType = Field.USER_LIQUIDITY
  const searchValue = ''
  const reload = 0
  const { pairInfos, total, loading } = usePairsInfo(pageSize, currentPage, liquiditySearchType, searchValue, reload)
  const ltAddress = useMemo(() => [getLTTokenAddress(chainId)], [chainId])
  const { result: priceResult } = useTokenPriceObject(ltAddress)

  const ltPrice = useMemo(() => {
    return priceResult ? Number(priceResult[ltAddress[0].toLowerCase()]) : undefined
  }, [priceResult, ltAddress])

  const onPagesChange = (page: any, pageSize: any) => {
    setCurrentPage(Number(page))
    setPageSize(Number(pageSize))
  }

  const headData = useMemo(() => {
    const arr: any = []
    if (pairInfos && pairInfos.length > 0) {
      pairInfos.forEach((e: any) => {
        if (e.stakingAddress && e.miningRewards && e.miningRewards.greaterThan(JSBI.BigInt(0)) && e.tokens) {
          const currency0 = unwrappedToken(e.tokens[0])
          const currency1 = unwrappedToken(e.tokens[1])
          const item: any = {
            conReward: e.miningRewards,
            gauge: e.stakingAddress,
            composition: `${currency0.symbol} / ${currency1.symbol}`
          }
          arr.push(item)
        }
      })
      return arr
    }
    return arr
  }, [pairInfos])

  const totalVal = useMemo(() => {
    let num = JSBI.BigInt('0')
    if (headData && headData.length > 0) {
      headData.forEach((e: any) => {
        if (e.conReward) {
          num = JSBI.add(num, JSBI.BigInt(e.conReward?.raw.toString() ?? '0'))
        }
      })
    }
    const tNum = new TokenAmount(getLTToken(chainId), num ? num : '0')
    return tNum
  }, [headData, chainId])

  const [item, setItem] = useState<IHeadItem[] | null>(null)
  const clearItem = useCallback(() => setItem(null), [])
  const claimAll = () => {
    setItem(headData)
  }

  return (
    <>
      <ClaimRewards ltPrice={ltPrice} totalVal={totalVal} item={item} clearItem={clearItem} />
      <Card title="My Deposited Liquidity">
        {loading ? (
          <ColumnCenter
            style={{ height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center', marginTop: 50 }}
          >
            <CustomLightSpinner src={Circle} alt="loader" size={'30px'} />
            <TYPE.main mt={20}>Loading</TYPE.main>
          </ColumnCenter>
        ) : pairInfos.length > 0 ? (
          <>
            <Head loading={loading} totalVal={totalVal} ltPrice={ltPrice} data={headData} claimAll={claimAll}></Head>
            <TableWrapper>
              <TableTitleWrapper>
                {positionTitles.map(({ value, weight, alignCenter }, index) => (
                  <TableTitle key={index} flex={weight ?? 1}>
                    <p style={{ textAlign: alignCenter ? 'center' : 'left' }}>{value}</p>
                  </TableTitle>
                ))}
              </TableTitleWrapper>
            </TableWrapper>
            <>
              {pairInfos.map((amountPair: any) => (
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
            <ColumnCenter style={{ marginTop: 30 }}>
              {!loading && pairInfos.length !== 0 && total > 0 && (
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
          </>
        ) : (
          <div className="flex jc-center">
            <div>
              <p className="text-center font-nor">You have no liquidity on Mainnet</p>
              <ButtonPrimary
                padding={'19px 24px'}
                as={Link}
                to={'/swap/liquidity/manager'}
                style={{ width: '400px', marginTop: '20px' }}
              >
                Add Liquidity
              </ButtonPrimary>
              <a
                href={DOCS_URL['LiquidityProvider']}
                target="_blank"
                rel="noopener noreferrer"
                className="text-center m-t-20 font-nor text-normal flex ai-center jc-center"
              >
                {/* Learn more Url */}
                Learn more about Liquidity Pool <i className="iconfont m-l-12">&#xe619;</i>
              </a>
            </div>
          </div>
        )}
      </Card>
    </>
  )
}
