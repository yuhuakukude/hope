import { PortfolioReward } from 'api/portfolio.api'
import Table from 'components/Table'
import Tips from 'components/Tips'
import React, { useCallback, useState, useMemo } from 'react'
import Card from '../Card'
import SelectTips, { ITitleTips } from '../SelectTips'
import TitleTips from '../TitleTips'
import { TokenAmount, JSBI, Token } from '@uniswap/sdk'
import { LT, HOPE } from '../../../../constants'
import { useActiveWeb3React } from '../../../../hooks'
import ClaimCon from '../../../../components/ahp/ClaimCon'
import { useStaking, useToClaim } from '../../../../hooks/ahp/useStaking'
import TransactionConfirmationModal, {
  TransactionErrorContent
} from '../../../../components/TransactionConfirmationModal'
// import { useStaking } from '../../../../hooks/ahp/useStaking'
import './index.scss'

const isNotNull = (val: string | number | null) => {
  return val && Number(val) !== 0
}

export default function Rewards({ data }: { data: PortfolioReward[] }) {
  const { account, chainId } = useActiveWeb3React()
  const { claRewards, mintedVal } = useStaking()
  const { toClaim } = useToClaim()
  // const [curAddress, setCurAddress] = useState('')
  const [curToken, setCurToken] = useState<Token | undefined>(HOPE[chainId ?? 1])
  const [claimPendingText, setClaimPendingText] = useState('')
  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm
  // txn values
  const [txHash, setTxHash] = useState<string>('')
  const [errorStatus, setErrorStatus] = useState<{ code: number; message: string } | undefined>()
  const formatAmount = (value: string | number, coin: any) => {
    let res = ''
    if (value && value !== '0') {
      const num = new TokenAmount(coin[chainId ?? 1], JSBI.BigInt(value))
      if (num.toFixed(2)) {
        res = `${num.toFixed(2, { groupSeparator: ',' })}`
      }
    }
    return res
  }

  const columns = [
    {
      title: 'Rewards Gömböc',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: (
        <div>
          APR
          <Tips title="The APR (USD denominated) is calculated using token prices denominated in USD. Prices are fetched either from HopeSwap pools. Also, the APR is a 365 day projection based on each pool's performance over the last 24h. See Hope Ecosystem Disclaimers & Disclosures for more details " />
        </div>
      ),
      dataIndex: 'apr',
      key: 'apr',
      render: (text: string, record: PortfolioReward) => {
        return (
          <div>
            <div>{text}</div>
            <div style={{ color: 'rgba(168, 168, 170, 1)', fontSize: '14px' }}>
              <span>
                <span>{record.boost}</span>
                <span style={{ margin: '0 4px', whiteSpace: 'nowrap' }}>-&gt;</span>
                <span style={{ color: 'rgba(14, 203, 129, 1)' }}>{record.maxBoost}</span>
              </span>
            </div>
          </div>
        )
      }
    },
    {
      title: (
        <div>
          Staked
          <Tips title="Staked refers to the number of LP tokens that have been invested in a Gömböc for liquidity mining. The value of estimated (USD denominated) is calculated using token prices denominated in USD. Prices are fetched either from HopeSwap pools. " />
        </div>
      ),
      dataIndex: 'staked',
      key: 'staked',
      render: (text: string, record: PortfolioReward) => {
        return (
          <div>
            <div>{formatAmount(text, HOPE) ? `${formatAmount(text, HOPE)} ${record.stakeSymbol}` : `--`}</div>
            <div style={{ color: 'rgba(14, 203, 129, 1)' }}>~ ${record.ustOfStaked}</div>
          </div>
        )
      }
    },
    {
      title: 'Stakeable',
      dataIndex: 'stakeable',
      key: 'stakeable',
      render: (text: string, record: PortfolioReward) => {
        return (
          <div>
            <div>{formatAmount(text, HOPE) ? `${formatAmount(text, HOPE)} ${record.stakeSymbol}` : `--`}</div>
            <div style={{ color: 'rgba(14, 203, 129, 1)' }}>~ ${record.usdOfStakeable}</div>
          </div>
        )
      }
    },
    {
      title: 'Reward',
      dataIndex: 'ltTotalReward',
      key: 'ltTotalReward',
      render: (text: string, record: PortfolioReward) => {
        return (
          <div>
            <div>{formatAmount(text, LT) ? `${formatAmount(text, HOPE)} ${record.rewardSymbol}` : `--`}</div>
            <div style={{ color: 'rgba(14, 203, 129, 1)' }}>~ ${record.usdOfReward}</div>
          </div>
        )
      }
    },
    {
      title: 'Actions',
      dataIndex: 'Actions',
      key: 'Actions',
      render: (text: string, record: PortfolioReward) => {
        const options: ITitleTips[] = []
        if (isNotNull(record.stakeable)) {
          options.push({
            label: 'Stake',
            value: 'Stake',
            onClick: item => {
              console.log(item)
            }
          })
        }
        if (isNotNull(record.staked)) {
          options.push({
            label: 'Unstake',
            value: 'Unstake',
            onClick: item => {
              console.log(item)
            }
          })
        }
        if (isNotNull(record.ltTotalReward)) {
          options.push({
            label: 'Claim',
            value: 'Claim',
            onClick: item => {
              console.log(item)
            }
          })
        }

        if (record.name !== 'HOPE Staking') {
          if (isNotNull(record.stakeable)) {
            options.push({
              label: 'Withdraw',
              value: 'Withdraw',
              onClick: item => {
                console.log(item)
              }
            })
          }
          options.push({
            label: 'Provide',
            value: 'Provide',
            onClick: item => {
              console.log(item)
            }
          })
          options.push({
            label: 'Boost',
            value: 'Boost',
            onClick: item => {
              console.log(item)
            }
          })
        }

        if (!options.length) {
          return ''
        }

        return <SelectTips options={options} />
      }
    }
  ]

  const totalRewards = useMemo(() => {
    let res
    if (claRewards && mintedVal) {
      res = claRewards.add(mintedVal)
    }
    return res
  }, [claRewards, mintedVal])

  const onTxStart = useCallback(() => {
    setShowConfirm(true)
    setAttemptingTxn(true)
  }, [])

  const onTxSubmitted = useCallback((hash: string | undefined) => {
    setShowConfirm(true)
    setAttemptingTxn(false)
    hash && setTxHash(hash)
  }, [])

  const onTxError = useCallback(error => {
    setShowConfirm(true)
    setTxHash('')
    setAttemptingTxn(false)
    setErrorStatus({ code: error?.code, message: error.message })
  }, [])

  const claimCallback = useCallback(async () => {
    if (!account) return
    setCurToken(LT[chainId ?? 1])
    onTxStart()
    setClaimPendingText(`claim LT`)
    toClaim('')
      .then(hash => {
        setClaimPendingText('')
        onTxSubmitted(hash)
      })
      .catch((error: any) => {
        setClaimPendingText('')
        onTxError(error)
      })
  }, [account, chainId, onTxError, onTxStart, onTxSubmitted, toClaim])

  const confirmationContent = useCallback(
    () =>
      errorStatus ? (
        <TransactionErrorContent
          errorCode={errorStatus.code}
          onDismiss={() => setShowConfirm(false)}
          message={errorStatus.message}
        />
      ) : (
        <ClaimCon
          onSubmit={claimCallback}
          onDismiss={() => setShowConfirm(false)}
          totalRewards={totalRewards}
          claRewards={claRewards}
        />
      ),
    [claRewards, claimCallback, errorStatus, totalRewards]
  )

  const getTitle = useCallback(
    () => (
      <TitleTips
        title="Gömböc Rewards"
        desc="Stake the HOPE 、Liquidity Position in Gomboc and receive LT rewards. You can also use veLT to increase LT
  yield to a maximum of 2.5x."
        link=""
      />
    ),
    []
  )

  return (
    <>
      <TransactionConfirmationModal
        isOpen={showConfirm}
        onDismiss={() => setShowConfirm(false)}
        attemptingTxn={attemptingTxn}
        hash={txHash}
        content={confirmationContent}
        pendingText={claimPendingText}
        currencyToAdd={curToken}
      />
      <div className="rewards-wrap">
        <Card>
          <Table dataSource={data} columns={columns} title={getTitle} pagination={false} />
        </Card>
      </div>
    </>
  )
}
