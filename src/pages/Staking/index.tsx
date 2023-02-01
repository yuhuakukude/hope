import React from 'react'
import styled from 'styled-components'
import { AutoColumn } from '../../components/Column'
// import { useActiveWeb3React } from '../../hooks'
// import { useTokenBalance } from '../../state/wallet/hooks'
import { USDT } from '../../constants'

import './index.scss'

const PageWrapper = styled(AutoColumn)`
  max-width: 1280px;
  width: 100%;
`

export default function Staking() {
  // const { account, chainId } = useActiveWeb3React()
  console.log(USDT)
  // const usdtBalance = useTokenBalance(account ?? undefined, USDT)
  // console.log(usdtBalance)
  // const usdtBalance = useTokenBalance(account ?? undefined, USDT[chainId ?? 56])
  return (
    <>
      <PageWrapper>
        <div className="staking-page">
          <i className="iconfont">&#xe605;</i>
          <i className="iconfont">&#xe606;</i>
          <i className="iconfont">&#xe607;</i>
        </div>
      </PageWrapper>
    </>
  )
}
