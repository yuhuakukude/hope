import { AbstractConnector } from '@web3-react/abstract-connector'
import React from 'react'
import styled from 'styled-components'
import Circle from '../../assets/images/blue-loader.svg'
import { CustomLightSpinner } from '../../theme'
import { Text } from 'rebass'
import { AutoColumn } from '../Column'
import { ReactComponent as Warning } from '../../assets/svg/warning.svg'
import { TYPE } from '../../theme'
import { ButtonPrimary } from '../Button'

const PendingSection = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  width: 100%;
  & > * {
    width: 100%;
  }
`

const LoadingMessage = styled.div<{ error?: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  margin-bottom: 20px;
  color: ${({ theme, error }) => (error ? theme.red1 : 'inherit')};

  & > * {
    padding: 1rem;
  }
`

const LoadingWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const SpinnerView = styled.div`
  padding: 20px;
  margin: auto;
`

export default function PendingView({
  connector,
  error = false,
  setPendingError,
  tryActivation,
  onBack
}: {
  connector?: AbstractConnector
  error?: boolean
  setPendingError: (error: boolean) => void
  tryActivation: (connector: AbstractConnector) => void
  onBack: () => void
}) {
  //const isMetamask = window?.ethereum?.isMetaMask

  return (
    <PendingSection>
      <LoadingMessage error={error}>
        <LoadingWrapper>
          {error ? (
            <AutoColumn justify={'center'} gap={'16px'}>
              <Warning />
              <TYPE.body mt={'8px'}>Error connecting</TYPE.body>
              <TYPE.main textAlign={'center'}>
                The connection attempt failed. Please click try again and follow the steps to connect in your wallet.
              </TYPE.main>
              <ButtonPrimary
                mt={'34px'}
                onClick={() => {
                  setPendingError(false)
                  connector && tryActivation(connector)
                }}
              >
                Try Again
              </ButtonPrimary>
              <TYPE.link onClick={onBack} style={{ cursor: 'pointer' }} mt={'14px'}>
                Back to wallet selection
              </TYPE.link>
            </AutoColumn>
          ) : (
            <AutoColumn>
              <SpinnerView>
                <CustomLightSpinner src={Circle} alt="loader" size={'90px'} />
              </SpinnerView>
              <AutoColumn gap="20px" justify={'center'}>
                <Text fontWeight={500} fontSize={20}>
                  Waiting to connect
                </Text>
                <Text fontSize={16} color="#565A69" textAlign="center">
                  Confirm this connection in your wallet
                </Text>
              </AutoColumn>
            </AutoColumn>
          )}
        </LoadingWrapper>
      </LoadingMessage>
      {/*{Object.keys(SUPPORTED_WALLETS).map(key => {*/}
      {/*  const option = SUPPORTED_WALLETS[key]*/}
      {/*  if (option.connector === connector) {*/}
      {/*    if (option.connector === injected) {*/}
      {/*      if (isMetamask && option.name !== 'MetaMask') {*/}
      {/*        return null*/}
      {/*      }*/}
      {/*      if (!isMetamask && option.name === 'MetaMask') {*/}
      {/*        return null*/}
      {/*      }*/}
      {/*    }*/}
      {/*    return (*/}
      {/*      <Option*/}
      {/*        id={`connect-${key}`}*/}
      {/*        key={key}*/}
      {/*        clickable={false}*/}
      {/*        color={option.color}*/}
      {/*        header={option.name}*/}
      {/*        subheader={option.description}*/}
      {/*        icon={require('../../assets/images/' + option.iconName)}*/}
      {/*      />*/}
      {/*    )*/}
      {/*  }*/}
      {/*  return null*/}
      {/*})}*/}
    </PendingSection>
  )
}
