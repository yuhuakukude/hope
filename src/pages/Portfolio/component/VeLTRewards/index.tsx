import Table from 'components/Table'
import React from 'react'
import Card from '../Card'

import './index.scss'

export default function VeLTRewards() {
  return (
    <div className="velt-rewards-wrap">
      <Card>
        <div className="velt-rewards-title">veLT Rewards</div>
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
              <div className="velt-rewards-item-date">Collected : ≈ $ 223,456,789.00 </div>
              <div className="velt-rewards-item-date">Uncollected : ≈ $ 300,456,789.00 </div>
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
              <span className="velt-rewards-bottom-question"></span>
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
        <Table title={() => 'Last Period Overview'} />
      </Card>
    </div>
  )
}
