import React from 'react'
import { Tooltip } from 'antd'
// import { TooltipProps } from 'antd/lib/tooltip'
import './index.scss'

export default function Tips() {
  const titleNode = () => {
    return (
      <div>
        <h3 className="font-white font-bold m-b-10 font-14">About Deposit</h3>
        <p className="font-white lh15 m-b-10 font-12">
          When you add liquidity, you will receive pool tokens (LP tokens) representing your position. These tokens
          automatically earn fees proportional to your share of the pool, and can be withdrawn anytime.
        </p>
        <p className="font-white lh15 m-b-10 font-12">
          By adding liquidity, you'll earn 50% of all fees specified in the pool, proportional to your share of the
          pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.
        </p>
        <h3 className="font-white font-bold m-b-10 font-14">About Deposit</h3>
        <p className="font-white lh15 font-12">
          Removing pool tokens converts your position back into underlying tokens at the current rate, proportional to your share of the pool. Accrued fees are included in the amounts you receive.
        </p>
      </div>
    )
  }
  return (
    <Tooltip placement="rightTop" overlayClassName="tips-liq" title={titleNode}>
      <i className="iconfont font-24 hope-icon-common p-2 m-l-5 cursor-select">&#xe631;</i>
      {/* <Info className="font-16 cursor-select tips-circle m-l-10 font-bold" size={18} /> */}
      {/* <i className="iconfont font-16 cursor-select tips-circle m-l-10 font-bold">&#xe620;</i> */}
    </Tooltip>
  )
}

export function StakingTips() {
  const titleNode = () => {
    return (
      <div>
        <h3 className="font-white font-bold m-b-10 font-14">Stake</h3>
        <p className="font-white lh15 m-b-10 font-12">
          Stake your LP tokens to receive farming rewards on top of your pool fee shares.
        </p>
        <h3 className="font-white font-bold m-b-10 font-14">Unstake</h3>
        <p className="font-white lh15 font-12">
          You will no longer receive farming rewards once you unstake all your LP tokens.
        </p>
      </div>
    )
  }
  return (
    <Tooltip placement="rightTop" overlayClassName="tips-liq" title={titleNode}>
      <i className="iconfont font-24 hope-icon-common p-2 m-l-5 cursor-select">&#xe631;</i>
    </Tooltip>
  )
}
