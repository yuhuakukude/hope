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
  color: white;
  font-size: 20px;
  white-space: nowrap;
  padding: 0 40px;
  height: 60px;
  line-height: 60px;
  width: 100%;

  :hover {
    cursor: pointer;
  }
`

const Icon = styled('i')`
  position: relative;
  z-index: 1;
  display: inline-block;
  vertical-align: top;
`

const MenuText = styled(Text)`
  color: #ffffff99;
  font-size: 12px;
  text-align: center;
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

const TabBox = styled(Column)``

export default function SideBar() {
  const location = useLocation()

  const ROUTERS = [
    { title: 'Portfolio', icon: '&#xe609;', baseRouter: '/portfolio', router: '/portfolio' },
    { title: 'Staking', icon: '&#xe606;', baseRouter: '/hope', router: '/hope/staking' },
    { title: 'LightSwap', icon: '&#xe605;', baseRouter: '/swap', router: '/swap/exchange' },
    { title: 'LT&DAO', icon: '&#xe608;', baseRouter: '/dao', router: '/dao/gomboc' }
  ]
  const currentTab = useCallback(() => {
    return ROUTERS.findIndex(({ baseRouter }) => baseRouter && location.pathname.startsWith(baseRouter))
  }, [ROUTERS, location.pathname])

  return (
    <Bar id="side-bar">
      <Column style={{ width: '100%' }}>
        <div className="sidebar-logo">
          <Logo style={{ alignSelf: 'center', marginRight: '5px' }} />
          <LogoText className="sidebar-transition">HOPE</LogoText>
        </div>
        <TabBox>
          {ROUTERS.map(({ title, router, icon }, index) => {
            return (
              <NavLink key={index} to={router}>
                <SidebarIcon key={index} className={currentTab() === index ? 'SidebarOnSelect' : ''}>
                  <span className="sidebar-select-arc">
                    <span className="sidebar-select-arc-mask"></span>
                  </span>
                  <Icon className="iconfont" dangerouslySetInnerHTML={{ __html: icon }} />
                  <SidebarText className="sidebar-transition">{title}</SidebarText>
                  <span className="sidebar-select-arc sidebar-select-arc-2">
                    <span className="sidebar-select-arc-mask"></span>
                  </span>
                </SidebarIcon>
              </NavLink>
            )
          })}
        </TabBox>
      </Column>
      <Column style={{ width: '100%' }}>
        <AutoColumn gap="10px" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
          <Twitter />
          <Medium />
          <Telegram />
          <Discord />
          <Email />
        </AutoColumn>

        <AutoColumn gap={'18px'} style={{ marginTop: '30px' }}>
          <MenuText>About</MenuText>
          <MenuText>Docs</MenuText>
          <MenuText>Bug bounty</MenuText>
        </AutoColumn>
        <MenuText mt={26} mb={30}>
          @2023 Light
        </MenuText>
      </Column>
    </Bar>
  )
}
