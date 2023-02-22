import React, { useCallback, useState, useRef, RefObject, useEffect } from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { TYPE } from '../../theme'
import { AutoRow, RowFixed } from '../../components/Row'
import { CardSection, DataCard, EarnBGImage } from '../../components/earn/styled'
import Loader from '../../components/Loader'
import { OutlineCard } from '../../components/Card'
import format from 'utils/format'
import { useLPStakingInfos, useLPTotalLocked } from '../../hooks/useLPStaking'
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
import { Switch, Select } from 'antd'
import { SearchInput } from '../../components/SearchModal/styleds'
import { ButtonPrimary } from '../../components/Button'

const PageWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 0 30px;
  max-width: 1440px;
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

type Sort = 'asc' | 'desc'

export default function Earn() {
  const { Option } = Select
  const inputRef = useRef<HTMLInputElement>()
  const toggleWalletModal = useWalletModalToggle()
  const { chainId, account, library } = useActiveWeb3React()
  const [curType, setCurType] = useState(1)
  const [userCurrency, setUserCurrency] = useState('')
  const [searchList, setSearchList] = useState<PoolInfo[]>([])
  const [showStakeModal, setShowStakeModal] = useState(false)
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [isMyVote, setIsMyVote] = useState(false)
  const addTransaction = useTransactionAdder()

  // const [currentPage, setCurrentPage] = useState<number>(1)
  // const [pageSize, setPageSize] = useState<number>(5)

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
  const { result: stakingInfos, loading } = useLPStakingInfos(sort, isMyVote)
  const { totalAmount } = useLPTotalLocked()
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
          summary: `Claim`,
          actionTag: {
            recipient: `claim-${account}-${poolInfo?.id}`
          }
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
        setShowClaimModal(false)
      })
      .catch((error: any) => {
        onTxError(error)
        setShowClaimModal(false)
        throw error
      })
  }, [account, library, chainId, poolInfo, onTxStart, onClaim, onTxSubmitted, onTxError])

  const changeSwitch = (val: boolean) => {
    setIsMyVote(val)
  }

  const handleInput = (event: any) => {
    const input = event.target.value
    setInputValue(input)
  }

  useEffect(() => {
    setSearchList(stakingInfos)
    // setPageTotal(list.length || 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stakingInfos])

  const toSearch = () => {
    // setPageSize(5)
    // setCurrentPage(1)
    const totalList = stakingInfos.filter((e: PoolInfo) => e.searchString?.includes(inputValue))
    // setPageTotal(totalList.length || 0)
    // setPairs(totalList)
    setSearchList(totalList)
  }

  const currencyChange = (val: string) => {
    console.log(val)
    const value = val || ''
    setUserCurrency(value)
    const resList = stakingInfos.filter((e: PoolInfo) => e.searchString?.includes(value))
    setSearchList(resList)
  }

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
                  Provide Liquidity, Earn $LT{`${isMyVote}`}
                </TYPE.white>
                <a
                  href="https://docs.hope.money/hope-1/lRGc3srjpd2008mDaMdR/tokens/light-token-usdlt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link m-l-0 text-primary flex ai-center"
                >
                  Tutorial <i className="iconfont m-l-5">&#xe619;</i>{' '}
                </a>
              </AutoRow>
              <AutoColumn gap={'sm'}>
                <TYPE.main>Total Value Locked(TVL)</TYPE.main>
                <TYPE.white fontSize={28}>$ {format.amountFormat(totalAmount, 2)}</TYPE.white>
              </AutoColumn>
              <AutoColumn>
                <RowFixed gap={'md'}>
                  <div style={{ width: '440px' }} className="m-r-20">
                    <div className="flex">
                      <div style={{ position: 'relative', width: '440px' }} className="flex m-r-20">
                        <SearchInput
                          fontSize={'16px'}
                          padding={'10px 16px 10px 45px'}
                          type="text"
                          id="token-search-input"
                          placeholder={'Search Token Symbol / Address'}
                          autoComplete="off"
                          ref={inputRef as RefObject<HTMLInputElement>}
                          value={inputValue}
                          onChange={handleInput}
                        />
                        <i className="iconfont search-input-icon">&#xe61b;</i>
                      </div>
                      <ButtonPrimary padding={'12px 24px'} style={{ width: 'max-content' }} onClick={toSearch}>
                        Search
                      </ButtonPrimary>
                    </div>
                  </div>
                </RowFixed>
              </AutoColumn>
            </AutoColumn>
          </CardSection>
          <EarnBGImage />
        </DataCard>
      </TopSection>

      <div className="action flex jc-between ai-center" style={{ width: '100%' }}>
        <div>
          <span className="text-white text-medium font-nor">My Staked Only</span>
          <Switch className="m-l-10 is-grey" onChange={changeSwitch} />
        </div>
        <div>
          <Select
            // mode="multiple"
            style={{ width: '210px', height: '42px' }}
            value={userCurrency}
            allowClear
            onChange={currencyChange}
            placeholder="Available Balance"
            className={userCurrency ? 'small-select hide-placeholder' : 'small-select show-placeholder'}
          >
            {['WETH', 'USDC', 'LT', 'USDT', 'HOPE'].map((data: any, index: number) => {
              return (
                <Option key={index} value={data}>
                  {data}
                </Option>
              )
            })}
          </Select>
        </div>
      </div>

      <AutoColumn gap="lg" style={{ width: '100%' }}>
        <PoolSection>
          {loading ? (
            <Loader size={'50px'} style={{ margin: 'auto' }} />
          ) : searchList && searchList?.length === 0 ? (
            <OutlineCard>No active pools</OutlineCard>
          ) : (
            searchList.map((pool, index) => {
              // need to sort by added liquidity here
              return (
                <LTPoolCard
                  onClaim={() => {
                    setPoolInfo(pool)
                    setShowClaimModal(true)
                  }}
                  onUnstake={() => {
                    setTypedValue('')
                    setShowStakeModal(true)
                    setAction(STAKE_ACTION.UNSTAKE)
                    setPoolInfo(pool)
                  }}
                  onStake={() => {
                    setTypedValue('')
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
