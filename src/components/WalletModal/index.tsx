import { AbstractConnector } from '@web3-react/abstract-connector'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import React, { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import ReactGA from 'react-ga'
import styled from 'styled-components'
import MetamaskIcon from '../../assets/images/metamask.png'
import { ReactComponent as Close } from '../../assets/images/x.svg'
import { fortmatic, injected, NETWORK_CHAIN_ID, portis } from '../../connectors'
import { OVERLAY_READY } from '../../connectors/Fortmatic'
import { SUPPORTED_NETWORKS, SUPPORTED_WALLETS } from '../../constants'
import usePrevious from '../../hooks/usePrevious'
import { ApplicationModal } from '../../state/application/actions'
import { useModalOpen, useWalletModalToggle } from '../../state/application/hooks'
import { setInjectedConnected } from 'utils/isInjectedConnectedPrev'
// import { ExternalLink } from '../../theme'

import Modal from '../Modal'
import Option from './Option'
import PendingView from './PendingView'
import TransactionModal from './TransactionModal'
import WalletDetail from './WalletDetail'
import { Checkbox } from 'antd'
import useTheme from '../../hooks/useTheme'
import { PrimaryText } from '../Text'
import { AutoColumn } from '../Column'
import { ReactComponent as Warning } from '../../assets/svg/warning.svg'
import { TYPE } from '../../theme'
import { ButtonPrimary } from '../Button'
import { ChainId } from '@uniswap/sdk'
import { HOME_API } from '../../constants'

import './index.scss'

const CloseIcon = styled.div`
  position: absolute;
  right: 1rem;
  top: 14px;

  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`

const CloseColor = styled(Close)`
  path {
    stroke: ${({ theme }) => theme.text4};
  }
`

const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  margin: 0;
  padding: 0;
  width: 500px;
  // position: fixed;
    // background: ${({ theme }) => theme.bg1};
  // border-radius: 20px;
  // top: 60px;
  // right: 20px;
`

const HeaderRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  font-weight: 500;
  font-size: 18px;
  color: ${props => (props.color === 'blue' ? ({ theme }) => theme.primary1 : 'inherit')};
`

const ContentWrapper = styled.div``

const UpperSection = styled.div`
  position: relative;
  padding: 30px;

  h5 {
    margin: 0;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: 400;
  }

  h5:last-child {
    margin-bottom: 0px;
  }

  h4 {
    margin-top: 0;
    font-weight: 500;
  }
`

const OptionGrid = styled.div`
  display: grid;
  grid-gap: 20px;
  margin-top: 30px;
`

const HoverText = styled.div`
  :hover {
    cursor: pointer;
  }
`

const WALLET_VIEWS = {
  OPTIONS: 'options',
  OPTIONS_SECONDARY: 'options_secondary',
  ACCOUNT: 'account',
  PENDING: 'pending'
}

export default function WalletModal() {
  // important that these are destructed from the account-specific web3-react context
  const { active, account, connector, activate, error } = useWeb3React()

  const [isAgreeTerms, setIsAgreeTerms] = useState(false)
  const [isAgreeTermsError, setIsAgreeTermsError] = useState(false)

  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT)

  const [pendingWallet, setPendingWallet] = useState<AbstractConnector | undefined>()

  const [pendingError, setPendingError] = useState<boolean>()

  const walletModalOpen = useModalOpen(ApplicationModal.WALLET)
  const toggleWalletModal = useWalletModalToggle()

  const previousAccount = usePrevious(account)

  const [showTransaction, setShowTransaction] = useState(false)
  const theme = useTheme()

  // close on connection, when logged out before
  useEffect(() => {
    if (account && !previousAccount && walletModalOpen) {
      toggleWalletModal()
    }
  }, [account, previousAccount, toggleWalletModal, walletModalOpen])

  // always reset to account view
  useEffect(() => {
    if (walletModalOpen) {
      setPendingError(false)
      setWalletView(WALLET_VIEWS.ACCOUNT)
      setShowTransaction(false)
    }
  }, [walletModalOpen])

  // close modal when a connection is successful
  const activePrevious = usePrevious(active)
  const connectorPrevious = usePrevious(connector)
  useEffect(() => {
    if (walletModalOpen && ((active && !activePrevious) || (connector && connector !== connectorPrevious && !error))) {
      setWalletView(WALLET_VIEWS.ACCOUNT)
    }
  }, [setWalletView, active, error, connector, walletModalOpen, activePrevious, connectorPrevious])

  const tryActivation = async (connector: AbstractConnector | undefined) => {
    let name = ''
    Object.keys(SUPPORTED_WALLETS).map(key => {
      if (connector === SUPPORTED_WALLETS[key].connector) {
        return (name = SUPPORTED_WALLETS[key].name)
      }
      return true
    })
    // log selected wallet
    ReactGA.event({
      category: 'Wallet',
      action: 'Change Wallet',
      label: name
    })
    setPendingWallet(connector) // set wallet for pending view
    setWalletView(WALLET_VIEWS.PENDING)

    // if the connector is walletconnect and the user has already tried to connect, manually reset the connector
    if (connector instanceof WalletConnectConnector && connector.walletConnectProvider) {
      connector.walletConnectProvider = undefined
    }

    connector &&
      activate(connector, undefined, true)
        .then(() => {
          setInjectedConnected(connector)
        })
        .catch(error => {
          if (error instanceof UnsupportedChainIdError) {
            activate(connector) // a little janky...can't use setError because the connector isn't set
          } else {
            setPendingError(true)
          }
          setInjectedConnected()
        })
  }

  // close wallet modal if fortmatic modal is active
  useEffect(() => {
    fortmatic.on(OVERLAY_READY, () => {
      toggleWalletModal()
    })
  }, [toggleWalletModal])

  // get wallets user can switch too, depending on device/browser
  function getOptions() {
    const isMetamask = window.ethereum && window.ethereum.isMetaMask
    return Object.keys(SUPPORTED_WALLETS).map(key => {
      const option = SUPPORTED_WALLETS[key]
      // check for mobile options
      if (isMobile) {
        //disable portis on mobile for now
        if (option.connector === portis) {
          return null
        }

        if (!window.web3 && !window.ethereum && option.mobile) {
          return (
            <Option
              onClick={() => {
                option.connector !== connector && !option.href && tryActivation(option.connector)
              }}
              id={`connect-${key}`}
              key={key}
              active={option.connector && option.connector === connector}
              color={option.color}
              link={option.href}
              header={option.name}
              subheader={null}
              icon={require('../../assets/images/' + option.iconName)}
            />
          )
        }
        return null
      }

      // overwrite injected when needed
      if (option.connector === injected) {
        // don't show injected if there's no injected provider
        if (!(window.web3 || window.ethereum)) {
          if (option.name === 'MetaMask') {
            return (
              <Option
                id={`connect-${key}`}
                key={key}
                color={'#E8831D'}
                header={'Install Metamask'}
                subheader={null}
                link={'https://metamask.io/'}
                icon={MetamaskIcon}
                onClick={() => {
                  toggleWalletModal()
                }}
              />
            )
          } else {
            return null //dont want to return install twice
          }
        }
        // don't return metamask if injected provider isn't metamask
        else if (option.name === 'MetaMask' && !isMetamask) {
          return null
        }
        // likewise for generic
        else if (option.name === 'Injected' && isMetamask) {
          return null
        }
      }

      // return rest of options
      return (
        !isMobile &&
        !option.mobileOnly && (
          <Option
            id={`connect-${key}`}
            onClick={() => {
              if (!isAgreeTerms) {
                setIsAgreeTermsError(true)
              } else {
                setIsAgreeTerms(false)
                option.connector === connector
                  ? setWalletView(WALLET_VIEWS.ACCOUNT)
                  : !option.href && tryActivation(option.connector)
              }
            }}
            key={key}
            active={option.connector === connector}
            color={option.color}
            link={option.href}
            header={option.name}
            subheader={null} //use option.descriptio to bring back multi-line
            icon={require('../../assets/images/' + option.iconName)}
          />
        )
      )
    })
  }

  function getModalContent() {
    if (error) {
      const params = SUPPORTED_NETWORKS[NETWORK_CHAIN_ID as ChainId]
      return (
        <div className="wallet-modal-wrap">
          <UpperSection>
            <CloseIcon
              onClick={() => {
                setIsAgreeTerms(false)
                setIsAgreeTermsError(false)
                toggleWalletModal()
              }}
            >
              <CloseColor />
            </CloseIcon>
            <ContentWrapper>
              <AutoColumn justify={'center'} gap={'16px'}>
                <Warning />

                <TYPE.body mt={'8px'}>Error connecting</TYPE.body>
                {error instanceof UnsupportedChainIdError ? (
                  <>
                    <TYPE.main textAlign={'center'}>Please switch to {params?.chainName} </TYPE.main>
                    <ButtonPrimary
                      mt={'34px'}
                      onClick={() => {
                        return params?.nativeCurrency.symbol === 'ETH'
                          ? window.ethereum?.request?.({
                              method: 'wallet_switchEthereumChain',
                              params: [{ chainId: params.chainId }, account]
                            })
                          : window.ethereum?.request?.({ method: 'wallet_addEthereumChain', params: [params, account] })
                      }}
                    >
                      Switch Network
                    </ButtonPrimary>
                  </>
                ) : (
                  'Error connecting. Try refreshing the page.'
                )}
              </AutoColumn>
            </ContentWrapper>
          </UpperSection>
        </div>
      )
    }
    if (showTransaction) {
      return <TransactionModal setShowTransaction={setShowTransaction} />
    }
    if (account && walletView === WALLET_VIEWS.ACCOUNT) {
      return (
        <WalletDetail setShowTransaction={setShowTransaction} showTransaction={showTransaction} />
        // <AccountDetails
        //   toggleWalletModal={toggleWalletModal}
        //   pendingTransactions={pendingTransactions}
        //   confirmedTransactions={confirmedTransactions}
        //   ENSName={ENSName}
        //   openOptions={() => setWalletView(WALLET_VIEWS.OPTIONS)}
        // />
      )
    }
    return (
      <div className="wallet-modal-wrap">
        <UpperSection>
          <HeaderRow>
            <HoverText>
              <i
                onClick={() => {
                  setIsAgreeTerms(false)
                  setIsAgreeTermsError(false)
                  toggleWalletModal()
                }}
                className="iconfont"
                style={{
                  cursor: 'pointer',
                  marginRight: '13px',
                  fontSize: '22px',
                  fontWeight: 'bold',
                  verticalAlign: 'middle'
                }}
              >
                &#xe61a;
              </i>
              {walletView === WALLET_VIEWS.ACCOUNT && (
                <span style={{ display: 'inline-block', verticalAlign: 'middle' }}>Connect to a wallet</span>
              )}
            </HoverText>
          </HeaderRow>

          <ContentWrapper>
            {walletView !== WALLET_VIEWS.PENDING && (
              <div>
                <div style={{ color: 'white', marginBottom: '10px', display: 'flex', marginTop: '40px' }}>
                  <Checkbox
                    checked={isAgreeTerms}
                    onChange={e => {
                      setIsAgreeTerms(e.target.checked)
                    }}
                  />
                  <PrimaryText style={{ marginLeft: '8px', lineHeight: '24px' }}>
                    I have read, understand, and agree to the
                    <a
                      href={`${HOME_API}/hope-terms-service.pdf`}
                      style={{ color: theme.primary1 }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {' '}
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a
                      href={`${HOME_API}/hope-privacy-policy.pdf`}
                      style={{ color: theme.primary1 }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Privacy Policy
                    </a>
                  </PrimaryText>
                </div>
                {isAgreeTermsError && !isAgreeTerms && (
                  <p style={{ color: theme.red1, marginLeft: '25px' }}>Agreement is required to login</p>
                )}
              </div>
            )}
            {walletView === WALLET_VIEWS.PENDING ? (
              <PendingView
                onBack={() => setWalletView(WALLET_VIEWS.OPTIONS)}
                connector={pendingWallet}
                error={pendingError}
                setPendingError={setPendingError}
                tryActivation={tryActivation}
              />
            ) : (
              <OptionGrid>{getOptions()}</OptionGrid>
            )}
          </ContentWrapper>
        </UpperSection>
      </div>
    )
  }

  return (
    <Modal
      isOpen={walletModalOpen}
      onDismiss={() => {
        setIsAgreeTerms(false)
        setIsAgreeTermsError(false)
        toggleWalletModal()
      }}
      minHeight={false}
      maxHeight={90}
      topRight
    >
      <Wrapper>{getModalContent()}</Wrapper>
    </Modal>
  )
}
