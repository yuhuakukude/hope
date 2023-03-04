import React from 'react'
import { Tooltip } from 'antd'
// import { TooltipProps } from 'antd/lib/tooltip'
import { Info } from 'react-feather'
import './index.scss'

export default function Tips() {
  const titleNode = () => {
    return (
      <div>
        <h3 className="font-white font-bold m-b-10 font-14">About Deposit</h3>
        <p className="font-white lh15 m-b-10 font-12">
          When you add liquidity, you will receive pool tokens representing your position. These tokens automatically
          earn fees proportional to your share of the pool, and can be redeemed at any time.
        </p>
        <p className="font-white lh15 m-b-10 font-12">
          By adding liquidity you{`'`}ll earn 0.3% of all trades on this pair proportional to your share of the pool.
          Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.
        </p>
        <h3 className="font-white font-bold m-b-10 font-14">About Deposit</h3>
        <p className="font-white lh15 font-12">
          When you add liquidity, you will receive pool tokens representing your position. These tokens automatically
          earn fees proportional to your share of the pool, and can be redeemed at any time.
        </p>
      </div>
    )
  }
  return (
    <Tooltip placement="rightTop" overlayClassName="tips-liq" title={titleNode}>
      <Info className="font-16 cursor-select tips-circle m-l-10 font-bold" size={18} />
      {/* <i className="iconfont font-16 cursor-select tips-circle m-l-10 font-bold">&#xe620;</i> */}
    </Tooltip>
  )
}