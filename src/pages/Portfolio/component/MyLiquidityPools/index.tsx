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

function toFixed(val: string | number, length = 2) {
  if (isNaN(val as number)) {
    return val
  }
  return Number(val).toFixed(length)
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
      console.log('getLiquidityPools;;;;;::>>>>', data)
      if (data.success && data.result) {
        setDataSource(data.result)
        const headList: IHeadItem[] = []
        data.result.forEach(item => {
          if (item.ltOfReward && Number(item.ltOfReward) !== 0) {
            headList.push({
              ltOfReward: item.ltOfReward,
              ltTotalReward: item.ltTotalReward,
              gomboc: item.gomboc,
              composition: item.composition
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
            desc={<>Fee Rate: {record.feeRate}%</>}
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
                &nbsp;USDC
              </>
            }
            desc={
              <>
                <i className="iconfont"></i>
                {toFixed(record.token1Balance, 8)}
                &nbsp;BUSD
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
        return <Item title={toFixed(record.lpBalance)} desc={'≈ $' + toFixed(record.hopeOfLpBalance)} />
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
        return <Item type={3} title={`${record.feesApr || 0}%`} desc={`${record.ltApr}% -> ${record.maxLtApr}%`} />
      }
    },
    {
      title: 'Claimable Rewards',
      dataIndex: 'ltOfReward',
      key: 'ltOfReward',
      render: (text: string, record: ILiquidityPools) => {
        return <Item title={toFixed(record.ltOfReward)} desc={'≈ $' + toFixed(record.ltTotalReward)} />
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
            history.push(`/staking`) // TODO check url
          }
        })
        options.push({
          label: 'Pool Details',
          value: 'Pool Details',
          onClick: () => {
            history.push(`/staking`) // TODO check url
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
        <Head data={headData} claimAll={claimAll}></Head>
        <Table columns={columns} dataSource={dataSource}></Table>
      </Card>
    </>
  )
}
