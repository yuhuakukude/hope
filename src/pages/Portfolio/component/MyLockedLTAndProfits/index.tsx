import Button from 'components/antd/Button'
import Tips from 'components/Tips'
import React, { useState, useEffect } from 'react'
import Card from '../Card'
import { useLocker } from '../../../../hooks/ahp/useLocker'
import { usePortfolio, toUsdPrice } from '../../../../hooks/ahp/usePortfolio'
import format from '../../../../utils/format'
import { useActiveWeb3React } from '../../../../hooks'
import { useTokenBalance } from '../../../../state/wallet/hooks'
import { VELT } from '../../../../constants'
import { JSBI, Percent } from '@uniswap/sdk'
import usePrice from 'hooks/usePrice'
import VotedList from '../../../../components/ahp/VotedList'

import './index.scss'

export default function MyLockedLTAndProfits() {
  const { account, chainId } = useActiveWeb3React()
  const { lockerRes, votePowerAmount } = useLocker()
  const { claimableFees } = usePortfolio()
  const hopePrice = usePrice()
  const veltBalance = useTokenBalance(account ?? undefined, VELT[chainId ?? 1])

  const [unUseRateVal, setUnUseRateVal] = useState<string>('')
  const [votingFee, setVotingFee] = useState<any>({ stHope: '0.00', toUsd: '0.00' })

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

  const getVotingRewards = (stHope: string, toUsd: string) => {
    setVotingFee({ stHope, toUsd })
  }

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
              <span className="my-locked-lt-value">
                ≈ {claimableFees?.toFixed(2, { groupSeparator: ',' } ?? '0.00') || '0.00'} stHOPE
              </span>
              <span className="my-locked-lt-value2">≈ ${toUsdPrice(claimableFees?.toFixed(2), hopePrice) || '--'}</span>
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
              <span className="my-locked-lt-value">≈ {votingFee.stHope} stHOPE</span>
              <span className="my-locked-lt-value2">≈ ${votingFee.toUsd}</span>
            </div>
            <Button className="my-locked-lt-button" type="ghost">
              Claim All
            </Button>
          </div>
        </div>
      </div>
      <VotedList getVotingRewards={getVotingRewards}></VotedList>
    </Card>
  )
}
