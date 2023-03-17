import React, { useEffect } from 'react'
import AddLiquidity from '../AddLiquidity'
import { RouteComponentProps, useHistory } from 'react-router-dom'
import AppBody from '../AppBody'
import styled from 'styled-components'
import { GapColumn } from '../../components/Column'
import { AddRemoveTabs } from '../../components/NavigationTabs'
import { StyledInternalLink, TYPE } from '../../theme'
import { RowBetween, RowFixed } from '../../components/Row'
import { TabItem, TabWrapper } from '../../components/Tab'
import RemoveLiquidity from '../RemoveLiquidity'
import Tips from './component/Tips'
import { Field as mintField, typeInput as mintTypeInput } from '../../state/mint/actions'
import { Field as burnField, typeInput as burnTypeInput } from '../../state/burn/actions'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../state'
// import { Tooltip } from 'antd'
// import { Info } from 'react-feather'

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
  const history = useHistory()
  const dispatch = useDispatch<AppDispatch>()
  const isRemove = history.location.pathname.includes('/withdraw')
  useEffect(() => {
    dispatch(mintTypeInput({ field: mintField.CURRENCY_A, typedValue: '', noLiquidity: false }))
    dispatch(mintTypeInput({ field: mintField.CURRENCY_B, typedValue: '', noLiquidity: false }))
    dispatch(burnTypeInput({ field: burnField.LIQUIDITY_PERCENT, typedValue: '' }))
  }, [dispatch])
  return (
    <PageWrapper gap={'50px'}>
      <AddRemoveTabs />
      <AppBody>
        <RowBetween padding={'30px 20px'}>
          <TYPE.white fontSize={18} fontWeight={700}>
            Liquidity Management
          </TYPE.white>
          <RowFixed className="flex ai-center" align={'center'}>
            <StyledInternalLink
              style={{ justifySelf: 'flex-center', height: '20px', textDecoration: 'none' }}
              to={'/swap/settings'}
            >
              <i className="iconfont font-20 hope-icon-common p-3">&#xe60a;</i>
            </StyledInternalLink>
            <Tips />
            {/* <Tooltip
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
            </Tooltip> */}
          </RowFixed>
        </RowBetween>
        <CustomTabWrapper>
          <CustomTab
            onClick={() =>
              history.replace(
                `/swap/liquidity/manager/deposit/${
                  !currencyIdA && !currencyIdB
                    ? 'ETH'
                    : currencyIdA && currencyIdB
                    ? currencyIdA + '/' + currencyIdB
                    : currencyIdA
                    ? currencyIdA
                    : currencyIdB
                }`
              )
            }
            isActive={!isRemove}
          >
            Deposit
          </CustomTab>
          <CustomTab
            onClick={() => {
              history.replace(
                `/swap/liquidity/manager/withdraw/${
                  !currencyIdA && !currencyIdB
                    ? 'ETH'
                    : currencyIdA && currencyIdB
                    ? currencyIdA + '/' + currencyIdB
                    : currencyIdA
                    ? currencyIdA
                    : currencyIdB
                }`
              )
            }}
            isActive={isRemove}
          >
            Withdraw
          </CustomTab>
        </CustomTabWrapper>
        {!isRemove ? (
          <AddLiquidity currencyIdA={currencyIdA} currencyIdB={currencyIdB} />
        ) : (
          <RemoveLiquidity currencyIdA={currencyIdA} currencyIdB={currencyIdB} />
        )}
      </AppBody>
    </PageWrapper>
  )
}
