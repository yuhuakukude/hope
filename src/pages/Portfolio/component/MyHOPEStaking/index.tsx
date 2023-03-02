import Table from 'components/antd/Table'
import { useActiveWeb3React } from 'hooks'
import { toUsdPrice } from 'hooks/ahp/usePortfolio'
import { useStaking } from 'hooks/ahp/useStaking'
import usePrice from 'hooks/usePrice'
import React, { useCallback, useState } from 'react'
import { useTokenBalance } from 'state/wallet/hooks'
import Card from '../Card'
import Item from '../Item'
import SelectTips, { TitleTipsProps } from '../SelectTips'
import { usePoolGomContract } from 'hooks/useContract'
import { useSingleCallResult } from 'state/multicall/hooks'
import { CurrencyAmount, TokenAmount } from '@uniswap/sdk'

import { useHistory } from 'react-router-dom'

import { STAKING_HOPE_GOMBOC_ADDRESS, ST_HOPE } from '../../../../constants'
import ClaimRewards from '../ClaimRewards'

import './index.scss'
import { ITableItem } from 'components/ahp/GombocClaim'

interface IStaking {
  stHOPE: string
  unstaking: string
  claRewards: string
  unstaked: string
  usdOfStHOPE: string
  boost: string
  usdOfUnstaking: string
  usdOfClaRewards: string
  usdOfUnstaked: string
}

function getUsdPrice(hopePrice: string, price?: TokenAmount | CurrencyAmount) {
  if (!price) {
    return '--'
  }

  return '≈$' + toUsdPrice(price.toFixed(2), hopePrice)
}

function formatPrice(name: string, price?: TokenAmount | CurrencyAmount) {
  if (!price) {
    return '--'
  }
  return `${price?.toFixed(2, { groupSeparator: ',' })} ${name}`
}
export default function MyHOPEStaking() {
  const { unstakedVal, claRewards, unstakingVal } = useStaking()
  const { account, chainId } = useActiveWeb3React()
  const hopePrice = usePrice()
  const stBalance = useTokenBalance(account ?? undefined, ST_HOPE[chainId ?? 1])
  const poolGomContract = usePoolGomContract(STAKING_HOPE_GOMBOC_ADDRESS[chainId ?? 1])
  const _bu = useSingleCallResult(poolGomContract, 'workingBalances', [account ?? undefined])
  const _i = useSingleCallResult(poolGomContract, 'lpBalanceOf', [account ?? undefined])
  const bu = _bu?.result ? CurrencyAmount.ether(_bu?.result?.[0]) : undefined
  const i = _i?.result ? CurrencyAmount.ether(_i?.result?.[0]) : undefined
  let boost = '-'
  if (bu && i) {
    boost = (Number(bu?.toExact()) / (Number(i?.toExact()) * 0.4)).toFixed(2)
  }

  const [item, setItem] = useState<ITableItem | null>(null)
  const data: IStaking = {
    boost,
    stHOPE: formatPrice('stHOPE', stBalance),
    usdOfStHOPE: getUsdPrice(hopePrice, stBalance),
    unstaking: formatPrice('stHOPE', unstakingVal),
    usdOfUnstaking: getUsdPrice(hopePrice, unstakingVal),
    claRewards: formatPrice('LT', claRewards),
    usdOfClaRewards: getUsdPrice(hopePrice, claRewards),
    unstaked: formatPrice('HOPE', unstakedVal),
    usdOfUnstaked: getUsdPrice(hopePrice, unstakedVal)
  }
  const history = useHistory()

  const columns = [
    {
      title: 'Protocol',
      dataIndex: 'Protocol',
      key: 'Protocol',
      render: () => 'HOPE Staking'
    },
    {
      title: 'My Boost',
      dataIndex: 'boost',
      key: 'boost'
    },
    {
      title: 'Balance',
      dataIndex: 'stHOPE',
      key: 'stHOPE',
      render: (text: string, record: IStaking) => {
        return <Item title={record.stHOPE} desc={record.usdOfStHOPE} />
      }
    },
    {
      title: 'Unstaking',
      dataIndex: 'unstaking',
      key: 'unstaking',
      render: (text: string, record: IStaking) => {
        return <Item title={record.unstaking} desc={record.usdOfUnstaking} />
      }
    },
    {
      title: 'Unstaked',
      dataIndex: 'unstaked',
      key: 'unstaked',
      render: (text: string, record: IStaking) => {
        return <Item title={record.unstaked} desc={record.usdOfUnstaked} />
      }
    },
    {
      title: 'Claimable Rewards',
      dataIndex: 'claRewards',
      key: 'claRewards',
      render: (text: string, record: IStaking) => {
        return <Item title={record.claRewards} desc={record.usdOfClaRewards} />
      }
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
      render: (text: string, record: IStaking) => {
        const options: TitleTipsProps[] = [
          {
            label: 'Stake',
            value: 'Stake',
            onClick: () => {
              history.push(`/staking`)
            }
          },
          {
            label: 'Unstake',
            value: 'Unstake',
            onClick: () => {
              history.push(`/staking`)
            }
          },
          {
            label: 'Claim Rewards',
            value: 'Claim Rewards',
            onClick: () => {
              // TODO
              setItem({
                ltOfReward: '',
                rewardSymbol: '',
                usdOfReward: '',
                usdOfTotalReward: 0
              })
            }
          },
          {
            label: 'Yield Boost',
            value: 'Yield Boost',
            onClick: () => {
              history.push(`/dao/gomboc?gomboc=${1}`) // TODO Sure
            }
          }
        ]
        return <SelectTips options={options} />
      }
    }
  ]

  const clearItem = useCallback(() => setItem(null), [])

  return (
    <>
      <ClaimRewards item={item} clearItem={clearItem} />
      <Card title="My HOPE Staking">
        <Table className="my-hope-staking-wrap" columns={columns} dataSource={[data]} pagination={false}></Table>
      </Card>
    </>
  )
}
