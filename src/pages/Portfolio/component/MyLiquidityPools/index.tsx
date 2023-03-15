import PortfolioApi, { ILiquidityPools } from 'api/portfolio.api'
import Table from 'components/antd/Table'
import { ColumnCenter } from '../../../../components/Column'
import Circle from '../../../../assets/images/blue-loader.svg'

import Tips from 'components/Tips'

import { useActiveWeb3React } from 'hooks'
import React, { useCallback, useEffect, useState } from 'react'
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

function toFixed(val: string | number, length = 2) {
  return format.amountFormat(val, length)
}

export default function MyLiquidityPools({ getLpData }: { getLpData?: (lpTotal: number, yfTotal: number) => void }) {
  const { account } = useActiveWeb3React()
  const [dataSource, setDataSource] = useState<ILiquidityPools[]>([])
  const [listLoading, setListLoading] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [pageTotal, setPageTotal] = useState<number>(0)
  const [allTableData, setAllTableData] = useState<any>([])
  const [headData, setHeadData] = useState<IHeadItem[]>([])
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
        const headList: IHeadItem[] = []
        data.result.forEach(item => {
          if (item.ltOfReward && Number(item.ltOfReward) !== 0) {
            headList.push({
              ltOfReward: item.ltOfReward,
              ltTotalReward: item.ltTotalReward,
              gomboc: item.gomboc,
              composition: item.composition,
              usdOfReward: item.usdOfReward
            })
          }
        })
        setHeadData(headList)
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
          getLpData && getLpData(lpTotal, yfTotal)
        }

        setListLoading(false)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account])

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
      title: 'My Composition',
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
            title={<>Currrent: {record.currentBoost || '--'}</>}
            desc={<>Future: {record.futureBoost || '--'}</>}
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
        return <Item title={toFixed(record.ltTotalReward) + ' LT'} desc={'≈ $' + toFixed(record.usdOfTotalReward)} />
      }
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
      align: 'center',
      render: (text: string, record: ILiquidityPools) => {
        const options: TitleTipsProps[] = []
        if (record.ltOfReward && Number(record.ltOfReward) > 0) {
          options.push({
            label: 'Claim Rewards',
            value: 'Claim Rewards',
            onClick: () => {
              setItem(record)
            }
          })
        }
        options.push({
          label: 'Yield Boost',
          value: 'Yield Boost',
          onClick: () => {
            history.push(`/dao/gomboc?gomboc=${record.gomboc}`)
          }
        })
        options.push({
          label: 'Pool Details',
          value: 'Pool Details',
          onClick: () => {
            history.push(`/swap/liquidity/pool-detail/${record.pair}`)
          }
        })
        return <SelectTips options={options} />
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
      <ClaimRewards item={item} clearItem={clearItem} />
      <Card title="My Liquidity Pools">
        {listLoading ? (
          <ColumnCenter
            style={{ height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center', marginTop: 50 }}
          >
            <CustomLightSpinner src={Circle} alt="loader" size={'30px'} />
            <TYPE.main mt={20}>Loading</TYPE.main>
          </ColumnCenter>
        ) : allTableData.length > 0 ? (
          <>
            <Head data={headData} claimAll={claimAll}></Head>
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
                href="https://docs.hope.money/hope-1/lRGc3srjpd2008mDaMdR/usdhope-reserve-pools-hrp/understanding-usdhope-reserve-pools"
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
