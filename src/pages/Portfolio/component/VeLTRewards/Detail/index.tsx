import PortfolioApi from 'api/portfolio.api'
import Tips from 'components/Tips'
import React, { useCallback, useEffect, useState } from 'react'

export default function Empty() {
  const [overviewData, setOverviewData] = useState({})
  console.log(overviewData)
  async function initOverview() {
    try {
      const res = await PortfolioApi.getRewardsOverview({})
      if (res && res.result) {
        setOverviewData(res.result)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const init = useCallback(async () => {
    await initOverview()
  }, [])

  useEffect(() => {
    init()
  }, [init])

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
            <div className="velt-rewards-item-amount">≈ $523,456,789.00 </div>
            <div className="velt-rewards-item-date">Period : 01-09 ~ 01-16</div>
          </div>
          <div className="velt-rewards-item">
            <div className="velt-rewards-item-title">Belongs to veLT</div>
            <div className="velt-rewards-item-amount">≈ 101,123,273.45 stHOPE</div>
          </div>
          <div className="velt-rewards-item">
            <div className="velt-rewards-item-title">Belongs to me</div>
            <div className="velt-rewards-item-amount">≈ 202,123,456.09 stHOPE</div>
            <div className="velt-rewards-item-date">≈ ~ $10,123,456,789.00</div>
          </div>
        </div>
        <div className="velt-rewards-bottom">
          <div className="velt-rewards-bottom-left">
            <span className="velt-rewards-bottom-title">My Collected & Withdrawable</span>
            <span className="velt-rewards-bottom-question">
              <Tips title="test" />
            </span>
            <span className="velt-rewards-bottom-amount">: 10,123,456,789.00 stHOPE</span>
          </div>
          <div className="velt-rewards-bottom-right">
            <div className="velt-rewards-bottom-button">Collect All Fees</div>
            <div className="velt-rewards-bottom-hover">
              <span className="velt-rewards-bottom-hover-line"></span>
              <span className="velt-rewards-bottom-hover-text">hover</span>
            </div>
            <div className="velt-rewards-bottom-button2">Withdraw Collected</div>
          </div>
        </div>
      </div>
    </>
  )
}
