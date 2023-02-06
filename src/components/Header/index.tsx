import React, { useMemo, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { darken } from 'polished'
import { useTranslation } from 'react-i18next'

import styled from 'styled-components'

import { useActiveWeb3React } from '../../hooks'

import Row, { RowFixed } from '../Row'
import Web3Status from '../Web3Status'
import ClaimModal from '../claim/ClaimModal'
import Modal from '../Modal'
import UniBalanceContent from './UniBalanceContent'
import useTheme from '../../hooks/useTheme'
// import Matamask from 'assets/images/metamask-logo.png'
import { Text } from 'rebass'

const HeaderFrame = styled.div`
  display: grid;
  grid-template-columns: 1fr 120px;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
  width: 100%;
  top: 0;
  position: relative;
  padding: 1rem 1rem 0 1rem;
  box-shadow: 0 1px 0 0 rgba(38, 39, 56, 1);
  z-index: 2;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr;
    padding: 0 1rem;
    width: calc(100%);
    position: relative;
  `};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
        padding: 0.5rem 1rem;
  `}
`

const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-self: flex-end;
  padding-bottom: 1rem;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: row;
    justify-content: space-between;
    justify-self: center;
    width: 100%;
    max-width: 960px;
    padding: 1rem;
    position: fixed;
    bottom: 0px;
    left: 0px;
    width: 100%;
    z-index: 99;
    height: 72px;
    border-radius: 12px 12px 0 0;
    background-color: ${({ theme }) => theme.bg1};
  `};
`

const HeaderElement = styled.div`
  display: flex;
  align-items: center;

  /* addresses safari's lack of support for "gap" */

  ${({ theme }) => theme.mediaWidth.upToMedium`
   flex-direction: row-reverse;
    align-items: center;
  `};
`

const HeaderRow = styled(RowFixed)`
  ${({ theme }) => theme.mediaWidth.upToMedium`
   width: 100%;
  `};
`

const HeaderLinks = styled(Row)`
  justify-content: center;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem 0 1rem 1rem;
    justify-content: flex-end;
`};
`

const AccountElement = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.bg5};
  border-radius: 20px;
  white-space: nowrap;
  margin-left: 30px;
  height: 40px;
  width: 100%;
  cursor: pointer;
`

const activeClassName = 'ACTIVE'

export interface HeaderEvent {
  id: string
  title: string
  path: string
}

const StyledNavLink = styled(NavLink).attrs({
  activeClassName
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text2};
  font-size: 1rem;
  width: fit-content;
  margin: 0 12px;
  font-weight: 500;
  padding-bottom: 1rem;

  &.${activeClassName} {
    font-weight: 600;
    color: ${({ theme }) => theme.text1};
    border-bottom: 3px solid ${({ theme }) => theme.primary1};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
  }
`

const BuyHopeNavLink = styled(NavLink)`
  width: 128px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  color: #e4c989;
  font-size: 18px;
  font-family: Arboria-Medium;
  border-radius: 10px;
  background-color: rgba(30, 30, 30, 1);
  :hover {
    background-color: #e4c989;
    color: #26262c;
  }
`

// const StyledExternalLink = styled(ExternalLink).attrs({
//   activeClassName
// })<{ isActive?: boolean }>`
//   ${({ theme }) => theme.flexRowNoWrap}
//   align-items: left;
//   outline: none;
//   cursor: pointer;
//   text-decoration: none;
//   color: ${({ theme }) => theme.text2};
//   font-size: 1rem;
//   padding-bottom: 1rem;
//   width: fit-content;
//   margin: 0 12px;
//   font-weight: 500;
//
//   &.${activeClassName} {
//     font-weight: 600;
//     border-bottom: 3px solid ${({ theme }) => theme.primary1};
//     color: ${({ theme }) => theme.text1};
//   }
//
//   :hover,
//   :focus {
//     color: ${({ theme }) => darken(0.1, theme.text1)};
//   }
//
//   ${({ theme }) => theme.mediaWidth.upToExtraSmall`
//       display: none;
// `}
// `

export const StyledMenuButton = styled.button`
  position: relative;
  width: 100%;
  height: 100%;
  border: none;
  background-color: ${({ theme }) => theme.bg3};
  margin-left: 8px;
  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    background-color: ${({ theme }) => theme.bg4};
  }

  svg {
    margin-top: 2px;
  }

  > * {
    stroke: ${({ theme }) => theme.text1};
  }
`

// const NETWORK_LABELS: { [chainId in ChainId]?: string } = {
//   [ChainId.SEPOLIA]: 'Sepolia',
//   [ChainId.HOPE]: 'Hope'
// }

export default function Header({ headers }: { headers?: HeaderEvent[] }) {
  const { account } = useActiveWeb3React()
  const { t } = useTranslation()
  const theme = useTheme()
  const location = useLocation()
  const headerRouters = useMemo(() => {
    if (location?.pathname?.startsWith('/swap')) {
      return [
        { id: 'swap-nav-link', title: 'Swap', router: '/swap/exchange' },
        { id: 'pool-nav-link', title: 'Pools', router: '/swap/pools' },
        { id: 'stake-nav-link', title: 'Mint', router: '/swap/mining' }
      ]
    }
    if (location?.pathname?.startsWith('/hope')) {
      return [
        { id: 'hope-nav-link', title: 'Staking', router: '/hope/staking' },
        { id: 'pool-nav-link', title: 'Buy Hope', router: '/hope/buy-hope' },
        { id: 'stake-nav-link', title: 'Gomboc', router: '/hope/gomboc' }
      ]
    }
    return []
  }, [location])
  // const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']
  // const [isDark] = useDarkModeManager()

  const [showUniBalanceModal, setShowUniBalanceModal] = useState(false)

  return (
    <HeaderFrame>
      <ClaimModal />
      <Modal isOpen={showUniBalanceModal} onDismiss={() => setShowUniBalanceModal(false)}>
        <UniBalanceContent setShowUniBalanceModal={setShowUniBalanceModal} />
      </Modal>
      <HeaderRow>
        <HeaderLinks>
          {headers &&
            headers.map((header, index) => {
              return (
                <StyledNavLink key={index} id={header.id} to={header.path}>
                  {t(header.title)}
                </StyledNavLink>
              )
            })}
          {!headers && (
            <>
              {headerRouters.map(({ title, router }) => {
                return (
                  <StyledNavLink key={title} id={`swap-nav-link`} to={router}>
                    {title}
                  </StyledNavLink>
                )
              })}
              {/*<StyledNavLink id={`swap-nav-link`} to={'/swap'}>*/}
              {/*  {t('swap')}*/}
              {/*</StyledNavLink>*/}
              {/*<StyledNavLink*/}
              {/*  id={`pool-nav-link`}*/}
              {/*  to={'/pool'}*/}
              {/*  isActive={(match, { pathname }) =>*/}
              {/*    Boolean(match) ||*/}
              {/*    pathname.startsWith('/add') ||*/}
              {/*    pathname.startsWith('/remove') ||*/}
              {/*    pathname.startsWith('/create') ||*/}
              {/*    pathname.startsWith('/find')*/}
              {/*  }*/}
              {/*>*/}
              {/*  {t('pool')}*/}
              {/*</StyledNavLink>*/}
              {/*<StyledNavLink id={`stake-nav-link`} to={'/uni'}>*/}
              {/*  UNI*/}
              {/*</StyledNavLink>*/}
              {/*<StyledNavLink id={`stake-nav-link`} to={'/vote'}>*/}
              {/*  Vote*/}
              {/*</StyledNavLink>*/}
              {/*<StyledExternalLink id={`stake-nav-link`} href={'https://uniswap.info'}>*/}
              {/*  Charts <span style={{ fontSize: '11px' }}>↗</span>*/}
              {/*</StyledExternalLink>*/}
            </>
          )}
        </HeaderLinks>
      </HeaderRow>
      <HeaderControls>
        <BuyHopeNavLink id={`buy-hope-nav-link`} to={'/hope/buy-hope'}>
          Buy HOPE
        </BuyHopeNavLink>
        <HeaderElement>
          {/* <div style={{ width: '24px', height: '24px' }}>
            {account ? (
              <img alt={'logo'} src={Matamask} style={{ width: '100%', height: 'auto' }} />
            ) : (
              <i className="iconfont" style={{ color: theme.text1, width: '100%', height: '100%' }}>
                &#xe610;
              </i>
            )}
          </div> */}
          <AccountElement active={!!account} style={{ pointerEvents: 'auto', color: theme.text1, marginRight: '30px' }}>
            <div style={{ paddingLeft: '14px', paddingRight: '14px', display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  background: theme.green1,
                  borderRadius: '50%',
                  marginRight: '5px'
                }}
              />
              <Text>ETH</Text>
            </div>
            <Web3Status />
          </AccountElement>
        </HeaderElement>
      </HeaderControls>
    </HeaderFrame>
  )
}
