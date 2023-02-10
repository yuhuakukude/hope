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

const Bar = styled('div')`
  display: flex;
  background: #26262c;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;

  :hover .showOnHover {
    display: block;
  }
`

const SidebarIcon = styled('div')`
  color: white;
  font-size: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-right: 20px;
  height: 60px;
  width: 100%;
  transition: all 1s;

  :hover {
    cursor: pointer;
  }
`

//const SidebarSelectedPre = styled(SidebarIcon)``
const SidebarSelected = styled(SidebarIcon)`
  background-color: ${({ theme }) => theme.bg2};
  border-radius: 30px 0 0 30px;
  transition: all 1s;
  color: ${({ theme }) => theme.primary1};
`
//const SidebarSelectedNext = styled(SidebarIcon)``

const Icon = styled('i')`
  margin-left: 20px;
  margin-top: auto;
  margin-bottom: auto;
  text-align: center;
`

const MenuText = styled(Text)`
  color: #ffffff99;
  font-size: 12px;
  text-align: center;
`

const SidebarText = styled.p`
  margin-left: 10px;
  font-size: 18px;
  display: none;
`

const LogoText = styled(PrimaryText)`
  font-size: 30px;
  display: none;
`

export default function SideBar() {
  const location = useLocation()

  const ROUTERS = [
    { title: 'Dashboard', icon: '&#xe607;', router: '' },
    { title: 'Portfolio', icon: '&#xe609;', router: '/portfolio' },
    { title: 'Dashboard', icon: '&#xe607;', router: '/dashboard' },
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
        <div style={{ display: 'flex', alignItems: 'center', margin: '25px auto' }}>
          <Logo style={{ alignSelf: 'center' }} />
          <LogoText className="showOnHover">HOPE</LogoText>
        </div>
        <Column style={{ width: '100%', paddingLeft: '22px' }}>
          {ROUTERS.map(({ title, router, icon }, index) => {
            if (currentTab() === index) {
              return (
                <NavLink key={index} to={router}>
                  <SidebarSelected>
                    <Icon className="iconfont" dangerouslySetInnerHTML={{ __html: icon }} />
                    <SidebarText className="showOnHover">{title}</SidebarText>
                  </SidebarSelected>
                </NavLink>
              )
            }
            // if (currentTab + 1 === index) {
            //   return (
            //     <SidebarSelectedNext key={index} onClick={() => setCurrentTab(index)}>
            //       <Icon className="iconfont" dangerouslySetInnerHTML={{ __html: icon }} />{' '}
            //     </SidebarSelectedNext>
            //   )
            // }
            return (
              <NavLink key={index} to={router}>
                <SidebarIcon key={index}>
                  <Icon className="iconfont" dangerouslySetInnerHTML={{ __html: icon }} />
                  <SidebarText className="showOnHover">{title}</SidebarText>
                </SidebarIcon>
              </NavLink>
            )
          })}
        </Column>
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
