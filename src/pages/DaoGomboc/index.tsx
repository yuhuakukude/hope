import React, { useEffect, useCallback, useState, useMemo, useRef } from 'react'
import styled from 'styled-components'
import { AutoColumn } from '../../components/Column'
import './index.scss'
import Head from './components/Head'
import GomChart from './components/GomChart'
import Vote from './components/Vote'
import GomList from './components/GomList'
import GaugeApi from '../../api/gauge.api'
import { useActiveWeb3React } from '../../hooks'
import { useTokenBalance } from '../../state/wallet/hooks'
import moment from 'moment'
import format from '../../utils/format'
import { useLocker } from '../../hooks/ahp/useLocker'
import { NavLink } from 'react-router-dom'
import { getVELTToken } from 'utils/addressHelpers'

const PageWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 0 30px;
  max-width: 1340px;
  min-width: 1210px;
`

export default function DaoGauge() {
  const childRef = useRef<any>()
  const voteRef = useRef<any>()
  const { account, chainId } = useActiveWeb3React()
  const [votiingData, setVotiingData] = useState({})
  const [gaugeList, setGaugeList] = useState([])
  const { lockerRes } = useLocker()
  const isShowTip = useMemo(() => {
    const lockerEndDate = lockerRes?.end
    if (!lockerEndDate || lockerEndDate === '--') {
      return false
    }
    return moment(format.formatDate(Number(`${lockerEndDate}`))).diff(moment(), 'days') < 14
  }, [lockerRes])
  const isWithDraw = useMemo(() => {
    return lockerRes?.end === '--' && lockerRes?.amount
  }, [lockerRes])
  const veltBalance = useTokenBalance(account ?? undefined, getVELTToken(chainId))
  const isNoVelt = useMemo(() => {
    let res = false
    if (veltBalance && Number(veltBalance.toFixed(2)) <= 0) {
      res = true
    }
    return res
  }, [veltBalance])
  async function initVotiingData() {
    try {
      const res = await GaugeApi.getGaugeVotiing()
      if (res && res.result) {
        setVotiingData(res.result)
      }
    } catch (error) {
      console.log(error)
    }
  }

  async function initGaugeList() {
    try {
      const res = await GaugeApi.getGaugeList()
      if (res && res.result && res.result.length > 0) {
        setGaugeList(res.result)
      }
    } catch (error) {
      console.log(error)
    }
  }

  function updateTable() {
    initVotiingData()
    if (childRef && childRef.current) {
      childRef.current?.initTableData()
    }
  }

  function toSetSelGom(gauge: string) {
    if (voteRef && voteRef.current) {
      voteRef.current?.setSel(gauge)
    }
  }

  const init = useCallback(async () => {
    await initVotiingData()
    await initGaugeList()
  }, [])

  useEffect(() => {
    init()
  }, [init])
  return (
    <>
      <PageWrapper>
        <div className="dao-gauge-page">
          <Head />
          <div id="votepoint" className="flex m-t-30">
            <div className="flex-3 normal-card m-r-30">
              <GomChart votiingData={votiingData} />
            </div>
            <div className="flex-2 normal-card">
              <Vote
                ref={voteRef}
                updateTable={updateTable}
                isNoVelt={isNoVelt}
                votiingData={votiingData}
                gaugeList={gaugeList}
              />
            </div>
          </div>
          {isNoVelt && (
            <div className="flex m-t-30 ai-center jc-center">
              <i className="text-primary iconfont m-r-5 font-14">&#xe62b;</i>
              <div>
                <p className="text-white lh15">You need to lock your LT for veLT in order to vote for Gauges.</p>
              </div>
            </div>
          )}
          {isShowTip && (
            <div className="flex m-t-30 ai-center jc-center">
              <i className="text-primary iconfont m-r-5 font-14">&#xe62b;</i>
              <div>
                <p className="text-white lh15">
                  Your LT Lock will expire in 2 weeks. Increase your lock duration in
                  <NavLink to={'/dao/locker'}>
                    <span className="text-primary"> LT Locker </span>
                  </NavLink>
                </p>
              </div>
            </div>
          )}
          {isNoVelt && isWithDraw && (
            <div className="flex m-t-30 ai-center jc-center">
              <i className="text-primary iconfont m-r-5 font-14">&#xe62b;</i>
              <div>
                <p className="text-white lh15">
                  Your lock has expired, please
                  <NavLink to={'/dao/locker'}>
                    <span className="text-primary"> withdraw </span>
                  </NavLink>
                  and re-lock
                </p>
              </div>
            </div>
          )}
          <div className="normal-card m-t-30">
            <GomList
              toSetSelGom={gauge => {
                toSetSelGom(gauge)
              }}
              ref={childRef}
            />
          </div>
        </div>
      </PageWrapper>
    </>
  )
}
