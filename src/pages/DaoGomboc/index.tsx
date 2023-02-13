import React, { useEffect, useCallback, useState, useMemo, useRef } from 'react'
import styled from 'styled-components'
import { AutoColumn } from '../../components/Column'
import './index.scss'
import Head from './components/Head'
import GomChart from './components/GomChart'
import Vote from './components/Vote'
import GomList from './components/GomList'
import GombocApi from '../../api/gomboc.api'
import { useActiveWeb3React } from '../../hooks'
import { useTokenBalance } from '../../state/wallet/hooks'
import { VELT } from '../../constants'
import moment from 'moment'
import format from '../../utils/format'
import { useLocker } from '../../hooks/ahp/useLocker'
import { NavLink } from 'react-router-dom'

const PageWrapper = styled(AutoColumn)`
  max-width: 1280px;
  width: 100%;
`

export default function DaoGomboc() {
  const childRef = useRef<any>()
  const { account, chainId } = useActiveWeb3React()
  const [votiingData, setVotiingData] = useState({})
  const [gombocList, setGombocList] = useState([])
  const { lockerRes } = useLocker()
  const isShowTip = useMemo(() => {
    const lockerEndDate = lockerRes?.end
    if (!lockerEndDate || lockerEndDate === '--') {
      return false
    }
    return moment(format.formatDate(Number(`${lockerEndDate}`))).diff(moment(), 'days') < 14
  }, [lockerRes])
  const veltBalance = useTokenBalance(account ?? undefined, VELT[chainId ?? 1])
  const isNoVelt = useMemo(() => {
    let res = false
    if (veltBalance && Number(veltBalance.toFixed(2)) <= 0) {
      res = true
    }
    return res
  }, [veltBalance])
  async function initVotiingData() {
    try {
      const res = await GombocApi.getGombocsVotiing()
      if (res && res.result) {
        setVotiingData(res.result)
      }
    } catch (error) {
      console.log(error)
    }
  }

  async function initGombocsList() {
    try {
      const res = await GombocApi.getGombocsList()
      if (res && res.result && res.result.length > 0) {
        setGombocList(res.result)
      }
    } catch (error) {
      console.log(error)
    }
  }

  function updateTable() {
    if (childRef && childRef.current) {
      childRef.current?.initTableData()
    }
  }

  const init = useCallback(async () => {
    await initVotiingData()
    await initGombocsList()
  }, [])

  useEffect(() => {
    init()
  }, [init])
  return (
    <>
      <PageWrapper>
        <div className="dao-gomboc-page">
          <Head />
          {isNoVelt && (
            <div className="flex m-t-30 ai-center jc-center">
              <i className="text-primary iconfont m-r-5 font-14">&#xe61e;</i>
              <div>
                <p className="text-white lh15">
                  You need to have LT{' '}
                  <NavLink to={'/dao/locker'}>
                    <span className="text-primary">Locker</span>
                  </NavLink>{' '}
                  in Locker in order to vote for gömböc weights
                </p>
              </div>
            </div>
          )}
          {isShowTip && (
            <div className="flex m-t-30 ai-center jc-center">
              <i className="text-primary iconfont m-r-5 font-14">&#xe61e;</i>
              <div>
                <p className="text-white lh15">
                  Your lock expires soon. You need to lock at least for two weeks in
                  <NavLink to={'/dao/locker'}>
                    <span className="text-primary">Locker</span>
                  </NavLink>
                </p>
              </div>
            </div>
          )}

          <div id="votepoint" className="flex m-t-30">
            <div className="flex-3 normal-card m-r-30">
              <GomChart votiingData={votiingData} />
            </div>
            <div className="flex-2 normal-card">
              <Vote updateTable={updateTable} isNoVelt={isNoVelt} votiingData={votiingData} gombocList={gombocList} />
            </div>
          </div>
          <div className="normal-card m-t-30">
            <GomList ref={childRef} />
          </div>
        </div>
      </PageWrapper>
    </>
  )
}
