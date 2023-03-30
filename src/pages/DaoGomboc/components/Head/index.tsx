import React from 'react'
import './index.scss'
import headImg1 from '../../../../assets/images/ahp/icon-gom1.png'
import headImg2 from '../../../../assets/images/ahp/icon-gom2.png'
import headImg3 from '../../../../assets/images/ahp/icon-gom3.png'
import headImg4 from '../../../../assets/images/ahp/icon-gom4.png'
import Button from 'components/antd/Button'
import { DOCS_URL } from 'constants/config'
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
          <h2 className="text-white font-bolder font-28">How to maximize my LT rewards?</h2>
          <p className="text-white lh15 m-t-15 font-nor">
            The distribution of LT rewards within the HOPE ecosystem is governed by Gauge Weights, which are determined
            by veLT voting.
          </p>
          <p className="text-white lh15 m-t-5 font-nor">
            You can also get a 2.5x farming rewards booster when you lock your LT for veLT.
          </p>
          <Button
            type="link"
            onClick={() => {
              window.open(DOCS_URL['GombocWeights'])!.opener = null
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
            <p className="text-center text-white m-t-30">Get Boosted</p>
          </div>
          <div className="flex-1">
            <div className="flex jc-center">
              <img className="head-img" src={headImg4} alt="" />
            </div>
            <p className="text-center text-white m-t-30">Claim Anytime</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Head
