import PortfolioApi, { ILiquidityPools } from 'api/portfolio.api'
import Table from 'components/antd/Table'
import { ColumnCenter } from '../../../../components/Column'
import Circle from '../../../../assets/images/blue-loader.svg'

import Tips from 'components/Tips'

import { useActiveWeb3React } from 'hooks'
import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import Card from '../Card'
import ClaimRewards from '../ClaimRewards'
import Item from '../Item'
import SelectTips, { TitleTipsProps } from '../SelectTips'
import Head, { IHeadItem } from './components/head'
import { Decimal } from 'decimal.js'
import format from 'utils/format'
import { ButtonPrimary } from '../../../../components/Button'
import { Link } from 'react-router-dom'
import Row, { AutoRow } from '../../../../components/Row'
import { CustomLightSpinner, TYPE } from '../../../../theme'
import { Pagination } from 'antd'
import { ArrowUpRight } from 'react-feather'
import { AutoColumn } from '../../../../components/Column'
import { SymbolLogo } from 'components/CurrencyLogo'
import { DOCS_URL } from 'constants/config'

import { useMultipleContractSingleData } from 'state/multicall/hooks'
import { STAKING_REWARDS_INTERFACE } from 'constants/abis/staking-rewards'
import { JSBI, TokenAmount } from '@uniswap/sdk'
import { useTokenPriceObject } from 'hooks/liquidity/useBasePairs'
import ClaimRewardModal from 'components/earn/ClaimRewardModal'
import { getLTToken, getLTTokenAddress } from 'utils/addressHelpers'

function toFixed(val: string | number, length = 2) {
  return format.amountFormat(val, length)
}

export default function MyLiquidityPools({ getLpData }: { getLpData?: (lpTotal: number, yfTotal: number) => void }) {
  const { account, chainId } = useActiveWeb3React()
  const [dataSource, setDataSource] = useState<ILiquidityPools[]>([])
  const [listLoading, setListLoading] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [pageTotal, setPageTotal] = useState<number>(0)
  const [allTableData, setAllTableData] = useState<any>([])
  // const [headData, setHeadData] = useState<IHeadItem[]>([])
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [stakingAddress, setStakingAddress] = useState('')
  const ltAddress = useMemo(() => [getLTTokenAddress(chainId)], [chainId])
  const { result: priceResult } = useTokenPriceObject(ltAddress)

  const ltPrice = useMemo(() => {
    return priceResult ? Number(priceResult[ltAddress[0].toLowerCase()]) : undefined
  }, [priceResult, ltAddress])

  useEffect(() => {
    if (!account) {
      return
    }
    setListLoading(true)
    PortfolioApi.getLiquidityPools(account).then(data => {
      if (data.success && data.result) {
        setAllTableData(data.result)
        setPageTotal(data.result.length || 0)
        setDataSource(data.result.slice(0, pageSize))
        let lpTotal = 0
        let yfTotal = 0
        if (data.result && data.result.length > 0) {
          data.result.forEach(e => {
            if (e.hopeOfStakableLpBalance) {
              lpTotal = new Decimal(lpTotal).add(new Decimal(Number(e.hopeOfStakableLpBalance))).toNumber()
            }
            if (e.hopeOfStakedLpBalance && e.hopeOfTotalReward) {
              yfTotal = new Decimal(yfTotal)
                .add(new Decimal(Number(e.hopeOfStakedLpBalance)))
                .add(new Decimal(Number(e.hopeOfTotalReward)))
                .toNumber()
            }
          })
        }
        getLpData && getLpData(lpTotal, yfTotal)
        setListLoading(false)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account])

  const argAddress = useMemo(() => {
    const arr: any = []
    if (allTableData && allTableData.length > 0) {
      allTableData.forEach((e: any) => {
        if (e.gauge) {
          arr.push([e.gauge])
        }
      })
    }
    return arr
  }, [allTableData])

  const accountArg = useMemo(() => [account ?? undefined], [account])
  const rewardAmounts = useMultipleContractSingleData(
    argAddress,
    STAKING_REWARDS_INTERFACE,
    'claimableTokens',
    accountArg
  )

  const extraRewardsArg = useMemo(() => [account ?? undefined, getLTTokenAddress(chainId)], [account, chainId])

  const extraRewardAmounts = useMultipleContractSingleData(
    argAddress,
    STAKING_REWARDS_INTERFACE,
    'claimableReward',
    extraRewardsArg
  )

  const conRewData = useMemo(() => {
    const obj: any = {}
    if (argAddress && argAddress.length > 0 && argAddress.length === rewardAmounts.length) {
      argAddress.forEach((e: any, index: number) => {
        const reward = rewardAmounts[index]?.result
        const extraReward = extraRewardAmounts[index]?.result
        const conReward = new TokenAmount(getLTToken(chainId), reward ? reward?.[0].toString() : '0')
        const conTotalReward = new TokenAmount(
          getLTToken(chainId),
          reward && extraReward
            ? JSBI.add(JSBI.BigInt(reward?.[0].toString()), JSBI.BigInt(extraReward?.[0].toString()))
            : reward
            ? reward?.[0].toString()
            : extraReward
            ? extraReward?.[0].toString()
            : '0'
        )
        const item = {
          conReward,
          conTotalReward
        }
        obj[e] = item
      })
    }
    return obj
  }, [argAddress, rewardAmounts, extraRewardAmounts, chainId])

  const headData = useMemo(() => {
    const arr: any = []
    if (allTableData && allTableData.length > 0) {
      allTableData.forEach((e: any, index: number) => {
        if (e.gauge && conRewData[e.gauge] && conRewData[e.gauge].conReward) {
          const item: any = {
            conReward: conRewData[e.gauge].conReward,
            gauge: e.gauge,
            composition: e.composition
          }
          arr.push(item)
        }
      })
      return arr
    }
    return arr
  }, [conRewData, allTableData])

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

  const [item, setItem] = useState<ILiquidityPools | IHeadItem[] | null>(null)
  const history = useHistory()
  const columns: any = [
    {
      title: 'Pools',
      dataIndex: 'composition',
      key: 'composition',
      render: (text: string, record: ILiquidityPools) => {
        return (
          <Item
            title={
              <>
                <span>
                  <i className="iconfont"></i>
                  <i className="iconfont"></i>
                </span>
                <span>{record.composition}</span>
              </>
            }
            desc={<>Fee Rate: {format.rate(record.feeRate)}</>}
          />
        )
      }
    },
    {
      title: 'My Deposited Liquidity',
      dataIndex: 'token0Balance',
      key: 'token0Balance',
      render: (text: string, record: ILiquidityPools) => {
        return (
          <Item
            type={2}
            title={
              <>
                <div className="flex ai-center">
                  <SymbolLogo size={'16px'} symbol={`${record.composition.split('/')[0]}`} />
                  <div className="m-l-8">
                    {toFixed(record.token0Balance, 8)}
                    &nbsp; {record.composition.split('/')[0]}
                  </div>
                </div>
              </>
            }
            desc={
              <>
                <div className="flex ai-center">
                  <SymbolLogo size={'16px'} symbol={`${record.composition.split('/')[1]}`} />
                  <div className="m-l-8">
                    {toFixed(record.token1Balance, 8)}
                    &nbsp;{record.composition.split('/')[1]}
                  </div>
                </div>
              </>
            }
          />
        )
      }
    },
    {
      title: 'LP Tokens',
      dataIndex: 'lpBalance',
      key: 'lpBalance',
      render: (text: string, record: ILiquidityPools) => {
        return <Item title={toFixed(record.lpBalance, 8)} desc={`${format.rate(record.stakedProportion)}  Staked`} />
      }
    },
    {
      title: (
        <>
          Boost{' '}
          <Tips title="When the number of a user's veLT changes, the values of the Current Boost and Future Boost may become inconsistent. To ensure that the Future Boost takes effect, the user needs to actively update the value."></Tips>
        </>
      ),
      dataIndex: 'currentBoost',
      key: 'currentBoost',
      width: 150,
      render: (text: string, record: ILiquidityPools) => {
        return (
          <Item
            type={2}
            title={<>Current Cycle: {record.currentBoost || '--'}</>}
            desc={<>Next Cycle: {record.futureBoost || '--'}</>}
          />
        )
      }
    },
    {
      title: 'APR',
      dataIndex: 'feesApr',
      key: 'feesApr',
      width: 260,
      render: (text: string, record: ILiquidityPools) => {
        return (
          <AutoColumn gap={'10px'}>
            <AutoRow>
              <TYPE.main>Fees:&nbsp;</TYPE.main>
              <TYPE.white>{format.rate(record.feesApr)}</TYPE.white>
            </AutoRow>
            <AutoRow>
              <TYPE.main>Rewards:&nbsp;</TYPE.main>
              <TYPE.white>{format.rate(record.ltApr)}</TYPE.white>
              {record.maxLtApr && <ArrowUpRight color={'#0ECB81'} size={14} style={{ margin: '0 4px' }} />}
              <TYPE.green>{format.rate(record.maxLtApr)}</TYPE.green>
            </AutoRow>
          </AutoColumn>
        )
      }
    },
    {
      title: 'Claimable Rewards',
      dataIndex: 'ltTotalReward',
      key: 'ltTotalReward',
      render: (text: string, record: ILiquidityPools) => {
        if (record.gauge) {
          return (
            <Item
              title={
                conRewData[record.gauge] && conRewData[record.gauge].conTotalReward
                  ? `${conRewData[record.gauge].conTotalReward.toFixed(2, { groupSeparator: ',' })} LT`
                  : '0.00 LT'
              }
              desc={
                conRewData[record.gauge] && ltPrice
                  ? `≈ $ ${toFixed(
                      Number(conRewData[record.gauge].conTotalReward?.toExact().toString()) * Number(ltPrice),
                      2
                    )}`
                  : '≈ $ 0.00'
              }
            />
          )
        }
        return <Item title={'0.00 LT'} desc={'≈ $ 0.00'} />
      }
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
      align: 'center',
      render: (text: string, record: ILiquidityPools) => {
        const options: TitleTipsProps[] = []
        if (
          conRewData[record.gauge] &&
          conRewData[record.gauge].conTotalReward &&
          Number(conRewData[record.gauge].conTotalReward?.toExact().toString()) > 0
        ) {
          options.push({
            label: 'Claim Rewards',
            value: 'Claim Rewards',
            onClick: () => {
              setShowClaimModal(true)
            }
          })
        }
        options.push({
          label: 'Boost My Rewards',
          value: 'Yield Boost',
          onClick: () => {
            history.push(`/dao/locker`)
          }
        })
        options.push({
          label: 'Pool Details',
          value: 'Pool Details',
          onClick: () => {
            history.push(`/swap/liquidity/pool-detail/${record.pair}`)
          }
        })
        return (
          <div
            onClick={() => {
              if (record.gauge) {
                setStakingAddress(record.gauge)
              }
            }}
          >
            <SelectTips options={options} />
          </div>
        )
      }
    }
  ]
  const clearItem = useCallback(() => setItem(null), [])
  const claimAll = () => {
    setItem(headData)
  }

  const setPageSearch = (page: number, pagesize: number) => {
    const resList = allTableData?.slice((page - 1) * pagesize, Number(pagesize) + (page - 1) * pagesize)
    setDataSource(resList)
  }

  const onPagesChange = (page: any, pageSize: any) => {
    setCurrentPage(Number(page))
    setPageSize(Number(pageSize))
    setPageSearch(page, pageSize)
  }

  return (
    <>
      <ClaimRewards ltPrice={ltPrice} totalVal={totalVal} item={item} clearItem={clearItem} />
      {stakingAddress && (
        <ClaimRewardModal
          isOpen={showClaimModal}
          onDismiss={() => setShowClaimModal(false)}
          stakingAddress={stakingAddress}
        />
      )}
      <Card title="My Deposited Liquidity">
        {listLoading ? (
          <ColumnCenter
            style={{ height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center', marginTop: 50 }}
          >
            <CustomLightSpinner src={Circle} alt="loader" size={'30px'} />
            <TYPE.main mt={20}>Loading</TYPE.main>
          </ColumnCenter>
        ) : allTableData.length > 0 ? (
          <>
            <Head totalVal={totalVal} ltPrice={ltPrice} data={headData} claimAll={claimAll}></Head>
            <Table columns={columns} dataSource={dataSource}></Table>
            {pageTotal > 0 && (
              <Row justify="flex-end" marginTop={12}>
                <Pagination
                  showQuickJumper
                  total={pageTotal}
                  current={currentPage}
                  pageSize={pageSize}
                  showSizeChanger
                  pageSizeOptions={['5', '10', '20', '30', '40']}
                  onChange={onPagesChange}
                  onShowSizeChange={onPagesChange}
                />{' '}
                <span className="m-l-15" style={{ color: '#868790' }}>
                  Total {pageTotal}
                </span>
              </Row>
            )}
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
                href={DOCS_URL['ReservePools']}
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
