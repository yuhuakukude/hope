import { ChainId, Currency } from '@uniswap/sdk'
import React, { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'
import Modal from '../Modal'
import { ExternalLink } from '../../theme'
import { Text } from 'rebass'
import { CloseIcon } from '../../theme/components'
import { RowBetween, RowFixed } from '../Row'
import { CheckCircle } from 'react-feather'
import { ButtonPrimary, ButtonLight } from '../Button'
import { AutoColumn, ColumnCenter } from '../Column'
import MetaMaskLogo from '../../assets/images/metamask.png'
import { getEtherscanLink } from '../../utils'
import { useActiveWeb3React } from '../../hooks'
import useAddTokenToMetamask from 'hooks/useAddTokenToMetamask'
import { ReactComponent as Commited } from '../../assets/svg/commited.svg'
import { ReactComponent as Warning } from '../../assets/svg/warning.svg'
import { ReactComponent as Reject } from '../../assets/svg/reject.svg'
import { ReactComponent as Wallet } from '../../assets/svg/wallet.svg'
import { NavLink } from 'react-router-dom'

const Wrapper = styled.div`
  width: 100%;
`
const Section = styled(AutoColumn)`
  padding: 24px;
`

const BottomSection = styled(Section)`
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
`

const ConfirmedIcon = styled(ColumnCenter)`
  padding: 32px 0 20px 0;
`

const StyledLogo = styled.img`
  height: 16px;
  width: 16px;
  margin-left: 6px;
`

function ConfirmationPendingContent({ onDismiss, pendingText }: { onDismiss: () => void; pendingText: string }) {
  return (
    <Wrapper>
      <Section>
        <RowBetween>
          <div />
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        <ConfirmedIcon>
          <Wallet />
        </ConfirmedIcon>
        <AutoColumn gap="12px" justify={'center'}>
          <Text fontWeight={500} fontSize={20}>
            Waiting For Confirmation
          </Text>
          <AutoColumn gap="12px" justify={'center'}>
            <Text fontWeight={600} fontSize={16} color="#A8A8AA" textAlign="center">
              {pendingText}
            </Text>
          </AutoColumn>
          <Text padding={20} fontSize={16} color="#FFFFFF" textAlign="center">
            Confirm this transaction in your wallet
          </Text>
        </AutoColumn>
      </Section>
    </Wrapper>
  )
}

function TransactionSubmittedContent({
  onDismiss,
  chainId,
  hash,
  currencyToAdd,
  isToGomboc
}: {
  onDismiss: () => void
  hash: string | undefined
  chainId: ChainId
  currencyToAdd?: Currency | undefined
  isToGomboc?: boolean
}) {
  const theme = useContext(ThemeContext)

  const { library } = useActiveWeb3React()

  const { addToken, success } = useAddTokenToMetamask(currencyToAdd)

  return (
    <Wrapper>
      <Section>
        <RowBetween>
          <div />
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        <ConfirmedIcon>
          <Commited />
        </ConfirmedIcon>
        <AutoColumn justify={'center'}>
          <Text fontWeight={500} fontSize={18}>
            Transaction Submitted
          </Text>
          {currencyToAdd && library?.provider?.isMetaMask && (
            <ButtonLight
              mt={isToGomboc ? '35px' : '80px'}
              height="56px"
              width="440px"
              color="rgba(38, 38, 44, 1)"
              onClick={addToken}
            >
              {!success ? (
                <RowFixed color="rgba(38, 38, 44, 1)">
                  Add {currencyToAdd.symbol} to Metamask <StyledLogo src={MetaMaskLogo} />
                </RowFixed>
              ) : (
                <RowFixed color="rgba(38, 38, 44, 1)">
                  Added {currencyToAdd.symbol}{' '}
                  <CheckCircle size={'16px'} stroke={theme.green1} style={{ marginLeft: '6px' }} />
                </RowFixed>
              )}
            </ButtonLight>
          )}
          {chainId && hash && (
            <ExternalLink href={getEtherscanLink(chainId, hash, 'transaction')}>
              <Text mt="30px" mb="30px" fontWeight={500} fontSize={16} color={theme.primary1}>
                View on Etherscan
              </Text>
            </ExternalLink>
          )}
          {isToGomboc && (
            <div
              className="m-b-10 p-20"
              style={{ borderRadius: '10px', backgroundColor: '#33333C', border: '0.5px solid #5A5A5B' }}
            >
              <div className="flex">
                <div className="icon m-r-15 m-t-5">
                  <i className="iconfont font-nor text-primary font-bold">&#xe614;</i>
                </div>
                <div>
                  <p className="font-nor" style={{ lineHeight: '24px' }}>
                    After Locked LT, you need to refresh accordingly to complete the update of boost and voting power.
                  </p>
                  <NavLink to={'/dao/gomboc'}>
                    <Text mt="12px" fontWeight={500} fontSize={16} color={theme.primary1}>
                      Learn more
                    </Text>
                  </NavLink>
                </div>
              </div>
            </div>
          )}
          {/* <ButtonPrimary onClick={onDismiss} style={{ margin: '30px 0' }}>
            <Text fontWeight={500} fontSize={20}>
              Close
            </Text>
          </ButtonPrimary> */}
        </AutoColumn>
      </Section>
    </Wrapper>
  )
}

export function ConfirmationModalContent({
  title,
  bottomContent,
  onDismiss,
  topContent
}: {
  title: string
  onDismiss: () => void
  topContent: () => React.ReactNode
  bottomContent: () => React.ReactNode
}) {
  return (
    <Wrapper>
      <Section>
        <RowBetween>
          <Text fontWeight={500} fontSize={20}>
            {title}
          </Text>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        {topContent()}
      </Section>
      <BottomSection gap="12px">{bottomContent()}</BottomSection>
    </Wrapper>
  )
}

export function TransactionErrorContent({
  errorCode,
  message,
  onDismiss
}: {
  errorCode?: number
  message: string
  onDismiss: () => void
}) {
  const theme = useContext(ThemeContext)
  return (
    <Wrapper>
      <Section>
        <RowBetween>
          <Text fontWeight={500} fontSize={20}>
            {''}
          </Text>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        <AutoColumn style={{ marginTop: 20, padding: '30px 0' }} gap="30px" justify="center">
          {errorCode === 4001 ? (
            <>
              <Reject />
              <Text fontWeight={500} fontSize={16} color={theme.text1} style={{ textAlign: 'center', width: '85%' }}>
                Transaction Reject
              </Text>
            </>
          ) : (
            <>
              <Warning />
              <Text
                overflow={'auto'}
                fontWeight={500}
                fontSize={16}
                color={theme.red1}
                style={{ textAlign: 'center', width: '85%' }}
              >
                {message}
              </Text>
            </>
          )}
        </AutoColumn>
      </Section>
      <BottomSection gap="12px">
        <ButtonPrimary onClick={onDismiss}>Dismiss</ButtonPrimary>
      </BottomSection>
    </Wrapper>
  )
}

interface ConfirmationModalProps {
  isOpen: boolean
  onDismiss: () => void
  hash: string | undefined
  content: () => React.ReactNode
  attemptingTxn: boolean
  pendingText: string
  currencyToAdd?: Currency | undefined
  isToGomboc?: boolean
}

export default function TransactionConfirmationModal({
  isOpen,
  onDismiss,
  attemptingTxn,
  hash,
  pendingText,
  content,
  currencyToAdd,
  isToGomboc
}: ConfirmationModalProps) {
  const { chainId } = useActiveWeb3React()

  if (!chainId) return null

  // confirmation screen
  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
      {attemptingTxn ? (
        <ConfirmationPendingContent onDismiss={onDismiss} pendingText={pendingText} />
      ) : hash ? (
        <TransactionSubmittedContent
          chainId={chainId}
          hash={hash}
          onDismiss={onDismiss}
          currencyToAdd={currencyToAdd}
          isToGomboc={isToGomboc}
        />
      ) : (
        content()
      )}
    </Modal>
  )
}
