import styled from 'styled-components'
import { ReactComponent as Logo } from 'assets/svg/sidebar-logo.svg'
import React, { useState } from 'react'
import Column, { AutoColumn } from '../Column'
import { ReactComponent as Twitter } from 'assets/svg/sidebar-twitter.svg'
import { ReactComponent as Medium } from 'assets/svg/sidebar-medium.svg'
import { ReactComponent as Telegram } from 'assets/svg/sidebar-telegram.svg'
import { ReactComponent as Discord } from 'assets/svg/sidebar-discord.svg'
import { ReactComponent as Email } from 'assets/svg/sidebar-email.svg'
import { Text } from 'rebass'

// const SideBarTab = styled('button')``

const Bar = styled('div')`
  display: flex;
  background: #26262c;
  min-width: 100px;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
`

const SidebarIcon = styled('div')`
  color: white;
  font-size: 20px;
  display: flex;
  height: 60px;
  width: 100%;
  :hover {
    cursor: pointer;
  }
`

const SidebarSelectedPre = styled(SidebarIcon)``
const SidebarSelected = styled(SidebarIcon)`
  background-color: ${({ theme }) => theme.bg2};
  border-radius: 30px 0 0 30px;
  color: ${({ theme }) => theme.primary1};
`
const SidebarSelectedNext = styled(SidebarIcon)``

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

export default function SideBar() {
  const [currentTab, setCurrentTab] = useState(0)

  const icons = ['&#xe607;', '&#xe609;', '&#xe606;', '&#xe605;', '&#xe608;']

  return (
    <Bar>
      <Column style={{ width: '100%' }}>
        <Logo style={{ alignSelf: 'center', margin: '25px auto' }} />
        <Column style={{ width: '100%', paddingLeft: '22px' }}>
          {icons.map((icon, index) => {
            if (currentTab - 1 === index) {
              return (
                <SidebarSelectedPre key={index} onClick={() => setCurrentTab(index)}>
                  <Icon className="iconfont" dangerouslySetInnerHTML={{ __html: icon }} />
                </SidebarSelectedPre>
              )
            }
            if (currentTab === index) {
              return (
                <SidebarSelected key={index} onClick={() => setCurrentTab(index)}>
                  <Icon className="iconfont" dangerouslySetInnerHTML={{ __html: icon }} />{' '}
                </SidebarSelected>
              )
            }
            if (currentTab + 1 === index) {
              return (
                <SidebarSelectedNext key={index} onClick={() => setCurrentTab(index)}>
                  <Icon className="iconfont" dangerouslySetInnerHTML={{ __html: icon }} />{' '}
                </SidebarSelectedNext>
              )
            }
            return (
              <SidebarIcon key={index} onClick={() => setCurrentTab(index)}>
                <Icon className="iconfont" dangerouslySetInnerHTML={{ __html: icon }} />{' '}
              </SidebarIcon>
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
