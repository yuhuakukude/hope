import Table from 'components/antd/Table'
import { useActiveWeb3React } from 'hooks'
import { toUsdPrice } from 'hooks/ahp/usePortfolio'
import { useStaking } from 'hooks/ahp/useStaking'
import usePrice from 'hooks/usePrice'
import React, { useCallback, useMemo, useState } from 'react'
import { useTokenBalance } from 'state/wallet/hooks'
import Card from '../Card'
import Item from '../Item'
import SelectTips, { TitleTipsProps } from '../SelectTips'
import { usePoolGomContract } from 'hooks/useContract'
import { useSingleCallResult } from 'state/multicall/hooks'
import { CurrencyAmount, TokenAmount } from '@uniswap/sdk'
import TransactionConfirmationModal, {
  TransactionErrorContent
} from '../../../../components/TransactionConfirmationModal'
import { useHistory } from 'react-router-dom'
import { Token } from '@uniswap/sdk'
import GombocClaim from '../../../../components/ahp/GombocClaim'
import { useToClaim, useClaimRewards } from '../../../../hooks/ahp/usePortfolio'
import { STAKING_HOPE_GOMBOC_ADDRESS, LT, HOPE, ST_HOPE } from '../../../../constants'

interface IStaking {
  stHOPE: string
  unstaking: string
  claRewards: string
  unstaked: string
  usdOfStHOPE: string
  boost: string
  usdOfUnstaking: string
  usdOfClaRewards: string
  usdOfUnstaked: string
}

function getUsdPrice(hopePrice: string, price?: TokenAmount | CurrencyAmount) {
  if (!price) {
    return '--'
  }

  return '≈$' + toUsdPrice(price.toFixed(2), hopePrice)
}

function formatPrice(name: string, price?: TokenAmount | CurrencyAmount) {
  if (!price) {
    return '--'
  }
  return `${price?.toFixed(2, { groupSeparator: ',' })} ${name}`
}
export default function MyHOPEStaking() {
  const { unstakedVal, claRewards, unstakingVal } = useStaking()
  const { account, chainId } = useActiveWeb3React()
  const hopePrice = usePrice()
  const stBalance = useTokenBalance(account ?? undefined, ST_HOPE[chainId ?? 1])
  const poolGomContract = usePoolGomContract(STAKING_HOPE_GOMBOC_ADDRESS[chainId ?? 1])
  const _bu = useSingleCallResult(poolGomContract, 'workingBalances', [account ?? undefined])
  const _i = useSingleCallResult(poolGomContract, 'lpBalanceOf', [account ?? undefined])
  const bu = _bu?.result ? CurrencyAmount.ether(_bu?.result?.[0]) : undefined
  const i = _i?.result ? CurrencyAmount.ether(_i?.result?.[0]) : undefined
  let boost = '-'
  if (bu && i) {
    boost = (Number(bu?.toExact()) / (Number(i?.toExact()) * 0.4)).toFixed(2)
  }

  const data: IStaking = {
    boost,
    stHOPE: formatPrice('stHOPE', stBalance),
    usdOfStHOPE: getUsdPrice(hopePrice, stBalance),
    unstaking: formatPrice('stHOPE', unstakingVal),
    usdOfUnstaking: getUsdPrice(hopePrice, unstakingVal),
    claRewards: formatPrice('LT', claRewards),
    usdOfClaRewards: getUsdPrice(hopePrice, claRewards),
    unstaked: formatPrice('HOPE', unstakedVal),
    usdOfUnstaked: getUsdPrice(hopePrice, unstakedVal)
  }

  const history = useHistory()
  const [curTableItem, setCurTableItem]: any = useState({})
  const [txHash, setTxHash] = useState<string>('')
  const [errorStatus, setErrorStatus] = useState<{ code: number; message: string } | undefined>()
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [curToken, setCurToken] = useState<Token | undefined>(HOPE[chainId ?? 1])

  function ClaimFn(item: any) {
    setCurTableItem(item)
    setTxHash('')
    setErrorStatus(undefined)
    setAttemptingTxn(false)
    setShowConfirm(true)
  }

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

  const [claimPendingText, setPendingText] = useState('')
  const { toClaim } = useToClaim()

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

  const curAddress = useMemo(() => {
    let res = ''
    if (curTableItem && curTableItem?.gomboc) {
      res = curTableItem?.gomboc
    }
    return res
  }, [curTableItem])
  const { toClaimRewards } = useClaimRewards(curAddress)
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

  const columns = [
    {
      title: 'Protocol',
      dataIndex: 'Protocol',
      key: 'Protocol',
      render: () => 'HOPE Staking'
    },
    {
      title: 'My Boost',
      dataIndex: 'boost',
      key: 'boost'
    },
    {
      title: 'Balance',
      dataIndex: 'stHOPE',
      key: 'stHOPE',
      render: (text: string, record: IStaking) => {
        return <Item title={record.stHOPE} desc={record.usdOfStHOPE} />
      }
    },
    {
      title: 'Unstaking',
      dataIndex: 'unstaking',
      key: 'unstaking',
      render: (text: string, record: IStaking) => {
        return <Item title={record.unstaking} desc={record.usdOfUnstaking} />
      }
    },
    {
      title: 'Unstaked',
      dataIndex: 'unstaked',
      key: 'unstaked',
      render: (text: string, record: IStaking) => {
        return <Item title={record.unstaked} desc={record.usdOfUnstaked} />
      }
    },
    {
      title: 'Claimable Rewards',
      dataIndex: 'claRewards',
      key: 'claRewards',
      render: (text: string, record: IStaking) => {
        return <Item title={record.claRewards} desc={record.usdOfClaRewards} />
      }
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
      render: (text: string, record: IStaking) => {
        const options: TitleTipsProps[] = [
          {
            label: 'Stake',
            value: 'Stake',
            onClick: () => {
              history.push(`/staking`)
            }
          },
          {
            label: 'Unstake',
            value: 'Unstake',
            onClick: () => {
              history.push(`/staking`)
            }
          },
          {
            label: 'Claim Rewards',
            value: 'Claim Rewards',
            onClick: () => {
              ClaimFn(record)
            }
          },
          {
            label: 'Yield Boost',
            value: 'Yield Boost',
            onClick: () => {
              history.push(`/dao/gomboc?gomboc=${curAddress}`) // TODO Sure
            }
          }
        ]
        return <SelectTips options={options} />
      }
    }
  ]

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
      <Card title="My HOPE Staking">
        <Table columns={columns} dataSource={[data]} pagination={false}></Table>
      </Card>
    </>
  )
}
