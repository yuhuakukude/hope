import React from 'react'
import './index.scss'
import headImg1 from '../../../../assets/images/ahp/icon-gom1.png'
import headImg2 from '../../../../assets/images/ahp/icon-gom2.png'
import headImg3 from '../../../../assets/images/ahp/icon-gom3.png'
import headImg4 from '../../../../assets/images/ahp/icon-gom4.png'
import Button from 'components/antd/Button'
/**
 *
 * @param props
 *
 */

const Head = () => {
  return (
    <div className="gom-head-box">
      <div className="flex">
        <div className="flex-1 m-r-30">
          <h2 className="text-white font-bolder font-28">How to get liquidity incentives?</h2>
          <p className="text-white lh18 m-t-15">
            Light Protocol liquidity incentives are directed to pools by veLT voters. Stake in these pools to earn
            incentives. Boost with veLT for up to 2.5x extra on pools.
          </p>
          <Button
            type="link"
            onClick={() => {
              window.open(
                'https://docs.hope.money/hope-1/lRGc3srjpd2008mDaMdR/reward-goemboec/goemboec-weights'
              )!.opener = null
            }}
          >
            Learn more
          </Button>
        </div>
        <div className="flex-1 flex ai-center m-l-30">
          <div className="flex-1">
            <div className="flex jc-center">
              <img className="head-img" src={headImg1} alt="" />
            </div>
            <p className="text-center text-white m-t-30">Add Liquidity</p>
          </div>
          <div className="flex-1">
            <div className="flex jc-center">
              <img className="head-img" src={headImg2} alt="" />
            </div>
            <p className="text-center text-white m-t-30">Stake LP Token</p>
          </div>
          <div className="flex-1">
            <div className="flex jc-center">
              <img className="head-img" src={headImg3} alt="" />
            </div>
            <p className="text-center text-white m-t-30">Get a boost</p>
          </div>
          <div className="flex-1">
            <div className="flex jc-center">
              <img className="head-img" src={headImg4} alt="" />
            </div>
            <p className="text-center text-white m-t-30">Claim anytime</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Head
