import React, { useState } from 'react'
import Modal from '../Modal'
import { AutoColumn } from '../Column'
import styled from 'styled-components'
import { RowBetween } from '../Row'
import { TYPE, CloseIcon } from '../../theme'
import { ButtonError } from '../Button'
import { PoolInfo } from '../../state/stake/hooks'
import { useStakingContract } from '../../hooks/useContract'
import { SubmittedView, LoadingView } from '../ModalViews'
import { TransactionResponse } from '@ethersproject/providers'
import { useTransactionAdder } from '../../state/transactions/hooks'
import FormattedCurrencyAmount from '../FormattedCurrencyAmount'
import { useActiveWeb3React } from '../../hooks'
import { useTokenBalance } from '../../state/wallet/hooks'
import { useSingleCallResult } from '../../state/multicall/hooks'
import { TokenAmount } from '@uniswap/sdk'
import { getLTToken } from 'utils/addressHelpers'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
  stakingInfo: PoolInfo
}

export default function UnstakingModal({ isOpen, onDismiss, stakingInfo }: StakingModalProps) {
  const { account, chainId } = useActiveWeb3React()
  const stakingContract = useStakingContract(stakingInfo.stakingRewardAddress)
  const stakedAmount = useTokenBalance(account ?? undefined, stakingInfo.lpToken)
  const earnedRes = useSingleCallResult(stakingContract, 'claimableTokens', [account ?? undefined])
  const earnedAmount = new TokenAmount(getLTToken(chainId), earnedRes?.result?.[0] ?? '0')
  // monitor call to help UI loading state
  const addTransaction = useTransactionAdder()
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)

  function wrappedOndismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  async function onWithdraw() {
    if (stakingContract && stakedAmount) {
      setAttempting(true)
      await stakingContract
        .exit({ gasLimit: 300000 })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Withdraw deposited liquidity`
          })
          setHash(response.hash)
        })
        .catch((error: any) => {
          setAttempting(false)
          console.log(error)
        })
    }
  }

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }
  if (!stakedAmount) {
    error = error ?? 'Enter an amount'
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOndismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <TYPE.mediumHeader>Withdraw</TYPE.mediumHeader>
            <CloseIcon onClick={wrappedOndismiss} />
          </RowBetween>
          {stakedAmount && (
            <AutoColumn justify="center" gap="md">
              <TYPE.body fontWeight={600} fontSize={36}>
                {<FormattedCurrencyAmount currencyAmount={stakedAmount} />}
              </TYPE.body>
              <TYPE.body>Deposited liquidity:</TYPE.body>
            </AutoColumn>
          )}
          {earnedAmount && (
            <AutoColumn justify="center" gap="md">
              <TYPE.body fontWeight={600} fontSize={36}>
                {<FormattedCurrencyAmount currencyAmount={earnedAmount} />}
              </TYPE.body>
              <TYPE.body>Unclaimed UNI</TYPE.body>
            </AutoColumn>
          )}
          <TYPE.subHeader style={{ textAlign: 'center' }}>
            When you withdraw, your UNI is claimed and your liquidity is removed from the mining pool.
          </TYPE.subHeader>
          <ButtonError disabled={!!error} error={!!error && !!stakedAmount} onClick={onWithdraw}>
            {error ?? 'Withdraw & Claim'}
          </ButtonError>
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOndismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.body>Withdrawing {stakedAmount?.toFixed(2)} UNI-V2</TYPE.body>
            <TYPE.body>Claiming {stakedAmount?.toFixed(2)} UNI</TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {hash && (
        <SubmittedView onDismiss={wrappedOndismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>Withdrew UNI-V2!</TYPE.body>
            <TYPE.body fontSize={20}>Claimed UNI!</TYPE.body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}
