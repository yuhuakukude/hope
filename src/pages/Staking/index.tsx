import React from 'react'
import styled from 'styled-components'
import { AutoColumn } from '../../components/Column'
import { useActiveWeb3React } from '../../hooks'
// import { useTokenBalance } from '../../state/wallet/hooks'
import { USDT } from '../../constants'

import './index.scss'

import { Button } from 'antd'
const PageWrapper = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
`

export default function Staking() {
  const { account, chainId } = useActiveWeb3React()
  console.log(USDT)
  // const usdtBalance = useTokenBalance(account ?? undefined, USDT)
  // console.log(usdtBalance)
  // const usdtBalance = useTokenBalance(account ?? undefined, USDT[chainId ?? 56])
  const bal = 0
  return (
    <>
      <PageWrapper>
        <div className="staking-page">
          staking{bal} {account}
        </div>
        <Button>Default Button</Button>
        <div>{chainId}</div>
        {/* <div>{usdtBalance?.toFixed()}</div> */}
      </PageWrapper>
    </>
  )
}
