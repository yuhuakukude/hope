// import PortfolioApi, { DetailInfo } from 'api/portfolio.api'
import Tips from 'components/Tips'
// import { useActiveWeb3React } from 'hooks'
import React, { useMemo } from 'react'
import { formatDate, getDateForLastOccurence, amountFormat } from 'utils/format'
import { ButtonOutlined } from 'components/Button'
import { toUsdPrice } from '../../../../../hooks/ahp/usePortfolio'
import { NavLink } from 'react-router-dom'
import { useLocker } from 'hooks/ahp/useLocker'
import format from 'utils/format'
import moment from 'moment'
import { DetailInfo } from 'api/portfolio.api'

const diffTime = getDateForLastOccurence('Thurs')
export const endTimestamp = (diffTime.getTime() / 1000) | 0
export const startTimestamp = ((diffTime.getTime() - 1000 * 60 * 60 * 24 * 7) / 1000) | 0

interface DetailProps {
  withdrawAll: () => void
  overviewData: DetailInfo
  hopePrice: string
  platformFees: string
}

export default function Detail({ withdrawAll, overviewData, hopePrice, platformFees }: DetailProps) {
  const { lockerRes } = useLocker()
  const isShowTip = useMemo(() => {
    const lockerEndDate = lockerRes?.end
    if (!lockerEndDate || lockerEndDate === '--') {
      return false
    }
    return moment(format.formatDate(Number(`${lockerEndDate}`))).diff(moment(), 'days') < 14
  }, [lockerRes])
  return (
    <>
      {isShowTip && (
        <div className="flex m-t-30 ai-center">
          <i className="text-primary iconfont m-r-5 font-14">&#xe61e;</i>
          <p className="text-white lh15">
            Your lock expires soon. You need to lock at least for two weeks in
            <NavLink to={'/dao/locker'}>
              <span className="text-primary"> Locker </span>
            </NavLink>
          </p>
        </div>
      )}
      <div className="velt-rewards-desc">Last Period Overview</div>
      <div className="velt-rewards-card">
        <div className="velt-rewards-list">
          <div className="velt-rewards-item">
            <div className="velt-rewards-item-title">Platform Fees Gain</div>
            <div className="velt-rewards-item-amount">≈ ${amountFormat(platformFees, 2)} </div>
            <div className="velt-rewards-item-date">
              Period : {formatDate(startTimestamp, 'MM-DD')} ~ {formatDate(endTimestamp, 'MM-DD')}
            </div>
          </div>
          <div className="velt-rewards-item">
            <div className="velt-rewards-item-title">Belongs to veLT</div>
            <div className="velt-rewards-item-amount">≈ {amountFormat(overviewData.belongsToVeLT, 2)} stHOPE</div>
          </div>
          <div className="velt-rewards-item">
            <div className="velt-rewards-item-title">Belongs to me</div>
            <div className="velt-rewards-item-amount">≈ {amountFormat(overviewData.belongsToMe, 2)} stHOPE</div>
            <div className="velt-rewards-item-date">≈ ~ ${toUsdPrice(overviewData.belongsToMe, hopePrice) || '--'}</div>
          </div>
        </div>
        <div className="velt-rewards-bottom flex ai-center">
          <div className="velt-rewards-bottom-left">
            <span className="velt-rewards-bottom-title">My Collected & Withdrawable</span>
            <span className="velt-rewards-bottom-question">
              <Tips title="test" />
            </span>
            <span className="velt-rewards-bottom-amount">: {amountFormat(overviewData.withdrawable, 2)} stHOPE</span>
          </div>
          <div className="velt-rewards-bottom-right flex jc-end">
            <ButtonOutlined
              disabled={
                !overviewData.withdrawable || (!!overviewData.withdrawable && Number(overviewData.withdrawable) <= 0)
              }
              className="velt-rewards-bottom-button2"
              onClick={withdrawAll}
            >
              Withdraw Collected
            </ButtonOutlined>
            {/* <div className="velt-rewards-bottom-button2">Withdraw Collected</div> */}
          </div>
        </div>
      </div>
    </>
  )
}
