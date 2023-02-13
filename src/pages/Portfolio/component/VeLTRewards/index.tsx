import { ButtonPrimary } from 'components/Button'
import Table from 'components/Table'
import Tips from 'components/Tips'
import React from 'react'
import Card from '../Card'
import TitleTips from '../TitleTips'

import './index.scss'

function Empty() {
  return (
    <div className="velt-rewards-empty">
      <div className="velt-rewards-empty-title">Lock LT to get veLT and gain more investment income</div>
      <div className="velt-rewards-empty-button">
        <ButtonPrimary>Get veLT</ButtonPrimary>
      </div>
      <div className="velt-rewards-empty-more">
        Learn more about veLT
        <i className="iconfont">&#xe619;</i>
      </div>
    </div>
  )
}

export default function VeLTRewards() {
  return (
    <div className="velt-rewards-wrap">
      <Card>
        <div className="velt-rewards-title">
          <TitleTips
            link=""
            title="veLT Rewards"
            desc="veLT holders will receive 25% of all agreed fee income as an reward, as well as a portion of the Gomboc
              fee income during the voting period if they participate in the weighted vote of a Gomboc."
          />
        </div>
        {false ? (
          <Empty />
        ) : (
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
            <Table title={() => 'My List'} />
          </>
        )}
      </Card>
    </div>
  )
}
