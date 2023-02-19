import React, { useCallback, useState } from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { TYPE } from '../../theme'
import { AutoRow, RowFixed } from '../../components/Row'
import { CardSection, DataCard, EarnBGImage } from '../../components/earn/styled'
import Loader from '../../components/Loader'
import { OutlineCard } from '../../components/Card'
import SearchSelect from '../../components/SearchSelect'
import { useLPStakingInfos } from '../../hooks/useLPStaking'
import LTPoolCard from '../../components/earn/LTPoolCard'
import { PoolInfo } from '../../state/stake/hooks'
import StakingModal, { STAKE_ACTION } from '../../components/earn/StakingModal'
import TransactionConfirmationModal, { TransactionErrorContent } from '../../components/TransactionConfirmationModal'
import { TransactionResponse } from '@ethersproject/providers'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { PERMIT2_ADDRESS } from '../../constants'
import { tryParseAmount } from '../../state/swap/hooks'
import { useActiveWeb3React } from '../../hooks'
import { CurrencyAmount } from '@uniswap/sdk'
import JSBI from 'jsbi'
import { calculateGasMargin } from '../../utils'
import { useLtMinterContract, useStakingContract } from '../../hooks/useContract'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { getPermitData, Permit, PERMIT_EXPIRATION, toDeadline } from '../../permit2/domain'
import { ethers } from 'ethers'
import ClaimRewardModal from '../../components/earn/ClaimRewardModal'
import { useWalletModalToggle } from '../../state/application/hooks'

const PageWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 0 30px;
`

const TopSection = styled(AutoColumn)`
  width: 100%;
`

const PoolSection = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  grid-template-columns: 1fr;
  column-gap: 15px;
  row-gap: 15px;
  width: 100%;
  justify-self: center;
`

// const DataRow = styled(RowBetween)`
//   ${({ theme }) => theme.mediaWidth.upToSmall`
// flex-direction: column;
// `};
// `

type Sort = 'asc' | 'desc'

export default function Earn() {
  const toggleWalletModal = useWalletModalToggle()
  const { chainId, account, library } = useActiveWeb3React()
  const [curType, setCurType] = useState(1)
  const [showStakeModal, setShowStakeModal] = useState(false)
  const [showClaimModal, setShowClaimModal] = useState(false)
  const addTransaction = useTransactionAdder()

  const [poolInfo, setPoolInfo] = useState<PoolInfo | undefined>()
  const [sort, setSort] = useState<Sort>('desc')
  const [errorStatus, setErrorStatus] = useState<{ code: number; message: string } | undefined>()
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm
  const [txHash, setTxHash] = useState<string>('')
  const [pendingText, setPendingText] = useState('')
  const [typedValue, setTypedValue] = useState('')
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [action, setAction] = useState<STAKE_ACTION>(STAKE_ACTION.STAKE)
  const [inputValue, setInputValue] = useState('')
  console.log(curType, setCurType, setSort)
  const { result: stakingInfos, loading, tokenList } = useLPStakingInfos(inputValue, sort)
  // staking info for connected account

  const typedAmount = tryParseAmount(typedValue, poolInfo?.lpToken)

  const [approvalState, approveCallback] = useApproveCallback(typedAmount, PERMIT2_ADDRESS[chainId ?? 1])

  const stakingContract = useStakingContract(poolInfo?.stakingRewardAddress, true)

  const ltMinterContract = useLtMinterContract()

  const confirmationContent = useCallback(() => {
    return (
      errorStatus && (
        <TransactionErrorContent
          errorCode={errorStatus.code}
          onDismiss={() => setShowConfirm(false)}
          message={errorStatus.message}
        />
      )
    )
  }, [errorStatus])

  const onTxStart = useCallback(() => {
    setShowConfirm(true)
    setAttemptingTxn(true)
  }, [])

  const onTxSubmitted = useCallback((hash: string | undefined) => {
    setShowConfirm(true)
    setPendingText(``)
    setAttemptingTxn(false)
    hash && setTxHash(hash)
  }, [])

  const onTxError = useCallback(error => {
    setShowConfirm(true)
    setTxHash('')
    setPendingText(``)
    setAttemptingTxn(false)
    setErrorStatus({ code: error?.code, message: error.message })
  }, [])

  const onApproveCallback = useCallback(() => {
    onTxStart()
    setPendingText(`Approve ${poolInfo?.lpToken.symbol}`)
    approveCallback()
      .then((response: TransactionResponse | undefined) => {
        onTxSubmitted(response?.hash)
      })
      .catch(error => {
        onTxError(error)
      })
  }, [approveCallback, onTxError, onTxStart, onTxSubmitted, poolInfo])

  const onStake = useCallback(
    async (amount: CurrencyAmount, NONCE, DEADLINE, sigVal) => {
      if (!account) throw new Error('none account')
      if (!stakingContract) throw new Error('none contract')
      if (amount.equalTo(JSBI.BigInt('0'))) throw new Error('amount is un support')
      const args = [amount.raw.toString(), NONCE, DEADLINE, sigVal]
      const method = 'deposit'
      return stakingContract.estimateGas[method](...args, { from: account }).then(estimatedGasLimit => {
        return stakingContract[method](...args, {
          gasLimit: calculateGasMargin(estimatedGasLimit),
          // gasLimit: '3500000',
          from: account
        }).then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Stake ${amount.toSignificant()} ${poolInfo?.lpToken.symbol}`
          })
          return response.hash
        })
      })
    },
    [account, addTransaction, poolInfo, stakingContract]
  )

  const onUnstake = useCallback(
    async (amount: CurrencyAmount) => {
      if (!account) throw new Error('none account')
      if (!stakingContract) throw new Error('none contract')
      if (amount.equalTo(JSBI.BigInt('0'))) throw new Error('amount is un support')
      const args = [amount.raw.toString()]
      const method = 'withdraw'
      return stakingContract.estimateGas[method](...args, { from: account }).then(estimatedGasLimit => {
        return stakingContract[method](...args, {
          gasLimit: calculateGasMargin(estimatedGasLimit),
          // gasLimit: '3500000',
          from: account
        }).then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Unstake ${amount.toSignificant()} ${poolInfo?.lpToken.symbol}`
          })
          return response.hash
        })
      })
    },
    [account, addTransaction, poolInfo, stakingContract]
  )

  const onClaim = useCallback(async () => {
    if (!account) throw new Error('none account')
    if (!ltMinterContract) throw new Error('none contract')
    const method = 'mint'
    console.log('mint', poolInfo?.stakingRewardAddress)
    const args = [poolInfo?.stakingRewardAddress]
    return ltMinterContract.estimateGas[method](...args, { from: account }).then(estimatedGasLimit => {
      return ltMinterContract[method](...args, {
        gasLimit: calculateGasMargin(estimatedGasLimit),
        // gasLimit: '3500000',
        from: account
      }).then((response: TransactionResponse) => {
        addTransaction(response, {
          summary: `Claim`
        })
        return response.hash
      })
    })
  }, [account, addTransaction, ltMinterContract, poolInfo])

  const onStakeCallback = useCallback(async () => {
    if (!account || !typedAmount || !library || !chainId || !poolInfo) return
    setPendingText(`Approve ${poolInfo.lpToken.symbol}`)
    onTxStart()
    // sign
    const deadline = toDeadline(PERMIT_EXPIRATION)
    const nonce = ethers.utils.randomBytes(32)
    const permit: Permit = {
      permitted: {
        token: poolInfo.lpToken.address,
        amount: typedAmount.raw.toString()
      },
      nonce: nonce,
      spender: poolInfo.stakingRewardAddress,
      deadline
    }
    const { domain, types, values } = getPermitData(permit, PERMIT2_ADDRESS[chainId ?? 1], chainId)
    library
      .getSigner(account)
      ._signTypedData(domain, types, values)
      .then(signature => {
        setPendingText(`Stake  ${typedAmount.toSignificant()} ${poolInfo.lpToken.symbol}`)
        onStake(typedAmount, nonce, deadline, signature)
          .then(hash => {
            onTxSubmitted(hash)
          })
          .catch((error: any) => {
            onTxError(error)
            throw error
          })
      })
      .catch(error => {
        onTxError(error)
      })
  }, [account, typedAmount, library, chainId, poolInfo, onTxStart, onStake, onTxSubmitted, onTxError])

  const onUnstakeCallback = useCallback(async () => {
    if (!account || !typedAmount || !library || !chainId || !poolInfo) return
    setPendingText(`Unstake ${typedValue} ${poolInfo.lpToken.symbol}`)
    onTxStart()
    // sign
    setPendingText(`Stake  ${typedAmount.toSignificant()} ${poolInfo.lpToken.symbol}`)
    onUnstake(typedAmount)
      .then(hash => {
        onTxSubmitted(hash)
      })
      .catch((error: any) => {
        onTxError(error)
        throw error
      })
  }, [account, typedAmount, library, chainId, poolInfo, typedValue, onTxStart, onUnstake, onTxSubmitted, onTxError])

  const onClaimCallback = useCallback(async () => {
    if (!account || !library || !chainId || !poolInfo) return
    setPendingText(`Claim`)
    onTxStart()
    // sign
    onClaim()
      .then(hash => {
        onTxSubmitted(hash)
      })
      .catch((error: any) => {
        onTxError(error)
        throw error
      })
  }, [account, library, chainId, poolInfo, onTxStart, onClaim, onTxSubmitted, onTxError])

  return (
    <PageWrapper gap="lg" justify="center">
      {poolInfo && (
        <StakingModal
          action={action}
          onStake={action => {
            !account
              ? toggleWalletModal()
              : action === STAKE_ACTION.UNSTAKE
              ? onUnstakeCallback()
              : approvalState === ApprovalState.NOT_APPROVED
              ? onApproveCallback()
              : onStakeCallback()
          }}
          typedValue={typedValue}
          onTyped={setTypedValue}
          isOpen={showStakeModal}
          onDismiss={() => setShowStakeModal(false)}
          stakingInfo={poolInfo}
        />
      )}

      {poolInfo && (
        <ClaimRewardModal
          isOpen={showClaimModal}
          onDismiss={() => setShowClaimModal(false)}
          onClaim={onClaimCallback}
          stakingInfo={poolInfo}
        />
      )}

      <TransactionConfirmationModal
        isOpen={showConfirm}
        onDismiss={() => setShowConfirm(false)}
        attemptingTxn={attemptingTxn}
        hash={txHash}
        content={confirmationContent}
        pendingText={pendingText}
      />

      <TopSection gap="md">
        <DataCard>
          <CardSection>
            <AutoColumn style={{ padding: 30 }} gap="lg">
              <AutoRow gap={'20px'}>
                <TYPE.white fontSize={28} fontWeight={600}>
                  Provide Liquidity, Earn $LT
                </TYPE.white>
                <TYPE.link>Tutorial</TYPE.link>
              </AutoRow>
              <AutoColumn gap={'sm'}>
                <TYPE.main>Total Value Locked(TVL)</TYPE.main>
                <TYPE.white fontSize={28}>$1,934,015,678.26</TYPE.white>
              </AutoColumn>
              <AutoColumn>
                <RowFixed gap={'md'}>
                  <div style={{ width: '440px' }} className="m-r-20">
                    <SearchSelect
                      isLarge={true}
                      getResult={adress => setInputValue(adress)}
                      placeholder={'Search Token Symbol / Address'}
                      list={tokenList}
                    ></SearchSelect>
                  </div>
                </RowFixed>
              </AutoColumn>
            </AutoColumn>
          </CardSection>
          <EarnBGImage />
        </DataCard>
      </TopSection>

      <AutoColumn gap="lg" style={{ width: '100%' }}>
        <PoolSection>
          {loading ? (
            <Loader size={'50px'} style={{ margin: 'auto' }} />
          ) : stakingInfos && stakingInfos?.length === 0 ? (
            <OutlineCard>No active pools</OutlineCard>
          ) : (
            stakingInfos.map((pool, index) => {
              // need to sort by added liquidity here
              return (
                <LTPoolCard
                  onClaim={() => {
                    setPoolInfo(pool)
                    setShowClaimModal(true)
                  }}
                  onUnstake={() => {
                    setShowStakeModal(true)
                    setAction(STAKE_ACTION.UNSTAKE)
                    setPoolInfo(pool)
                  }}
                  onStake={() => {
                    setAction(STAKE_ACTION.STAKE)
                    setPoolInfo(pool)
                    setShowStakeModal(true)
                  }}
                  key={index}
                  pool={pool}
                />
              )
            })
          )}
        </PoolSection>
      </AutoColumn>
    </PageWrapper>
  )
}
