import { PortfolioReward } from 'api/portfolio.api'
import Table from 'components/antd/Table'
import Tips from 'components/Tips'
import React, { useCallback, useState, useMemo, useEffect } from 'react'
import Card from '../Card'
import SelectTips, { TitleTipsProps } from '../SelectTips'
import TitleTips from '../TitleTips'
// import { TokenAmount, JSBI, Token } from '@uniswap/sdk'
import { Token } from '@uniswap/sdk'
import { LT, HOPE, STAKING_HOPE_GOMBOC_ADDRESS } from '../../../../constants'
import { useActiveWeb3React } from '../../../../hooks'
import GombocClaim from '../../../../components/ahp/GombocClaim'
import { useToClaim, useClaimRewards } from '../../../../hooks/ahp/usePortfolio'
import format from '../../../../utils/format'
import TransactionConfirmationModal, {
  TransactionErrorContent
} from '../../../../components/TransactionConfirmationModal'
import './index.scss'
import { useStaking } from '../../../../hooks/ahp/useStaking'
import { useHistory } from 'react-router-dom'

import { Contract } from '@ethersproject/contracts'
import { usePairContract } from '../../../../hooks/useContract'

const isNotNull = (val: string | number | null) => {
  return val && Number(val) !== 0
}

export default function Rewards({ data }: { data: PortfolioReward[] }) {
  const { account, chainId } = useActiveWeb3React()
  const history = useHistory()
  const { toClaim } = useToClaim()
  const { stakedVal } = useStaking()
  const [curTableItem, setCurTableItem]: any = useState({})
  const [curToken, setCurToken] = useState<Token | undefined>(HOPE[chainId ?? 1])
  const [claimPendingText, setPendingText] = useState('')
  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm
  // txn values
  const [txHash, setTxHash] = useState<string>('')
  const [errorStatus, setErrorStatus] = useState<{ code: number; message: string } | undefined>()

  // pair contract
  const [curLpAddress, setCurLpAddress] = useState<string>('')
  const [baseLink, setBaseLink] = useState<string>('')
  const pairContract: Contract | null = usePairContract(curLpAddress)

  const curAddress = useMemo(() => {
    let res = ''
    if (curTableItem && curTableItem?.gomboc) {
      res = curTableItem?.gomboc
    }
    return res
  }, [curTableItem])

  const { toClaimRewards } = useClaimRewards(curAddress)

  function ClaimFn(item: any) {
    setCurTableItem(item)
    setTxHash('')
    setErrorStatus(undefined)
    setAttemptingTxn(false)
    setShowConfirm(true)
  }

  const getToken = useCallback(async () => {
    try {
      const token0 = await pairContract?.token0()
      const token1 = await pairContract?.token1()
      if (token0 && token1 && baseLink) {
        history.push(`${baseLink}/${token0}/${token1}`)
        setBaseLink('')
        setCurLpAddress('')
      }
    } catch (error) {
      console.log(error)
    }
  }, [pairContract, baseLink, history])

  async function toLiq(record: any, baseLink: string) {
    setCurLpAddress(record.lpToken)
    setBaseLink(baseLink)
  }

  useEffect(() => {
    if (curLpAddress && pairContract && baseLink) {
      getToken()
    }
  }, [curLpAddress, pairContract, getToken, baseLink])

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
            <div>{format.rate(text)}</div>
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
            <div>{format.amountFormat(text, 2) ? `${format.amountFormat(text, 2)} ${record.stakeSymbol}` : `--`}</div>
            <div style={{ color: 'rgba(14, 203, 129, 1)' }}>≈ ${format.amountFormat(record.usdOfStaked, 2)}</div>
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
            <div>{format.amountFormat(text, 2) ? `${format.amountFormat(text, 2)} ${record.stakeSymbol}` : `--`}</div>
            <div style={{ color: 'rgba(14, 203, 129, 1)' }}>≈ ${format.amountFormat(record.usdOfStakeable, 2)}</div>
          </div>
        )
      }
    },
    {
      title: 'Claimable Reward',
      dataIndex: 'ltTotalReward',
      key: 'ltTotalReward',
      render: (text: string, record: PortfolioReward) => {
        return (
          <div>
            <div>{format.amountFormat(text, 2) ? `${format.amountFormat(text, 2)} LT` : `--`}</div>
            <div style={{ color: 'rgba(14, 203, 129, 1)' }}>≈ ${format.amountFormat(record.usdOfTotalReward, 2)}</div>
          </div>
        )
      }
    },
    {
      title: 'Actions',
      dataIndex: 'Actions',
      key: 'Actions',
      render: (text: string, record: PortfolioReward) => {
        const options: TitleTipsProps[] = []
        const hsg = STAKING_HOPE_GOMBOC_ADDRESS[chainId ?? 1].toLowerCase()
        if (isNotNull(record.stakeable)) {
          options.push({
            label: 'Stake',
            value: 'Stake',
            onClick: () => {
              if (record.gomboc === hsg) {
                history.push(`/staking`)
              } else {
                history.push(`/swap/stake/${record.gomboc}`)
              }
            }
          })
        }
        if (record.gomboc === hsg) {
          if (stakedVal && Number(stakedVal?.toFixed(2)) > 0) {
            options.push({
              label: 'Unstake',
              value: 'Unstake',
              onClick: () => {
                history.push(`/staking?type=unstake`)
              }
            })
          }
        } else {
          if (isNotNull(record.staked)) {
            options.push({
              label: 'Unstake',
              value: 'Unstake',
              onClick: () => {
                history.push(`/swap/withdraw/${record.gomboc}`)
              }
            })
          }
        }

        if (isNotNull(record.ltTotalReward)) {
          options.push({
            label: 'Claim',
            value: 'Claim',
            onClick: () => {
              ClaimFn(record)
            }
          })
        }
        if (!(record.gomboc === hsg)) {
          if (isNotNull(record.stakeable)) {
            options.push({
              label: 'Provide',
              value: 'Provide',
              onClick: () => {
                toLiq(record, '/swap/add')
              }
            })
            options.push({
              label: 'Withdraw',
              value: 'Withdraw',
              onClick: () => {
                toLiq(record, '/remove')
              }
            })
          }
          options.push({
            label: 'Boost',
            value: 'Boost',
            onClick: () => {
              history.push(`/dao/gomboc?gomboc=${record.gomboc}`)
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
    setPendingText(`claim Rewards`)
    toClaim(STAKING_HOPE_GOMBOC_ADDRESS[chainId ?? 1])
      .then(hash => {
        setPendingText('')
        onTxSubmitted(hash)
      })
      .catch((error: any) => {
        setPendingText('')
        onTxError(error)
      })
  }, [account, chainId, onTxError, onTxStart, onTxSubmitted, toClaim])

  const claimRewardsCallback = useCallback(async () => {
    if (!account) return
    setCurToken(LT[chainId ?? 1])
    onTxStart()
    setPendingText(`claim Rewards`)
    toClaimRewards()
      .then(hash => {
        setPendingText('')
        onTxSubmitted(hash)
      })
      .catch((error: any) => {
        setPendingText('')
        onTxError(error)
      })
  }, [account, chainId, onTxError, onTxStart, onTxSubmitted, toClaimRewards])

  const claimSubmit = useCallback(
    (type: string) => {
      if (type === 'normal') {
        claimCallback()
      } else {
        claimRewardsCallback()
      }
    },
    [claimCallback, claimRewardsCallback]
  )

  const confirmationContent = useCallback(
    () =>
      errorStatus ? (
        <TransactionErrorContent
          errorCode={errorStatus.code}
          onDismiss={() => setShowConfirm(false)}
          message={errorStatus.message}
        />
      ) : (
        <GombocClaim
          onSubmit={(type: string) => {
            claimSubmit(type)
          }}
          onDismiss={() => setShowConfirm(false)}
          tableItem={curTableItem}
        />
      ),
    [claimSubmit, errorStatus, curTableItem]
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
          <Table
            locale={{ emptyText: 'You have no liquidity on Mainnet' }}
            dataSource={data}
            columns={columns}
            title={getTitle}
            pagination={false}
          />
        </Card>
      </div>
    </>
  )
}
