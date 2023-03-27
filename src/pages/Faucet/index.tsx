import Button from 'components/antd/Button'
import Table from 'components/antd/Table'
import { useActiveWeb3React } from 'hooks'
import { useFaucetContract } from 'hooks/useContract'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { calculateGasMargin } from 'utils'
import { TransactionResponse } from '@ethersproject/providers'
import { useTransactionAdder } from 'state/transactions/hooks'
import { CurrencyAmount, Token } from '@uniswap/sdk'
import { useTokenBalances } from 'state/wallet/hooks'
import { getUSDCToken, getUSDTToken, getHOPEToken, getDAIToken } from 'utils/addressHelpers'

import './index.scss'
import { message } from 'antd'
import { useSingleCallResult } from 'state/multicall/hooks'
import Modal from 'components/antd/Modal'
import CurrencyLogo from 'components/CurrencyLogo'
import { useWalletModalToggle } from 'state/application/hooks'

const formatBalance = function(val?: string, decimals?: number) {
  if (!val || !decimals) {
    return ''
  }
  return val.slice(0, -1 * decimals)
}

const useFaucet = () => {
  const contract = useFaucetContract()!
  const addTransaction = useTransactionAdder()
  const requestToken = useCallback(
    (from: string, to: string, amount: string, summary?: string) => {
      const method = 'requestToken'
      const args = [from, to, amount]

      const account = to
      return contract.estimateGas[method](...args, { from: account })
        .then(estimatedGasLimit => {
          return contract[method](...args, {
            gasLimit: calculateGasMargin(estimatedGasLimit),
            from: account
          }).then((response: TransactionResponse) => {
            addTransaction(response, {
              summary: summary || `Faucet amount: ${amount}`
            })
            return true
          })
        })
        .catch((e: any) => {
          if (e.error) {
            message.error(e?.error.message)
          } else {
            message.info(e.message)
          }
          return false
        })
    },
    [addTransaction, contract]
  )

  return requestToken
}

function useAvailableBalance(account?: string) {
  const contract = useFaucetContract()!
  const [token, setToken] = useState<Token>()

  const balanceResult = useSingleCallResult(contract, 'getAvailableBalance', [
    token?.address || undefined,
    account || undefined
  ])

  const balance = balanceResult?.result ? CurrencyAmount.ether(balanceResult?.result?.[0]).raw.toString() : ''

  return { balance, token, setToken }
}

export default function Faucet() {
  const [dataSource, setDataSource] = useState<Token[]>([])
  const { account, chainId } = useActiveWeb3React()
  const USDCToken = useMemo(() => getUSDCToken(chainId), [chainId])
  const USDTToken = useMemo(() => getUSDTToken(chainId), [chainId])
  const HOPEToken = useMemo(() => getHOPEToken(chainId), [chainId])
  const DAIToken = useMemo(() => getDAIToken(chainId), [chainId])
  useEffect(() => {
    if (!chainId) {
      return
    }
    setDataSource([USDCToken, USDTToken, HOPEToken, DAIToken])
  }, [chainId, USDCToken, USDTToken, HOPEToken, DAIToken])

  const requestToken = useFaucet()

  const { balance, token, setToken } = useAvailableBalance(account || undefined)
  const handleClose = useCallback(() => {
    setToken(undefined)
  }, [setToken])
  const handleClick = useCallback(() => {
    if (!token) {
      return
    }

    requestToken(
      token?.address,
      account!,
      balance,
      `Faucet: ${token.symbol} ${formatBalance(balance, token.decimals)}`
    ).finally(() => {
      handleClose()
    })
  }, [token, balance, account, handleClose, requestToken])

  const balances = useTokenBalances(account || undefined, dataSource)
  const toggleWalletModal = useWalletModalToggle()
  const columns = useMemo(() => {
    return [
      {
        title: 'Asset',
        dataIndex: 'symbol',
        key: 'symbol'
      },
      {
        title: 'Wallet balance',
        dataIndex: 'address',
        key: 'address',
        render: (text: string) => {
          return balances[text]?.toExact() || 0
        }
      },
      {
        title: 'Actions',
        dataIndex: 'Actions',
        key: 'name',
        render: (text: string, record: Token) => {
          return (
            <Button
              style={{ height: '30px', padding: '0 10px', borderRadius: '5px' }}
              type="ghost"
              onClick={() => {
                if (!account) {
                  toggleWalletModal()
                  return
                }
                setToken(record)
              }}
            >
              Faucet
            </Button>
          )
        }
      }
    ]
  }, [account, balances, setToken, toggleWalletModal])

  return (
    <div className="faucet-wrap">
      <Modal visible={!!token} getContainer={false} onCancel={handleClose}>
        <div className="faucet-title">Faucet {token?.symbol}</div>
        <div className="faucet-desc">
          <div>Amount</div>
          <div>
            <CurrencyLogo size={'16px'} currency={token} />
            <span className="faucet-balance">
              {formatBalance(balance, token?.decimals) || 0}
              {token?.symbol}
            </span>
          </div>
        </div>
        <div className="faucet-footer">
          <Button onClick={handleClick} type="primary" disabled={balance === '0'}>
            Faucet {token?.symbol}
          </Button>
        </div>
      </Modal>
      <Table columns={columns} dataSource={dataSource} title={() => 'Test Assets'}></Table>
    </div>
  )
}
