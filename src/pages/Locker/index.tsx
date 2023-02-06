import React from 'react'
import styled from 'styled-components'
import { NavLink } from 'react-router-dom'
import { AutoColumn } from '../../components/Column'
import LockerEcharts from './component/echarts'
import './index.scss'
const PageWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 30px;
`

export default function DaoLocker() {
  return (
    <>
      <PageWrapper>
        <div className="dao-locker-page">
          <div className="banner p-30">
            <h2 className="text-medium">Lock your LT to acquire veLT</h2>
            <p className="font-nor m-t-20">
              Extra earnings & voting power{' '}
              <NavLink to={'/buy-hope'} className="link text-primary m-l-20">
                Learn more <i className="iconfont">&#xe619;</i>{' '}
              </NavLink>
            </p>
            <ul className="m-t-20">
              <li className="font-nor">- Boost liquidity mining yield up to 2.5x</li>
              <li className="font-nor">- Vote to direct liquidity mining emissions</li>
              <li className="font-nor">- Earn your share of protocol revenue</li>
            </ul>
          </div>
          <div className="tip-box flex ai-center jc-center m-t-30">
            <i className="iconfont text-primary">&#xe61e;</i>
            <p className="font-nor text-normal m-l-12">
              Your lock expires soon. You need to lock at least for two weeks in{' '}
              <a href="#getVeLt" className="text-primary">
                Locker
              </a>
            </p>
          </div>
          <div className="content-box m-t-30" id="getVeLt">
            <h3 className="text-medium font-20">My veLT</h3>
            <div className="card-box m-t-30 flex jc-between">
              <div className="item p-30">
                <p className="font-nor text-normal">My LT Balance</p>
                <p className="font-20 m-t-20 text-medium">1,023,456,789.12 LT</p>
                <p className="font-nor text-normal m-t-16">≈ $102,345.92</p>
              </div>
              <div className="item p-30">
                <p className="font-nor text-normal">My Locked LT Amount</p>
                <p className="font-20 m-t-20 text-medium">1,023,456,789.12 LT</p>
                <p className="font-nor text-normal m-t-16">≈ $102,345.92</p>
                <NavLink to={'/buy-hope'} className="link-btn text-medium text-primary font-12 m-t-20">
                  Withdraw
                </NavLink>
              </div>
              <div className="item p-30 flex jc-between">
                <div className="-l">
                  <p className="font-nor text-normal">My veLT Amount</p>
                  <p className="font-20 m-t-20 text-medium">123,456,789.12 veLT</p>
                  <p className="font-nor text-normal m-t-16">unallocated:</p>
                  <p className="font-nor text-normal m-t-12">123,456,789.12 (100.00%)</p>
                </div>
                <div className="-r m-l-20 flex ai-center">
                  <i className="iconfont font-20 cursor-select text-primary">&#xe621;</i>
                </div>
              </div>
              <div className="item p-30 flex jc-between">
                <div className="-l">
                  <p className="font-nor text-normal">Locked Until (UTC)</p>
                  <p className="font-20 m-t-20 text-medium">2024-09-10 00:00:00 </p>
                  <p className="font-nor text-normal m-t-16">Max increase: 202 weeks</p>
                </div>
                <div className="-r m-l-20 flex ai-center">
                  <i className="iconfont font-20 cursor-select text-primary">&#xe621;</i>
                </div>
              </div>
            </div>
            <div className="action-box m-t-30 flex jc-between">
              <div className="l flex-3 p-30">
                <LockerEcharts></LockerEcharts>
              </div>
              <div className="r m-l-30 flex-2 p-30"></div>
            </div>
          </div>
        </div>
      </PageWrapper>
    </>
  )
}
