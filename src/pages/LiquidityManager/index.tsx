import React, { useState } from 'react'
import AddLiquidity from '../AddLiquidity'
import { RouteComponentProps } from 'react-router-dom'
import AppBody from '../AppBody'
import styled from 'styled-components'
import { AutoColumn, GapColumn } from '../../components/Column'
import { AddRemoveTabs, StyledMenuIcon } from '../../components/NavigationTabs'
import { StyledInternalLink, TYPE } from '../../theme'
import { RowBetween, RowFixed } from '../../components/Row'
import { TabItem, TabWrapper } from '../../components/Tab'
import RemoveLiquidity from '../RemoveLiquidity'
import { Tooltip } from 'antd'
import { Info } from 'react-feather'

const PageWrapper = styled(GapColumn)`
  width: 100%;
  align-items: center;
  justify-content: center;
`

const CustomTabWrapper = styled(TabWrapper)`
  width: auto;
  margin: 0 20px;
`
const CustomTab = styled(TabItem)`
  width: auto;
  flex: 1;
`
export default function LiquidityManager({
  match: {
    params: { currencyIdA, currencyIdB }
  }
}: RouteComponentProps<{ currencyIdA?: string; currencyIdB?: string }>) {
  const [adding, setAdding] = useState(true)
  return (
    <PageWrapper gap={'50px'}>
      <AddRemoveTabs />
      <AppBody>
        <RowBetween padding={'30px 20px'}>
          <TYPE.white fontSize={18} fontWeight={700}>
            Liquidity Management
          </TYPE.white>
          <RowFixed align={'center'}>
            <StyledInternalLink style={{ justifySelf: 'flex-end' }} to={'/swap/settings'}>
              <StyledMenuIcon style={{ height: 16 }} size={'18px'} />
            </StyledInternalLink>
            <Tooltip
              style={{ color: '#5A5A5B', marginLeft: 10 }}
              placement="rightBottom"
              title={
                <AutoColumn gap={'16px'} style={{ padding: 20 }}>
                  <TYPE.mediumHeader>About Deposit</TYPE.mediumHeader>
                  <TYPE.white>
                    When you add liquidity, you will receive pool tokens representing your position. These tokens
                    automatically earn fees proportional to your share of the pool, and can be redeemed at any time.
                  </TYPE.white>
                  <TYPE.white>
                    By adding liquidity you'll earn 0.3% of all trades on this pair proportional to your share of the
                    pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your
                    liquidity.
                  </TYPE.white>
                  <TYPE.mediumHeader mt={'8px'}>About Deposit</TYPE.mediumHeader>
                  <TYPE.white>
                    Removing pool tokens converts your position back into underlying tokens at the current rate,
                    proportional to your share of the pool. Accrued fees are included in the amounts you receive.
                  </TYPE.white>
                </AutoColumn>
              }
            >
              <Info size={18} />
            </Tooltip>
          </RowFixed>
        </RowBetween>
        <CustomTabWrapper>
          <CustomTab onClick={() => setAdding(true)} isActive={adding}>
            Deposit
          </CustomTab>
          <CustomTab
            onClick={() => {
              setAdding(false)
            }}
            isActive={!adding}
          >
            Withdraw
          </CustomTab>
        </CustomTabWrapper>
        {adding ? (
          <AddLiquidity currencyIdA={currencyIdA} currencyIdB={currencyIdB} />
        ) : (
          <RemoveLiquidity currencyIdA={currencyIdA} currencyIdB={currencyIdB} />
        )}
      </AppBody>
    </PageWrapper>
  )
}
