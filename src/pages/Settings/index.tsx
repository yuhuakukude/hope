import { AutoColumn } from '../../components/Column'
import { LightCard } from '../../components/Card'
import { X } from 'react-feather'
import { ArrowLeft } from 'react-feather'
import { Text } from 'rebass'
import TransactionSettings from '../../components/TransactionSettings'
import { RowBetween, RowFixed } from '../../components/Row'
import { StyledInternalLink, TYPE } from '../../theme'
import QuestionHelper from '../../components/QuestionHelper'
import Toggle from '../../components/Toggle'
import ReactGA from 'react-ga'
import React, { useContext, useState } from 'react'
import styled, { ThemeContext } from 'styled-components'
import {
  useExpertModeManager,
  useUserSingleHopOnly,
  useUserSlippageTolerance,
  useUserTransactionTTL
} from '../../state/user/hooks'
import Modal from '../../components/Modal'
import { ButtonError } from '../../components/Button'
import { useToggleSettingsMenu } from '../../state/application/hooks'

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
  padding: 0px 0px 200px 0px;
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
  background-color: ${({ theme }) => theme.bg2};
  border-radius: 20px;
`

export default function SettingPage() {
  const [userSlippageTolerance, setUserslippageTolerance] = useUserSlippageTolerance()
  const [ttl, setTtl] = useUserTransactionTTL()
  const theme = useContext(ThemeContext)
  const [expertMode, toggleExpertMode] = useExpertModeManager()
  const [showConfirmation, setShowConfirmation] = useState(false)
  const toggle = useToggleSettingsMenu()
  const [singleHopOnly, setSingleHopOnly] = useUserSingleHopOnly()

  return (
    <LightCard width={'fit-content'}>
      <Modal isOpen={showConfirmation} onDismiss={() => setShowConfirmation(false)} maxHeight={100}>
        <ModalContentWrapper>
          <AutoColumn gap="lg">
            <RowBetween style={{ padding: '0 2rem' }}>
              <div />
              <Text fontWeight={500} fontSize={20}>
                Are you sure?
              </Text>
              <StyledCloseIcon onClick={() => setShowConfirmation(false)} />
            </RowBetween>
            <Break />
            <AutoColumn gap="lg" style={{ padding: '0 2rem' }}>
              <Text fontWeight={500} fontSize={20}>
                Expert mode turns off the confirm transaction prompt and allows high slippage trades that often result
                in bad rates and lost funds.
              </Text>
              <Text fontWeight={600} fontSize={20}>
                ONLY USE THIS MODE IF YOU KNOW WHAT YOU ARE DOING.
              </Text>
              <ButtonError
                error={true}
                padding={'12px'}
                onClick={() => {
                  if (window.prompt(`Please type the word "confirm" to enable expert mode.`) === 'confirm') {
                    toggleExpertMode()
                    setShowConfirmation(false)
                  }
                }}
              >
                <Text fontSize={20} fontWeight={500} id="confirm-expert-mode">
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
        <AutoColumn gap="lg" style={{ padding: '1rem' }}>
          <RowFixed>
            <StyledInternalLink color={theme.text1} to={'/swap/exchange'}>
              <ArrowLeft />
            </StyledInternalLink>
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
          <Text fontWeight={600} fontSize={14}>
            Interface Settings
          </Text>
          <RowBetween>
            <RowFixed>
              <TYPE.black fontWeight={400} fontSize={14} color={theme.text2}>
                Toggle Expert Mode
              </TYPE.black>
              <QuestionHelper text="Bypasses confirmation modals and allows high slippage trades. Use at your own risk." />
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
              <TYPE.black fontWeight={400} fontSize={14} color={theme.text2}>
                Disable Multihops
              </TYPE.black>
              <QuestionHelper text="Restricts swaps to direct pairs only." />
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
      </MenuFlyout>
    </LightCard>
  )
}
