import PortfolioApi, { ILiquidityPools } from 'api/portfolio.api'
import Table from 'components/antd/Table'
import { useActiveWeb3React } from 'hooks'
import React, { useEffect, useState } from 'react'
import Card from '../Card'
import Item from '../Item'
import SelectTips, { TitleTipsProps } from '../SelectTips'

function toFixed(val: string | number, length: number = 2) {
  if (isNaN(val as number)) {
    return val
  }
  return Number(val).toFixed(length)
}

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
      return <Item title={toFixed(record.ltOfReward)} desc={toFixed(record.ltTotalReward)} />
    }
  },
  {
    title: 'Actions',
    dataIndex: 'actions',
    key: 'actions',
    render: () => {
      const options: TitleTipsProps[] = [
        {
          label: 'Stake',
          value: 'Stake',
          onClick: () => {}
        },
        {
          label: 'Unstake',
          value: 'Unstake',
          onClick: () => {}
        },
        {
          label: 'Claim Rewards',
          value: 'Claim Rewards',
          onClick: () => {}
        },
        {
          label: 'Yield Boost',
          value: 'Yield Boost',
          onClick: () => {}
        }
      ]
      return <SelectTips options={options} />
    }
  }
]
export default function MyLiquidityPools() {
  const { account } = useActiveWeb3React()
  const [dataSource, setDataSource] = useState<ILiquidityPools[]>([])
  useEffect(() => {
    if (!account) {
      return
    }
    PortfolioApi.getLiquidityPools(account).then(data => {
      console.log('getLiquidityPools;;;;;::>>>>', data)
      if (data.success && data.result) {
        setDataSource(data.result)
      }
    })
  }, [account])
  return (
    <Card title="My Liquidity Pools">
      <Table columns={columns} dataSource={dataSource}></Table>
    </Card>
  )
}
