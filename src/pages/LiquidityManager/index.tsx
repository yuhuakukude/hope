import React, { useEffect } from 'react'
import AddLiquidity from '../AddLiquidity'
import { RouteComponentProps, useHistory } from 'react-router-dom'
import AppBody from '../AppBody'
import styled from 'styled-components'
import { GapColumn } from '../../components/Column'
import { AddRemoveTabs } from '../../components/NavigationTabs'
import { StyledInternalLink, TYPE } from '../../theme'
import Row, { RowBetween, RowFixed } from '../../components/Row'
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

const CustomTabWrapper = styled(Row)<{ flexW?: number; left: number }>`
  padding: 2px;
  width: fit-content;
  background-color: #1b1b1f;
  border-radius: 8px;
  position: relative;
  margin: 0 20px;
  width: auto;
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: ${({ left }) => (left ? `${left}%` : '0')};
    height: 100%;
    width: ${({ flexW }) => (flexW ? `${flexW}%` : '50%')};
    border-radius: 8px;
    background-color: #3d3e46;
    box-sizing: border-box;
    transition: all ease 0.25s;
    border: 2px solid #1b1b1f;
  }
`
const CustomTab = styled.div<{ isActive?: boolean }>`
  color: ${({ isActive, theme }) => (isActive ? theme.text1 : '#a8a8aa')};
  width: 50%;
  height: 38px;
  border-radius: 8px;
  font-size: 14px;
  font-family: Arboria-Medium;
  cursor: pointer;
  user-select: none;
  position: relative;
  z-index: 2;
  // background: ${({ isActive, theme }) => (isActive ? theme.bg3 : theme.bg5)};
  text-align: center;
  line-height: 38px;

  &:hover {
    color: ${({ theme }) => theme.text1};
  }
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
        <CustomTabWrapper left={!isRemove ? 0 : 50}>
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
