import PortfolioApi, { ILiquidityPools } from 'api/portfolio.api'
import Table from 'components/antd/Table'

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

function toFixed(val: string | number, length = 2) {
  return format.amountFormat(val, length)
}

export default function MyLiquidityPools({ getLpData }: { getLpData?: (lpTotal: number, yfTotal: number) => void }) {
  const { account } = useActiveWeb3React()
  const [dataSource, setDataSource] = useState<ILiquidityPools[]>([])
  const [headData, setHeadData] = useState<IHeadItem[]>([])
  useEffect(() => {
    if (!account) {
      return
    }
    PortfolioApi.getLiquidityPools(account).then(data => {
      if (data.success && data.result) {
        setDataSource(data.result)
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
            if (e.hopeOfLpBalance) {
              lpTotal = new Decimal(lpTotal).add(new Decimal(Number(e.hopeOfLpBalance))).toNumber()
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
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account])

  const [item, setItem] = useState<ILiquidityPools | IHeadItem[] | null>(null)
  const history = useHistory()
  const columns = [
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
                <i className="iconfont"></i>
                {toFixed(record.token0Balance, 8)}
                &nbsp; {record.composition.split('/')[0]}
              </>
            }
            desc={
              <>
                <i className="iconfont"></i>
                {toFixed(record.token1Balance, 8)}
                &nbsp;{record.composition.split('/')[1]}
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
      title: 'Staked LP Tokens',
      dataIndex: 'stakedLpBalance',
      key: 'stakedLpBalance',
      render: (text: string, record: ILiquidityPools) => {
        return <Item title={toFixed(record.stakedLpBalance)} desc={'≈ $' + toFixed(record.hopeOfStakedLpBalance)} />
      }
    },
    {
      title: 'APR',
      dataIndex: 'feesApr',
      key: 'feesApr',
      render: (text: string, record: ILiquidityPools) => {
        return (
          <Item
            type={3}
            title={format.rate(record.feesApr)}
            desc={`${format.rate(record.ltApr)} -> ${format.rate(record.maxLtApr)}`}
          />
        )
      }
    },
    {
      title: 'Claimable Rewards',
      dataIndex: 'ltTotalReward',
      key: 'ltTotalReward',
      render: (text: string, record: ILiquidityPools) => {
        return <Item title={toFixed(record.ltTotalReward)} desc={'≈ $' + toFixed(record.usdOfTotalReward)} />
      }
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
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
            history.push(`/swap/liquidity/pool-detail/${record.gomboc}`)
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

  return (
    <>
      <ClaimRewards item={item} clearItem={clearItem} />
      <Card title="My Liquidity Pools">
        {dataSource.length > 0 ? (
          <>
            <Head data={headData} claimAll={claimAll}></Head>
            <Table columns={columns} dataSource={dataSource}></Table>
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
                href="https://docs.hope.money/light/lRGc3srjpd2008mDaMdR/light-hyfi-applications-roadmap/roadmap"
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
