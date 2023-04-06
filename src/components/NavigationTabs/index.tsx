import React from 'react'
import styled from 'styled-components'
import { darken } from 'polished'
import { useTranslation } from 'react-i18next'
import { NavLink, Link as HistoryLink, useHistory } from 'react-router-dom'

import { RowFixed } from '../Row'
// import QuestionHelper from '../QuestionHelper'
import { Settings } from 'react-feather'

export const Tabs = styled.div`
  width: 100%;
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  border-radius: 3rem;
  justify-content: flex-start;
  justify-self: flex-start;
  padding: 0 30px;
`

const activeClassName = 'ACTIVE'

const StyledNavLink = styled(NavLink).attrs({
  activeClassName
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: center;
  height: 3rem;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text3};
  font-size: 20px;

  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 500;
    color: ${({ theme }) => theme.text1};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
  }
`

const ActiveText = styled.div`
  font-weight: 500;
  font-size: 20px;
`

export const StyledMenuIcon = styled(Settings)`
  height: 20px;
  width: fit-content;
  margin-left: auto;
  cursor: pointer;

  > * {
    stroke: ${({ theme }) => theme.text2};
  }

  :hover {
    opacity: 0.7;
  }
`

export function SwapPoolTabs({ active }: { active: 'swap' | 'pool' }) {
  const { t } = useTranslation()
  return (
    <Tabs style={{ marginBottom: '20px', display: 'none' }}>
      <StyledNavLink id={`swap-nav-link`} to={'/swap/exchange'} isActive={() => active === 'swap'}>
        {t('swap')}
      </StyledNavLink>
      <StyledNavLink id={`pool-nav-link`} to={'/swap/pools'} isActive={() => active === 'pool'}>
        {t('pool')}
      </StyledNavLink>
    </Tabs>
  )
}

export function FindPoolTabs() {
  return (
    <Tabs>
      <RowFixed gap={'20px'} style={{ padding: '0rem 1rem 0 40px' }}>
        <HistoryLink to="/swap/pools">
          <i
            className="iconfont font-28 cursor-select font-bold hope-icon-common"
            style={{ width: '28px', height: '28px' }}
          >
            &#xe615;
          </i>
        </HistoryLink>
        <ActiveText style={{ marginLeft: 20 }}>Import Pool</ActiveText>
      </RowFixed>
    </Tabs>
  )
}

export function AddRemoveTabs() {
  // reset states on back
  const history = useHistory()

  return (
    <Tabs>
      <RowFixed gap={'20px'} style={{ padding: '1rem 1rem 0 1rem' }}>
        <div
          onClick={() => {
            history.goBack()
          }}
        >
          <i
            className="iconfont font-28 cursor-select font-bold hope-icon-common"
            style={{ width: '28px', height: '28px' }}
          >
            &#xe615;
          </i>
        </div>
        <ActiveText style={{ marginLeft: 20 }}>Liquidity Management</ActiveText>
      </RowFixed>
    </Tabs>
  )
}

export function StakeTabs() {
  // reset states on back
  const history = useHistory()

  return (
    <Tabs>
      <RowFixed gap={'20px'} style={{ padding: '1rem 1rem 0 1rem' }}>
        <div
          onClick={() => {
            history.goBack()
          }}
        >
          <i
            className="iconfont font-28 cursor-select font-bold hope-icon-common"
            style={{ width: '28px', height: '28px' }}
          >
            &#xe615;
          </i>
        </div>
        <ActiveText style={{ marginLeft: 20 }}>Liquidity Farming</ActiveText>
      </RowFixed>
    </Tabs>
  )
}
