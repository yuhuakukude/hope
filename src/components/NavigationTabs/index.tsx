import React from 'react'
import styled from 'styled-components'
import { darken } from 'polished'
import { useTranslation } from 'react-i18next'
import { NavLink, Link as HistoryLink, useHistory } from 'react-router-dom'

import { ArrowLeft } from 'react-feather'
import { RowFixed } from '../Row'
// import QuestionHelper from '../QuestionHelper'
import { Settings } from 'react-feather'
import { useDispatch } from 'react-redux'
import { AppDispatch } from 'state'
import { resetMintState } from 'state/mint/actions'

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

const StyledArrowLeft = styled(ArrowLeft)`
  color: ${({ theme }) => theme.text1};
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
          <StyledArrowLeft />
        </HistoryLink>
        <ActiveText style={{ marginLeft: 20 }}>Import Pool</ActiveText>
      </RowFixed>
    </Tabs>
  )
}

export function AddRemoveTabs({ adding, creating }: { adding: boolean; creating: boolean }) {
  // reset states on back
  const dispatch = useDispatch<AppDispatch>()
  const history = useHistory()

  return (
    <Tabs>
      <RowFixed gap={'20px'} style={{ padding: '1rem 1rem 0 1rem' }}>
        <div
          onClick={() => {
            adding && dispatch(resetMintState())
            history.goBack()
          }}
        >
          <StyledArrowLeft />
        </div>
        <ActiveText style={{ marginLeft: 20 }}>
          {creating ? 'Create a pair' : adding ? 'Add Liquidity' : 'Remove Liquidity'}
        </ActiveText>
      </RowFixed>
    </Tabs>
  )
}
