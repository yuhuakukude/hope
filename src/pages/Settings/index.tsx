import { AutoColumn } from '../../components/Column'
import { LightCard } from '../../components/Card'
import { X } from 'react-feather'
import { ArrowLeft } from 'react-feather'
import { Text } from 'rebass'
import TransactionSettings from '../../components/TransactionSettings'
import { RowBetween, RowFixed } from '../../components/Row'
import { TYPE } from '../../theme'
import { Tooltip } from 'antd'
import Toggle from '../../components/Toggle'
import ReactGA from 'react-ga'
import React, { useState } from 'react'
import styled from 'styled-components'
import {
  useExpertModeManager,
  useUserSingleHopOnly,
  useUserSlippageTolerance,
  useUserTransactionTTL
} from '../../state/user/hooks'
import Modal from '../../components/Modal'
import { ButtonError } from '../../components/Button'
import { useToggleSettingsMenu } from '../../state/application/hooks'
import { useHistory } from 'react-router-dom'

const StyledCloseIcon = styled(X)`
  height: 20px;
  width: 20px;
  :hover {
    cursor: pointer;
  }

  > * {
    stroke: ${({ theme }) => theme.text1};
  }
`

// const StyledMenuButton = styled.button`
//   position: relative;
//   width: 100%;
//   height: 100%;
//   border: none;
//   background-color: transparent;
//   margin: 0;
//   padding: 0;
//   height: 35px;
//
//   padding: 0.15rem 0.5rem;
//   border-radius: 0.5rem;
//
//   :hover,
//   :focus {
//     cursor: pointer;
//     outline: none;
//   }
//
//   svg {
//     margin-top: 2px;
//   }
// `
// const EmojiWrapper = styled.div`
//   position: absolute;
//   bottom: -6px;
//   right: 0px;
//   font-size: 14px;
// `

const MenuFlyout = styled.span`
  padding: 0px 10px 20px 10px;
  width: fit-content;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  z-index: 999;
`

const Break = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.bg3};
`

const ModalContentWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  border-radius: 20px;
`

export default function SettingPage() {
  const history = useHistory()
  const [userSlippageTolerance, setUserslippageTolerance] = useUserSlippageTolerance()
  const [ttl, setTtl] = useUserTransactionTTL()
  const [expertMode, toggleExpertMode] = useExpertModeManager()
  const [showConfirmation, setShowConfirmation] = useState(false)
  const toggle = useToggleSettingsMenu()
  const [singleHopOnly, setSingleHopOnly] = useUserSingleHopOnly()

  return (
    <LightCard width={'420px'} borderRadius={'20px'}>
      <Modal
        maxWidth={420}
        width={420}
        isOpen={showConfirmation}
        onDismiss={() => setShowConfirmation(false)}
        maxHeight={100}
      >
        <ModalContentWrapper>
          <AutoColumn gap="lg">
            <RowBetween style={{ padding: '0 2rem' }}>
              <Text fontWeight={700} fontSize={20}>
                Are you sure?
              </Text>
              <StyledCloseIcon onClick={() => setShowConfirmation(false)} />
            </RowBetween>
            <Break />
            <AutoColumn gap="lg" style={{ padding: '0 2rem' }}>
              <Text fontWeight={500} fontSize={16}>
                Expert mode turns off the confirm transaction prompt and allows high slippage trades that often result
                in bad rates and lost funds.
              </Text>
              <RowFixed align={'flex-start'}>
                <i style={{ color: '#FFDE29' }} className="iconfont text-normal">
                  &#xe614;
                </i>
                <Text ml={12} color={'#FFDE29'} fontWeight={700} fontSize={18}>
                  ONLY USE THIS MODE IF YOU KNOW WHAT YOU ARE DOING.
                </Text>
              </RowFixed>
              <ButtonError
                padding={'12px'}
                onClick={() => {
                  if (window.prompt(`Please type the word "confirm" to enable expert mode.`) === 'confirm') {
                    toggleExpertMode()
                    setShowConfirmation(false)
                  }
                }}
              >
                <Text fontSize={16} fontWeight={500} id="confirm-expert-mode">
                  Turn On Expert Mode
                </Text>
              </ButtonError>
            </AutoColumn>
          </AutoColumn>
        </ModalContentWrapper>
      </Modal>
      {/*<StyledMenuButton onClick={toggle} id="open-settings-dialog-button">*/}
      {/*  {expertMode ? (*/}
      {/*    <EmojiWrapper>*/}
      {/*      <span role="img" aria-label="wizard-icon">*/}
      {/*        🧙*/}
      {/*      </span>*/}
      {/*    </EmojiWrapper>*/}
      {/*  ) : null}*/}
      {/*</StyledMenuButton>*/}
      <MenuFlyout>
        <AutoColumn gap="lg" style={{ paddingTop: '10px' }}>
          <RowFixed style={{ cursor: 'pointer' }} onClick={() => history.goBack()}>
            <ArrowLeft />
            <Text ml={13} fontWeight={600} fontSize={16}>
              Transaction Settings
            </Text>
          </RowFixed>
          <TransactionSettings
            rawSlippage={userSlippageTolerance}
            setRawSlippage={setUserslippageTolerance}
            deadline={ttl}
            setDeadline={setTtl}
          />
          <TYPE.main fontWeight={600} fontSize={14}>
            Interface Settings
          </TYPE.main>
          <AutoColumn gap="sm">
            <RowBetween>
              <RowFixed>
                <TYPE.white fontWeight={700} fontSize={14}>
                  Toggle Expert Mode
                </TYPE.white>
                <Tooltip
                  className="m-l-5"
                  overlayClassName="tips-question"
                  title="Bypasses confirmation modals and allows high slippage trades. Use at your own risk."
                >
                  <i className="iconfont font-14 cursor-select tips-circle">&#xe620;</i>
                </Tooltip>
              </RowFixed>
              <Toggle
                id="toggle-expert-mode-button"
                isActive={expertMode}
                toggle={
                  expertMode
                    ? () => {
                        toggleExpertMode()
                        setShowConfirmation(false)
                      }
                    : () => {
                        toggle()
                        setShowConfirmation(true)
                      }
                }
              />
            </RowBetween>
            <RowBetween>
              <RowFixed>
                <TYPE.white fontWeight={700} fontSize={14}>
                  Disable Multihops
                </TYPE.white>
                <Tooltip
                  className="m-l-5"
                  overlayClassName="tips-question"
                  title="Restricts swaps to direct pairs only."
                >
                  <i className="iconfont font-14 cursor-select tips-circle">&#xe620;</i>
                </Tooltip>
              </RowFixed>
              <Toggle
                id="toggle-disable-multihop-button"
                isActive={singleHopOnly}
                toggle={() => {
                  ReactGA.event({
                    category: 'Routing',
                    action: singleHopOnly ? 'disable single hop' : 'enable single hop'
                  })
                  setSingleHopOnly(!singleHopOnly)
                }}
              />
            </RowBetween>
          </AutoColumn>
        </AutoColumn>
      </MenuFlyout>
    </LightCard>
  )
}
