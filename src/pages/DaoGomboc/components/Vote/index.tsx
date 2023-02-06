import React, { useEffect, useRef, useState } from 'react'
import './index.scss'
import dayjs from 'dayjs'
import { Tooltip } from 'antd'

interface VoteProps {
  votiingData: any
}

const Vote = ({ votiingData }: VoteProps) => {
  const endDate = dayjs()
    .add(10, 'day')
    .format('YYYY-MM-DD')
  const [endTimeData, setEndTimeData] = useState({
    d: '00',
    h: '00',
    m: '00',
    s: '00'
  })
  const timer = useRef<any>(null)
  const cd = useRef<number>(0)
  const dealData = () => {
    if (cd.current <= 0) {
      setEndTimeData({
        d: '00',
        h: '00',
        m: '00',
        s: '00'
      })
      return timer.current && clearTimeout(timer.current)
    }
    const d = parseInt(`${cd.current / (24 * 60 * 60)}`)
    const h = parseInt(`${(cd.current / (60 * 60)) % 24}`)
    const m = parseInt(`${(cd.current / 60) % 60}`)
    const s = parseInt(`${cd.current % 60}`)
    const pd = Number(d) > 9 ? `${d}` : `0${d}`
    const ph = Number(h) > 9 ? `${h}` : `0${h}`
    const pm = Number(m) > 9 ? `${m}` : `0${m}`
    const ps = Number(s) > 9 ? `${s}` : `0${s}`
    setEndTimeData({
      d: pd,
      h: ph,
      m: pm,
      s: ps
    })
    cd.current--
    timer.current = setTimeout(() => {
      dealData()
    }, 1000)
  }

  useEffect((): any => {
    cd.current = votiingData.votingEndSeconds
    dealData()
    return () => {
      timer.current && clearTimeout(timer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [votiingData])
  return (
    <div className="gom-vote-box">
      <h3 className="font-bolder text-white font-20">Proposed Gömböc Weight Changes</h3>
      <p className="m-t-20 text-white lh15">
        - Your vote directs future liquidity mining emissions starting from the next period on Thursday at 0:00 UTC.
      </p>
      <p className="m-t-10 text-white lh15">
        - Voting power is set at the time of the vote. If you get more veLT later, resubmit your vote to use your
        increased power.
      </p>
      <p className="m-t-10 text-white lh15">
        - Votes are time locked for 10 days. If you vote now, no edits can be made until{' '}
        <span className="text-primary">{endDate}</span>.
      </p>
      <p className="text-center text-normal m-t-20">
        Voting period ends
        <Tooltip title="tip mes">
          <i className="iconfont text-normal m-l-8 cursor-select">&#xe613;</i>
        </Tooltip>
      </p>
      <div className="end-time-box flex m-t-20 w-100">
        <div className="flex-1">
          <p className="text-center text-gray">Day</p>
          <div className="flex jc-center m-t-8">
            <div className="end-item">{cd.current > 0 && endTimeData.d ? endTimeData.d : '00'}</div>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-center text-gray">Hour</p>
          <div className="flex jc-center m-t-8">
            <div className="end-item">{cd.current > 0 && endTimeData.h ? endTimeData.h : '00'}</div>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-center text-gray">Min</p>
          <div className="flex jc-center m-t-8">
            <div className="end-item">{cd.current > 0 && endTimeData.m ? endTimeData.m : '00'}</div>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-center text-gray">Sec</p>
          <div className="flex jc-center m-t-8">
            <div className="end-item">{cd.current > 0 && endTimeData.s ? endTimeData.s : '00'}</div>
          </div>
        </div>
      </div>
      <div className="form-box"></div>
    </div>
  )
}

export default Vote
