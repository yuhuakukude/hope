import React, { useEffect, useCallback, useState } from 'react'
import styled from 'styled-components'
import { AutoColumn } from '../../components/Column'
import './index.scss'
import Head from './components/Head'
import GomChart from './components/GomChart'
import Vote from './components/Vote'
import GomList from './components/GomList'
import GombocApi from '../../api/gomboc.api'
const PageWrapper = styled(AutoColumn)`
  max-width: 1280px;
  width: 100%;
`

export default function DaoGomboc() {
  const [votiingData, setVotiingData] = useState({})
  const [gombocList, setGombocList] = useState([])
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
          <div className="flex m-t-30">
            <div className="flex-3 normal-card m-r-30">
              <GomChart votiingData={votiingData} />
            </div>
            <div className="flex-2 normal-card">
              <Vote votiingData={votiingData} gombocList={gombocList} />
            </div>
          </div>
          <div className="normal-card m-t-30">
            <GomList />
          </div>
        </div>
      </PageWrapper>
    </>
  )
}
