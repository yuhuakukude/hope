import React, { Suspense } from 'react'
import { Route, Switch } from 'react-router-dom'
import styled from 'styled-components'
import GoogleAnalyticsReporter from '../components/analytics/GoogleAnalyticsReporter'
import Header from '../components/Header'
import Polling from '../components/Header/Polling'
import URLWarning from '../components/Header/URLWarning'
import Popups from '../components/Popups'
import Web3ReactManager from '../components/Web3ReactManager'
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader'
import Manage from './Earn/Manage'
import MigrateV1 from './MigrateV1'
import MigrateV1Exchange from './MigrateV1/MigrateV1Exchange'
import RemoveV1Exchange from './MigrateV1/RemoveV1Exchange'
import PoolFinder from './PoolFinder'
import RemoveLiquidity from './RemoveLiquidity'
import Swap from './Swap'
import { OpenClaimAddressModalAndRedirectToSwap, RedirectPathToSwapOnly, RedirectToSwap } from './Swap/redirects'
import Vote from './Vote'
import VotePage from './Vote/VotePage'
import BuyHope from './BuyHope'
import Staking from './Staking'
import DaoGomboc from './DaoGomboc'
import DaoLocker from './Locker'
import Portfolio from './Portfolio'

import './App.css'
import '../assets/style/index.scss'
import SideBar from '../components/SideBar'
import { ModalProvider } from '../context/ModalContext'
import SettingPage from './Settings'
import StakingPoolDetail from './StakingPoolDetail'
import LiquidityStake from './LiquidityStake'
import TestComponent from './TestComponent'
import Pools from './Pools'
import LiquidityManager from './LiquidityManager'
import { RedirectDuplicateTokenIds, RedirectOldAddLiquidityPathStructure } from './LiquidityManager/redirects'
import LiquidityMining from './LiquidityMining'

import '../utils/resetCurrencyAmount'

const PageWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100vh;
`

const AppWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  width: 100%;
  overflow-x: hidden;
`

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: space-between;
`

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 30px;
  align-items: center;
  flex: 1;
  overflow-y: auto;
  overflow-x: scroll;
  z-index: 10;
  &::-webkit-scrollbar {
    display: none;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 16px;
    padding-top: 2rem;
  `};

  z-index: 1;
`

const Marginer = styled.div`
  margin-top: 5rem;
`

// function TopLevelModals() {
//   const open = useModalOpen(ApplicationModal.ADDRESS_CLAIM)
//   const toggle = useToggleModal(ApplicationModal.ADDRESS_CLAIM)
//   return <AddressClaimModal isOpen={open} onDismiss={toggle} />
// }

export default function App() {
  return (
    <Suspense fallback={null}>
      <Route component={GoogleAnalyticsReporter} />
      <Route component={DarkModeQueryParamReader} />
      <ModalProvider>
        <PageWrapper>
          <SideBar />
          <AppWrapper>
            <URLWarning />
            <HeaderWrapper>
              <Header />
            </HeaderWrapper>
            <BodyWrapper id="BodyWrapper">
              <Popups />
              <Polling />
              <Web3ReactManager>
                <Switch>
                  <Route exact strict path="/swap/settings" component={SettingPage} />
                  <Route exact strict path="/swap/exchange" component={Swap} />
                  <Route exact strict path="/swap/liquidity/manager" component={LiquidityManager} />
                  <Route exact strict path="/swap/liquidity" component={Pools} />
                  <Route exact strict path="/swap/find" component={PoolFinder} />
                  <Route exact strict path="/swap/liquidity/pool-detail/:address" component={StakingPoolDetail} />
                  <Route exact strict path="/swap/stake/:stakingRewardAddress" component={LiquidityStake} />
                  <Route exact strict path="/swap/liquidity/mining/:stakingRewardAddress" component={LiquidityMining} />
                  {/*<Route exact path="/swap/add" component={AddLiquidity} />*/}
                  <Route
                    exact
                    path="/swap/liquidity/manager/deposit/:currencyIdA"
                    component={RedirectOldAddLiquidityPathStructure}
                  />
                  <Route
                    exact
                    path="/swap/liquidity/manager/withdraw/:currencyIdA"
                    component={RedirectOldAddLiquidityPathStructure}
                  />
                  <Route
                    exact
                    path="/swap/liquidity/manager/deposit/:currencyIdA/:currencyIdB"
                    component={RedirectDuplicateTokenIds}
                  />
                  <Route
                    exact
                    path="/swap/liquidity/manager/withdraw/:currencyIdA/:currencyIdB"
                    component={RedirectDuplicateTokenIds}
                  />
                  <Route exact strict path="/claim" component={OpenClaimAddressModalAndRedirectToSwap} />
                  <Route exact strict path="/swap/exchange/:outputCurrency" component={RedirectToSwap} />
                  <Route exact strict path="/send" component={RedirectPathToSwapOnly} />
                  <Route exact strict path="/vote" component={Vote} />
                  {/*<Route exact strict path="/create" component={RedirectToAddLiquidity} />*/}
                  {/*<Route exact path="/create" component={AddLiquidity} />*/}
                  {/*<Route exact path="/create/:currencyIdA" component={RedirectOldAddLiquidityPathStructure} />*/}
                  {/*<Route exact path="/create/:currencyIdA/:currencyIdB" component={RedirectDuplicateTokenIds} />*/}
                  <Route exact strict path="/remove/v1/:address" component={RemoveV1Exchange} />
                  {/*<Route exact strict path="/remove/:tokens" component={RedirectOldRemoveLiquidityPathStructure} />*/}
                  <Route exact strict path="/remove/:currencyIdA/:currencyIdB" component={RemoveLiquidity} />
                  <Route exact strict path="/migrate/v1" component={MigrateV1} />
                  <Route exact strict path="/migrate/v1/:address" component={MigrateV1Exchange} />
                  <Route exact strict path="/uni/:currencyIdA/:currencyIdB" component={Manage} />
                  <Route exact strict path="/vote/:id" component={VotePage} />
                  <Route exact strict path="/hope/staking" component={Staking} />
                  <Route exact strict path="/hope/buy-hope" component={BuyHope} />
                  <Route exact strict path="/dao/gomboc" component={DaoGomboc} />
                  <Route exact strict path="/dao/locker" component={DaoLocker} />
                  <Route exact strict path="/staking" component={Staking} />
                  <Route exact strict path="/buy-hope" component={BuyHope} />
                  <Route exact strict path="/dao-gomboc" component={DaoGomboc} />
                  <Route exact strict path="/dao-locker" component={DaoLocker} />
                  <Route exact strict path="/portfolio" component={Portfolio} />
                  <Route exact strict path="/test" component={TestComponent} />
                  <Route component={RedirectPathToSwapOnly} />
                </Switch>
              </Web3ReactManager>
              <Marginer />
            </BodyWrapper>
          </AppWrapper>
        </PageWrapper>
      </ModalProvider>
    </Suspense>
  )
}
