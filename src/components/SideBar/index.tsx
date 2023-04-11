import styled from 'styled-components'
import { ReactComponent as Logo } from 'assets/svg/sidebar-logo.svg'
import React, { useCallback } from 'react'
import Column, { AutoColumn } from '../Column'
import { ReactComponent as Twitter } from 'assets/svg/sidebar-twitter.svg'
import { ReactComponent as Medium } from 'assets/svg/sidebar-medium.svg'
import { ReactComponent as Telegram } from 'assets/svg/sidebar-telegram.svg'
import { ReactComponent as Discord } from 'assets/svg/sidebar-discord.svg'
import { ReactComponent as Email } from 'assets/svg/sidebar-email.svg'
import { Text } from 'rebass'
import { NavLink, useLocation } from 'react-router-dom'
import { PrimaryText } from '../Text'
import { DOC_API } from '../../constants'
import { DOCS_URL } from 'constants/config'

import './index.scss'

const Bar = styled('div')`
  display: flex;
  background: #26262c;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  transition: all 0.5s;
  width: 100px;
  position: relative;
  :hover {
    width: 200px;
  }
  :hover .sidebar-transition {
    width: 100%;
  }
`

const SidebarIcon = styled('div')`
  color: #a8a8aa;
  font-size: 20px;
  white-space: nowrap;
  padding: 0 40px;
  height: 60px;
  line-height: 60px;
  width: 100%;

  :hover {
    cursor: pointer;
    color: #ffffff;
  }
`

const Icon = styled('i')`
  position: relative;
  z-index: 1;
  display: inline-block;
  vertical-align: top;
`

const MenuText = styled(Text)`
  color: #a8a8aa;
  font-size: 12px;
  text-align: center;
  cursor: pointer;
  user-select: none;
  a {
    color: #a8a8aa;
  }
  &:hover {
    color: #fff;
    a {
      color: #fff;
    }
  }
`

const SidebarText = styled.p`
  margin-left: 10px;
  font-size: 18px;
  display: inline-block;
  zindex: 1;
  position: relative;
`

const LogoText = styled(PrimaryText)`
  font-size: 30px;
`

const TabBox = styled(Column)<{ top?: number }>`
  position: relative;
  &::before {
    content: ' ';
    height: 60px;
    top: ${({ top }) => (top ? top + 'px' : 0)};
    left: 20px;
    border-top-left-radius: 30px;
    border-bottom-left-radius: 30px;
    position: absolute;
    width: calc(100% - 20px);
    transition: all ease 0.25s;
    background-color: rgba(12, 12, 13, 1);
  }
`

export default function SideBar() {
  const location = useLocation()
  const ROUTERS = [
    { title: 'Staking', icon: '&#xe626;', baseRouter: '/hope', router: '/hope/staking' },
    { title: 'HopeSwap', icon: '&#xe632;', baseRouter: '/swap', router: '/swap/exchange' },
    { title: 'LT & DAO', icon: '&#xe633;', baseRouter: '/dao', router: '/dao/gauge' },
    { title: 'My Portfolio', icon: '&#xe627;', baseRouter: '/portfolio', router: '/portfolio' }
  ]
  const currentTab = useCallback(() => {
    return ROUTERS.findIndex(({ baseRouter }) => baseRouter && location.pathname.startsWith(baseRouter))
  }, [ROUTERS, location.pathname])

  const currentIndex = currentTab() < 0 ? 0 : currentTab()
  return (
    <Bar id="side-bar">
      <Column style={{ width: '100%' }}>
        <div className="sidebar-logo">
          <Logo style={{ alignSelf: 'center', marginRight: '5px' }} />
          <LogoText className="sidebar-transition">HOPE</LogoText>
        </div>
        <TabBox top={currentIndex * 60}>
          {ROUTERS.map(({ title, router, icon }, index) => {
            return (
              <NavLink key={index} to={router}>
                <SidebarIcon key={index} className={currentTab() === index ? 'SidebarOnSelect' : ''}>
                  <Icon className="iconfont font-20" dangerouslySetInnerHTML={{ __html: icon }} />
                  <SidebarText className="sidebar-transition">{title}</SidebarText>
                </SidebarIcon>
              </NavLink>
            )
          })}
          <span className="sidebar-select-arc" style={{ top: `${-10 + currentIndex * 60}px` }}>
            <span className="sidebar-select-arc-mask"></span>
          </span>
          <span className="sidebar-select-arc sidebar-select-arc-2" style={{ top: `${60 + currentIndex * 60}px` }}>
            <span className="sidebar-select-arc-mask"></span>
          </span>
        </TabBox>
      </Column>
      <Column style={{ width: '100%' }}>
        <AutoColumn gap="10px" style={{ marginLeft: 'auto', marginRight: 'auto' }} className="a-link-box">
          <a
            href="https://twitter.com/hope_ecosystem"
            target="_blank"
            rel="noopener noreferrer"
            className="a-link icon-item icon-item-1"
          >
            <Twitter className="icon-link"></Twitter>
          </a>

          <a
            href="https://hope-ecosystem.medium.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="a-link icon-item icon-item-2"
          >
            <Medium className="icon-link"></Medium>
          </a>

          <Telegram className="icon-link disabled icon-item icon-item-3"></Telegram>

          <a
            href="https://discord.gg/hope-ecosystem"
            target="_blank"
            rel="noopener noreferrer"
            className="a-link icon-item icon-item-4"
          >
            <Discord className="icon-link"></Discord>
          </a>

          <Email className="icon-link disabled icon-item icon-item-5"></Email>
        </AutoColumn>

        <AutoColumn gap={'18px'} className="text-link-box">
          <MenuText>
            <a href={`https://hope.money/`} target="_blank" rel="noopener noreferrer" className="text-link">
              About
            </a>
          </MenuText>
          <MenuText>
            <a href={DOCS_URL['Main']} target="_blank" rel="noopener noreferrer" className="text-link">
              Docs
            </a>
          </MenuText>
          <MenuText>
            <a href={`${DOC_API}/bug-bounty.html`} target="_blank" rel="noopener noreferrer" className="text-link">
              Bug bounty
            </a>
          </MenuText>
        </AutoColumn>
        <MenuText mt={26} mb={30} style={{ color: '#A8A8AA', cursor: 'default' }}>
          @2023 Light
        </MenuText>
      </Column>
    </Bar>
  )
}
