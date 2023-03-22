import Table from 'components/antd/Table'
import { useActiveWeb3React } from 'hooks'
import { toUsdPrice } from 'hooks/ahp/usePortfolio'
import { useStaking } from 'hooks/ahp/useStaking'
import React, { useState, useCallback, useMemo } from 'react'
import Card from '../Card'
import Item from '../Item'
import SelectTips, { TitleTipsProps } from '../SelectTips'
import { CurrencyAmount, TokenAmount } from '@uniswap/sdk'
import { ButtonPrimary } from '../../../../components/Button'
import { Link } from 'react-router-dom'
import { useHistory } from 'react-router-dom'

import HopeStakingClaim from '../ClaimRewards/hopeStakingClaim'
import { usePairStakeInfo } from 'hooks/usePairInfo'
import { useTokenPriceObject } from '../../../../hooks/liquidity/useBasePairs'
import './index.scss'
import { DOCS_URL } from 'constants/config'
import { getHopeTokenAddress, getLTTokenAddress, getStakingHopeGaugeAddress } from 'utils/addressHelpers'

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

function toUsdPriceOfHope(hopePrice: string, price?: TokenAmount | CurrencyAmount) {
  if (!price) {
    return 0
  }
  return toUsdPrice(price.toFixed(2), hopePrice)
}

function getUsdPrice(hopePrice: string, price?: TokenAmount | CurrencyAmount) {
  if (!price) {
    return '--'
  }
  return '≈$' + toUsdPriceOfHope(hopePrice, price)
}

function formatPrice(name: string, price?: TokenAmount | CurrencyAmount) {
  if (!price) {
    return '--'
  }
  return `${price?.toFixed(2, { groupSeparator: ',' })} ${name}`
}
export default function MyHOPEStaking() {
  const { stakedVal, unstakedVal, claRewards, unstakingVal } = useStaking()
  const { chainId } = useActiveWeb3React()
  const [item, setItem] = useState(false)
  const stakingAddr = useMemo(() => `${getStakingHopeGaugeAddress(chainId)}`.toLocaleLowerCase(), [chainId])
  const { currentBoots } = usePairStakeInfo(stakingAddr)
  const addresses = useMemo(() => {
    return [
      getStakingHopeGaugeAddress(chainId) ?? '',
      getLTTokenAddress(chainId) ?? '',
      getHopeTokenAddress(chainId) ?? ''
    ]
  }, [chainId])
  const { result: priceResult } = useTokenPriceObject(addresses)
  const hopePrice = useMemo(() => {
    let pr = '0'
    if (getHopeTokenAddress(chainId) && priceResult) {
      pr = priceResult[`${getHopeTokenAddress(chainId)}`.toLocaleLowerCase()]
    }
    return pr
  }, [chainId, priceResult])
  const stHopePrice = useMemo(() => {
    let pr = '0'
    if (stakingAddr && priceResult) {
      pr = priceResult[stakingAddr]
    }
    return pr
  }, [priceResult, stakingAddr])
  const lpPrice = useMemo(() => {
    let pr = '0'
    if (getLTTokenAddress(chainId) && priceResult) {
      pr = priceResult[`${getLTTokenAddress(chainId)}`.toLocaleLowerCase()]
    }
    return pr
  }, [chainId, priceResult])
  const data: IStaking = {
    boost: currentBoots ? currentBoots.toFixed(2) : '--',
    stHOPE: formatPrice('stHOPE', stakedVal),
    usdOfStHOPE: getUsdPrice(stHopePrice, stakedVal),
    unstaking: formatPrice('stHOPE', unstakingVal),
    usdOfUnstaking: getUsdPrice(stHopePrice, unstakingVal),
    claRewards: formatPrice('LT', claRewards),
    usdOfClaRewards: getUsdPrice(lpPrice, claRewards),
    unstaked: formatPrice('HOPE', unstakedVal),
    usdOfUnstaked: getUsdPrice(hopePrice, unstakedVal)
  }
  const history = useHistory()

  const clearItem = useCallback(() => setItem(false), [])

  const columns: any = [
    {
      title: 'Protocol',
      dataIndex: 'Protocol',
      key: 'Protocol',
      render: () => 'HOPE Staking'
    },
    {
      title: 'My Boost',
      dataIndex: 'boost',
      key: 'boost',
      render: (text: string) => {
        return `${text}x`
      }
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
      width: 120,
      align: 'center',
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
            isHide: Number(stakedVal?.toFixed(8)) <= 0,
            onClick: () => {
              history.push(`/staking?type=unstake`)
            }
          },
          {
            label: 'Claim Rewards',
            value: 'Claim Rewards',
            isHide: Number(claRewards?.toFixed(8)) <= 0,
            onClick: () => {
              setItem(true)
            }
          },
          {
            label: 'Yield Boost',
            value: 'Yield Boost',
            onClick: () => {
              history.push(`/dao/locker`) // TODO Sure
            }
          }
        ]
        return <SelectTips options={options} />
      }
    }
  ]

  return (
    <>
      <HopeStakingClaim item={item} clearItem={clearItem} />
      <Card title="My HOPE Staking">
        {data.stHOPE !== '--' ? (
          <Table className="my-hope-staking-wrap" columns={columns} dataSource={[data]} pagination={false}></Table>
        ) : (
          <div className="flex jc-center">
            <div>
              <p className="text-center font-nor">You have no Staked HOPE on Mainnet</p>
              <ButtonPrimary
                padding={'19px 24px'}
                as={Link}
                to={'/hope/staking'}
                style={{ width: '400px', marginTop: '20px' }}
              >
                Staking HOPE
              </ButtonPrimary>
              <a
                href={DOCS_URL['HopeToken']}
                target="_blank"
                rel="noopener noreferrer"
                className="text-center m-t-20 font-nor text-normal flex ai-center jc-center"
              >
                {/* Learn more Url */}
                Learn more about Staking HOPE <i className="iconfont m-l-12">&#xe619;</i>
              </a>
            </div>
          </div>
        )}
      </Card>
    </>
  )
}
