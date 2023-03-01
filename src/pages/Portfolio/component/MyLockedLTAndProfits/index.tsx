import Button from 'components/antd/Button'
import Table from 'components/antd/Table'
import Tips from 'components/Tips'
import React, { useState, useEffect } from 'react'
import Card from '../Card'
import Item from '../Item'
import SelectTips, { TitleTipsProps } from '../SelectTips'
import { useLocker } from '../../../../hooks/ahp/useLocker'
import format from '../../../../utils/format'
import { useActiveWeb3React } from '../../../../hooks'
import { useTokenBalance } from '../../../../state/wallet/hooks'
import { VELT } from '../../../../constants'
import { JSBI, Percent } from '@uniswap/sdk'

import './index.scss'

const columns = [
  {
    title: 'Gömböc',
    dataIndex: 'Protocol',
    key: 'Protocol'
  },
  {
    title: 'Composition',
    dataIndex: 'boost',
    key: 'boost',
    render: (text: string, record: any) => {
      return record.a ? (
        <>
          <i className="iconfont"></i>
          {record.b}
        </>
      ) : (
        <Item
          type={2}
          title={
            <>
              <i className="iconfont"></i>
              {record.b}
            </>
          }
          desc={
            <>
              <i className="iconfont"></i>
              {record.b}
            </>
          }
        />
      )
    }
  },
  {
    title: 'Allocated Votes',
    dataIndex: 'balance',
    key: 'balance',
    render: (text: string, record: any) => {
      return <Item type={2} title={text} desc={record.balance} />
    }
  },
  {
    title: (
      <>
        veLT Voting Balance{' '}
        <span className="title-button" onClick={() => {}}>
          Refresh All
        </span>
      </>
    ),
    dataIndex: 'unstaking',
    key: 'unstaking',
    render: (text: string, record: any) => {
      return <Item type={2} title={text} desc={record.unstaking} />
    }
  },
  {
    title: (
      <>
        Voting Rewards
        <i className="iconfont title-button" onClick={() => {}}>
          &#xe60a;
        </i>
      </>
    ),
    dataIndex: 'unstaked',
    key: 'unstaked',
    render: (text: string, record: any) => {
      return <Item type={2} title={text} desc={record.unstaked} />
    }
  },

  {
    title: 'Actions',
    dataIndex: 'actions',
    key: 'actions',
    render: () => {
      const options: TitleTipsProps[] = [
        {
          label: 'Claim Voting Rewards',
          value: 'Claim Voting Rewards',
          onClick: () => {}
        },
        {
          label: 'Refresh Voting Balance',
          value: 'Refresh Voting Balance',
          onClick: () => {}
        },
        {
          label: 'Pool Details',
          value: 'Pool Details',
          onClick: () => {}
        }
      ]
      return <SelectTips options={options} />
    }
  }
]
export default function MyLockedLTAndProfits() {
  const { account, chainId } = useActiveWeb3React()
  const { lockerRes, votePowerAmount } = useLocker()
  const veltBalance = useTokenBalance(account ?? undefined, VELT[chainId ?? 1])

  const [unUseRateVal, setUnUseRateVal] = useState<string>('')

  useEffect(() => {
    if (votePowerAmount || votePowerAmount === 0) {
      const total = JSBI.BigInt(10000)
      const apo = JSBI.BigInt(votePowerAmount)
      const unUseVal = JSBI.subtract(total, apo)
      const ra = new Percent(unUseVal, JSBI.BigInt(10000))
      if (ra.toFixed(2) && Number(ra.toFixed(2)) > 0) {
        setUnUseRateVal(ra.toFixed(2))
      }
    }
  }, [votePowerAmount, veltBalance, account])

  return (
    <Card title="My Locked LT & Profits">
      <div className="my-locked-lt-content">
        <div className="my-locked-lt-row">
          <div className="my-locked-lt-col">
            <div className="my-locked-lt-title">Locked LT Amount</div>
            <div className="my-locked-lt-desc">
              <span className="my-locked-lt-value">
                ≈ {lockerRes?.amount ? lockerRes?.amount.toFixed(2, { groupSeparator: ',' } ?? '0.00') : '0.00'}
              </span>
              <span className="my-locked-lt-value2">
                Locked Until: {format.formatUTCDate(Number(`${lockerRes?.end}`), 'YYYY-MM-DD')}
              </span>
            </div>
          </div>
          <div className="my-locked-lt-col">
            <div className="my-locked-lt-title">Balance in Voting Escrow</div>
            <div className="my-locked-lt-desc">
              <span className="my-locked-lt-value">
                ≈ {veltBalance?.toFixed(2, { groupSeparator: ',' } ?? '0.00', 0) || '0.00'} veLT
              </span>
              <span className="my-locked-lt-value2">{unUseRateVal || '0.00'}% share of total</span>
            </div>
            <Button className="my-locked-lt-button" type="ghost">
              Increase veLT
            </Button>
          </div>
        </div>
        <div className="my-locked-lt-row2">
          <div className="my-locked-lt-col">
            <div className="my-locked-lt-title">
              Claimable veLT Held Fees <Tips title="Claimable veLT Held Fees Tips"></Tips>
            </div>
            <div className="my-locked-lt-desc">
              <span className="my-locked-lt-value">≈ 123,456,789.00 stHOPE</span>
              <span className="my-locked-lt-value2">≈ $123,456,789.00</span>
            </div>
            <Button className="my-locked-lt-button" type="ghost">
              Claim All
            </Button>
          </div>
          <div className="my-locked-lt-col">
            <div className="my-locked-lt-title">
              Claimable veLT voting Fees <Tips title="Claimable veLT Held Fees Tips"></Tips>
            </div>
            <div className="my-locked-lt-desc">
              <span className="my-locked-lt-value">≈ 123,456,789.00 stHOPE</span>
              <span className="my-locked-lt-value2">≈ $123,456,789.00</span>
            </div>
            <Button className="my-locked-lt-button" type="ghost">
              Claim All
            </Button>
          </div>
        </div>
      </div>
      <Table columns={columns} pagination={{ total: 500 }}></Table>
    </Card>
  )
}
