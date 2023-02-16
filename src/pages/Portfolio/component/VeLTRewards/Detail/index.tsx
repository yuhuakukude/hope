// import PortfolioApi, { DetailInfo } from 'api/portfolio.api'
import Tips from 'components/Tips'
// import { useActiveWeb3React } from 'hooks'
import React from 'react'
import { formatDate, getDateForLastOccurence } from 'utils/format'
import { ButtonPrimary } from 'components/Button'

const diffTime = getDateForLastOccurence('Thurs')
export const endTimestamp = (diffTime.getTime() / 1000) | 0
export const startTimestamp = ((diffTime.getTime() - 1000 * 60 * 60 * 24 * 7) / 1000) | 0

interface DetailProps {
  withdrawAll: () => void
  overviewData: any
}

export default function Detail({ withdrawAll, overviewData }: DetailProps) {
  return (
    <>
      <div className="velt-rewards-warning">
        <i className="iconfont">&#xe61e;</i>
        <span className="velt-rewards-warning-desc">
          Your lock expires soon. You need to lock at least for two weeks in
        </span>
        <span className="velt-rewards-warning-locker"> Locker</span>
      </div>
      <div className="velt-rewards-desc">Last Period Overview</div>
      <div className="velt-rewards-card">
        <div className="velt-rewards-list">
          <div className="velt-rewards-item">
            <div className="velt-rewards-item-title">Platform Fees Gain</div>
            <div className="velt-rewards-item-amount">≈ ${overviewData.withdrawable} </div>
            <div className="velt-rewards-item-date">
              Period : {formatDate(startTimestamp, 'MM-DD')} ~ {formatDate(endTimestamp, 'MM-DD')}
            </div>
          </div>
          <div className="velt-rewards-item">
            <div className="velt-rewards-item-title">Belongs to veLT</div>
            <div className="velt-rewards-item-amount">≈ {overviewData.belongsToVeLT} stHOPE</div>
          </div>
          <div className="velt-rewards-item">
            <div className="velt-rewards-item-title">Belongs to me</div>
            <div className="velt-rewards-item-amount">≈ ${overviewData.belongsToMe} stHOPE</div>
            <div className="velt-rewards-item-date">≈ ~ $10,123,456,789.00</div>
          </div>
        </div>
        <div className="velt-rewards-bottom flex ai-center">
          <div className="velt-rewards-bottom-left">
            <span className="velt-rewards-bottom-title">My Collected & Withdrawable</span>
            <span className="velt-rewards-bottom-question">
              <Tips title="test" />
            </span>
            <span className="velt-rewards-bottom-amount">: 10,123,456,789.00 stHOPE</span>
          </div>
          <div className="velt-rewards-bottom-right flex jc-end">
            <ButtonPrimary className="hp-button-primary" onClick={withdrawAll}>
              Withdraw Collected
            </ButtonPrimary>
            {/* <div className="velt-rewards-bottom-button2">Withdraw Collected</div> */}
          </div>
        </div>
      </div>
    </>
  )
}
