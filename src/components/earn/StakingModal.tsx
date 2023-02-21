import React, { useCallback } from 'react'
import Modal from '../Modal'
import { AutoColumn } from '../Column'
import styled from 'styled-components'
import { RowBetween } from '../Row'
import { TYPE, CloseIcon } from '../../theme'
import { ButtonError } from '../Button'
import CurrencyInputPanel from '../CurrencyInputPanel'
import { TokenAmount, Pair } from '@uniswap/sdk'
import { useActiveWeb3React } from '../../hooks'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { PoolInfo, useDerivedStakeInfo } from '../../state/stake/hooks'
import { useTokenBalance } from '../../state/wallet/hooks'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 2rem;
`

export enum STAKE_ACTION {
  STAKE,
  UNSTAKE
}

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
  typedValue: string
  action: STAKE_ACTION
  onTyped: (value: string) => void
  stakingInfo: PoolInfo
  onStake: (action: STAKE_ACTION) => void
}

export default function StakingModal({
  isOpen,
  onDismiss,
  action,
  stakingInfo,
  typedValue,
  onTyped,
  onStake
}: StakingModalProps) {
  const { account } = useActiveWeb3React()
  const userLiquidityUnstaked = useTokenBalance(account ?? undefined, stakingInfo.lpToken)
  const stakedAmount = useTokenBalance(account ?? undefined, stakingInfo.stakingToken)

  // track and parse user input
  //const [typedValue, setTypedValue] = useState('')
  const { parsedAmount, error } = useDerivedStakeInfo(
    typedValue,
    stakingInfo.lpToken,
    action === STAKE_ACTION.STAKE ? userLiquidityUnstaked : stakedAmount
  )

  // state for pending and submitted txn views
  const wrappedOnDismiss = useCallback(() => {
    onDismiss()
  }, [onDismiss])

  // pair contract for this token to be staked
  const dummyPair = new Pair(new TokenAmount(stakingInfo.tokens[0], '0'), new TokenAmount(stakingInfo.tokens[1], '0'))

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback(
    (typedValue: string) => {
      onTyped(typedValue)
    },
    [onTyped]
  )

  // used for max input button
  const maxAmountInput = maxAmountSpend(userLiquidityUnstaked)
  const atMaxAmount = Boolean(maxAmountInput && parsedAmount?.equalTo(maxAmountInput))
  const handleMax = useCallback(() => {
    maxAmountInput && onUserInput(maxAmountInput.toExact())
  }, [maxAmountInput, onUserInput])

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      <ContentWrapper gap="lg">
        <RowBetween>
          <TYPE.mediumHeader>{action === STAKE_ACTION.STAKE ? 'Deposit' : 'Withdraw'}</TYPE.mediumHeader>
          <CloseIcon onClick={wrappedOnDismiss} />
        </RowBetween>
        <CurrencyInputPanel
          value={typedValue}
          onUserInput={onUserInput}
          onMax={handleMax}
          showMaxButton={!atMaxAmount}
          currency={action === STAKE_ACTION.STAKE ? stakingInfo.totalStakedAmount?.token : stakingInfo.stakingToken}
          pair={dummyPair}
          label={''}
          disableCurrencySelect={true}
          customBalanceText={`Available to ${action === STAKE_ACTION.STAKE ? 'Deposit' : 'Withdraw'}: `}
          id="stake-liquidity-token"
        />

        <RowBetween>
          <ButtonError
            disabled={!!error && error !== 'Connect Wallet'}
            error={!!error && !!parsedAmount}
            onClick={() => onStake(action)}
          >
            {error ?? `${action === STAKE_ACTION.STAKE ? 'Deposit' : 'Withdraw'}`}
          </ButtonError>
        </RowBetween>
      </ContentWrapper>
    </Modal>
  )
}
