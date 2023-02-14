import React from 'react'

export default function FeesCollection() {
  return (
    <div className="fees-collection-wrap">
      <div className="fees-collection-desc">
        <i className="iconfont">&#xe61e;</i>
        The collectable fees may not be sufficient to cover the transaction gas fee.
      </div>
      <div className="fees-collection-box">
        <div className="fees-collection-title">Total Rewards</div>
        <div className="fees-collection-value">LT-USDT</div>
      </div>
      <div className="fees-collection-box">
        <div className="fees-collection-title">Period</div>
        <div className="fees-collection-value">2023-01-20 ~2023-02-12</div>
      </div>
      <div className="fees-collection-box">
        <div className="fees-collection-title">Collectable Fees</div>
        <div className="fees-collection-value">9.123456 LT-USDT LP</div>
        <div className="fees-collection-other">~ $89.00</div>
      </div>
      <div className="fees-collection-box">
        <div className="fees-collection-title">Estimate Receive</div>
        <div className="fees-collection-value">89.12 stHOPE</div>
      </div>
      <div className="fees-collection-box">
        <div className="fees-collection-title">Collection Gas Fee</div>
        <div className="fees-collection-value">0.0101 ETH</div>
        <div className="fees-collection-other">~ $89.00</div>
      </div>
    </div>
  )
}
