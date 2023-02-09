import React, { useMemo } from 'react'
import format from '../../../../utils/format'
import moment from 'moment'
import './index.scss'

export default function LockerBanner({
  toLocker,
  lockerEndDate
}: {
  toLocker: () => void
  lockerEndDate: number | string | undefined
}) {
  const isShowTip = useMemo(() => {
    if (!lockerEndDate) {
      return false
    }
    return moment(format.formatDate(Number(`${lockerEndDate}`))).diff(moment(), 'days') < 14
  }, [lockerEndDate])
  return (
    <div className="locker-banner-box">
      <div className="banner p-30">
        <h2 className="text-medium">Lock your LT to acquire veLT</h2>
        <p className="font-nor m-t-20">
          Extra earnings & voting power{' '}
          <a
            href="https://docs.hope.money/light/lRGc3srjpd2008mDaMdR/light-hyfi-applications-roadmap/roadmap"
            target="_blank"
            rel="noopener noreferrer"
            className="link text-primary m-l-20"
          >
            Learn more <i className="iconfont">&#xe619;</i>{' '}
          </a>
        </p>
        <ul className="m-t-20">
          <li className="font-nor">- Boost liquidity mining yield up to 2.5x</li>
          <li className="font-nor">- Vote to direct liquidity mining emissions</li>
          <li className="font-nor">- Earn your share of protocol revenue</li>
        </ul>
      </div>
      {isShowTip && (
        <div className="tip-box flex ai-center jc-center m-t-30">
          <i className="iconfont text-primary">&#xe61e;</i>
          <p className="font-nor text-normal m-l-12">
            Your lock expires soon. You need to lock at least for two weeks in{' '}
            <span className="text-primary cursor-select" onClick={() => toLocker()}>
              Locker
            </span>
          </p>
        </div>
      )}
    </div>
  )
}
