import styled from 'styled-components'
import { AutoColumn } from '../../components/Column'
import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { ButtonPrimary } from '../../components/Button'
import ActionButton from '../../components/Button/ActionButton'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { useWalletModalToggle } from '../../state/application/hooks'
import SelectCurrency from './component/SelectCurrency/index'
import { Decimal } from 'decimal.js'
import format from '../../utils/format'
import JSBI from 'jsbi'
import { calculateGasMargin } from '../../utils'
import { Input as NumericalInput } from '../../components/NumericalInput'
import TransactionConfirmationModal, { TransactionErrorContent } from '../../components/TransactionConfirmationModal'

import './index.scss'
import { ethers } from 'ethers'
import { TransactionResponse } from '@ethersproject/providers'
import { useActiveWeb3React } from '../../hooks'
import { useTokenBalance } from '../../state/wallet/hooks'
import { useBuyHopeContract } from '../../hooks/useContract'
import { useSingleCallResult } from '../../state/multicall/hooks'
import { tryParseAmount } from '../../state/swap/hooks'
import { PERMIT2_ADDRESS, USDT, USDC, HOPE, TOKEN_SALE_ADDRESS } from '../../constants'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { CurrencyAmount, Token, TokenAmount } from '@uniswap/sdk'
import { getPermitData, Permit, PERMIT_EXPIRATION, toDeadline } from '../../permit2/domain'

const PageWrapper = styled(AutoColumn)`
  max-width: 1280px;
  width: 100%;
`

export default function BuyHope() {
  const toggleWalletModal = useWalletModalToggle()
  const { account, chainId, library } = useActiveWeb3React()
  const buyHopeContract = useBuyHopeContract()
  const addTransaction = useTransactionAdder()
  // state
  const [currency, setCurrency] = useState<string>('USDT')
  const [currencyModalFlag, setCurrencyModalFlag] = useState(false)
  const [inputBorder, setInputBorder] = useState('')
  const [rateVal, setRateVal] = useState('')
  const [coinList, setCoinList] = useState('')
  const [pay, setPay] = useState('')
  const [receive, setReceive] = useState('')
  const [txHash, setTxHash] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string | undefined>()

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm

  // get balance / rate
  const rateObj = useSingleCallResult(buyHopeContract, 'currencys', [currency])
  const usdtBalance = useTokenBalance(account ?? undefined, USDT)
  const usdcBalance = useTokenBalance(account ?? undefined, USDC)
  const inputAmount = tryParseAmount(pay, currency === 'USDT' ? USDT : USDC) as TokenAmount | undefined

  // token api
  const [approvalState, approveCallback] = useApproveCallback(inputAmount, PERMIT2_ADDRESS[chainId ?? 1])
  const [curToken, setCurToken] = useState<Token | undefined>(HOPE[chainId ?? 1])

  const onUserPayInput = (value: string) => {
    if (value && value.slice(0, 1) === '.') {
      value = `0${value}`
    }
    if (!value || Number(value) === 0 || rateVal === '') {
      setReceive('')
    } else {
      const resVal = new Decimal(value).mul(new Decimal(rateVal)).toNumber()
      setReceive(`${format.numeral(resVal, 2)}`)
    }
    setPay(value)
  }

  const onUserReceiveInput = (value: string) => {
    console.warn('====')
    if (value && value.slice(0, 1) === '.') {
      value = `0${value}`
    }
    if (!value || Number(value) === 0 || rateVal === '') {
      setPay('')
      setReceive('')
    } else {
      const resVal = new Decimal(value).div(new Decimal(rateVal)).toNumber()
      setPay(`${format.numeral(resVal, 2)}`)
      if (`${resVal}`.split('.')[1]?.length > 2) {
        const receiveInitVal = new Decimal(`${format.numeral(resVal, 2)}`).mul(new Decimal(rateVal)).toNumber()
        setReceive(`${format.numeral(receiveInitVal, 2)}`)
      } else {
        setReceive(value)
      }
    }
  }

  const initAmount = () => {
    setPay('')
    setReceive('')
  }

  const toBuyHope = useCallback(
    async (amount: CurrencyAmount, NONCE, DEADLINE, sigVal) => {
      if (!account) throw new Error('none account')
      if (!buyHopeContract) throw new Error('none contract')
      if (amount.equalTo(JSBI.BigInt('0'))) throw new Error('amount is un support')
      const args = [currency, amount.raw.toString(), NONCE, DEADLINE, sigVal]
      const method = 'buy'
      return buyHopeContract.estimateGas[method](...args, { from: account }).then(estimatedGasLimit => {
        return buyHopeContract[method](...args, {
          gasLimit: calculateGasMargin(estimatedGasLimit),
          // gasLimit: '3500000',
          from: account
        }).then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Buy ${amount
              .multiply(JSBI.BigInt('5'))
              .toSignificant(4, { groupSeparator: ',' })
              .toString()}  RAM with ${amount.toSignificant()} USDT`
          })
          return response.hash
        })
      })
    },
    [account, addTransaction, buyHopeContract, currency]
  )

  const buyHopeCallback = useCallback(async () => {
    if (!account || !inputAmount || !library || !chainId) return
    setCurToken(HOPE[chainId ?? 1])
    setShowConfirm(true)
    setAttemptingTxn(true)

    // sign
    const deadline = toDeadline(PERMIT_EXPIRATION)
    const nonce = ethers.utils.randomBytes(32)
    const permit: Permit = {
      permitted: {
        token: currency === 'USDT' ? USDT.address : USDC.address,
        amount: inputAmount.raw.toString()
      },
      nonce: nonce,
      spender: TOKEN_SALE_ADDRESS[chainId ?? 1] || '',
      deadline
    }
    const { domain, types, values } = getPermitData(permit, PERMIT2_ADDRESS[chainId ?? 1], chainId)
    const signature = await library.getSigner(account)._signTypedData(domain, types, values)
    toBuyHope(inputAmount, nonce, deadline, signature)
      .then(hash => {
        setAttemptingTxn(false)
        setTxHash(hash)
        initAmount()
      })
      .catch((err: any) => {
        setErrorMessage(err.message)
      })
  }, [account, inputAmount, library, chainId, currency, toBuyHope])

  const isMaxDisabled = useMemo(() => {
    let flag = false
    const max = currency === 'USDT' ? usdtBalance?.toFixed(2) : usdcBalance?.toFixed(2)
    if (pay && max) {
      flag = pay > (max || 0)
    }
    return flag
  }, [pay, usdtBalance, usdcBalance, currency])

  const balanceAmount = useMemo(() => {
    return currency === 'USDT'
      ? usdtBalance?.toFixed(2, { groupSeparator: ',' } ?? '0.00') || '--'
      : usdcBalance?.toFixed(2, { groupSeparator: ',' } ?? '0.00') || '--'
  }, [usdtBalance, usdcBalance, currency])

  const actionText = useMemo(() => {
    if (!inputAmount) {
      return `Approve ${currency}`
    } else if (isMaxDisabled) {
      return `Insufficient ${currency} balance`
    } else {
      return approvalState === ApprovalState.NOT_APPROVED ? 'Confirm in your wallet' : 'Approve'
    }
  }, [inputAmount, isMaxDisabled, approvalState, currency])

  const showSelectCurrency = () => {
    const arr: any = [
      {
        coin: 'USDT',
        dec: USDT.decimals,
        amount: usdtBalance?.toFixed(2, { groupSeparator: ',' } ?? '--'),
        icon: 'usdt-icon'
      },
      {
        coin: 'USDC',
        dec: USDC.decimals,
        amount: usdcBalance?.toFixed(2, { groupSeparator: ',' } ?? '--'),
        icon: 'usdc-icon'
      }
    ]
    setCoinList(arr)
    setCurrencyModalFlag(true)
  }
  const onCloseModel = (currency: any) => {
    setCurrency(currency)
    setPay('')
    setReceive('')
    setCurrencyModalFlag(false)
  }

  const maxInputFn = () => {
    const balance = currency === 'USDT' ? usdtBalance?.toFixed(2) : usdcBalance?.toFixed(2)
    let resAmount = balance?.toString().replace(/(?:\.0*|(\.\d+?)0+)$/, '$1') || '0'
    const [intV, decV] = resAmount.split('.')
    const decValLen = decV?.length || 0
    if (decValLen > 2) {
      resAmount = `${intV}.${decV.slice(0, 2)}`
    }
    setPay(resAmount)
    onUserPayInput(resAmount)
  }

  const inputOnFocus = (type: string) => {
    setInputBorder(type)
  }

  const confirmationContent = useCallback(() => {
    return errorMessage && <TransactionErrorContent onDismiss={() => setShowConfirm(false)} message={errorMessage} />
  }, [errorMessage])

  useEffect(() => {
    const uDec = currency === 'USDT' ? USDT.decimals : USDC.decimals
    if (rateObj?.result) {
      const rate = Number(rateObj.result.rate.toString()) || 0
      setRateVal(`${rate / Math.pow(10, HOPE[chainId ?? 1].decimals - uDec) / 1000}`)
    } else {
      setRateVal('')
    }
  }, [currency, rateObj, chainId])
  return (
    <>
      <PageWrapper>
        <TransactionConfirmationModal
          isOpen={showConfirm}
          onDismiss={() => setShowConfirm(false)}
          attemptingTxn={attemptingTxn}
          hash={txHash}
          content={confirmationContent}
          pendingText={''}
          currencyToAdd={curToken}
        />
        <div className="buy-hope-page">
          <div className="title text-medium font-18">Buy HOPE to your wallet</div>
          <div className="box m-t-40">
            <div className="flex jc-between">
              <div className="input-title text-medium font-18 text-normal">You Pay</div>
              {account && (
                <div className="balance text-normal font-nor">
                  Available: {balanceAmount}
                  {balanceAmount !== '-' && account && (
                    <span className="text-primary m-l-8 cursor-select" onClick={maxInputFn}>
                      Max
                    </span>
                  )}
                </div>
              )}
            </div>
            <div
              className={[
                'input-box',
                'm-t-12',
                'p-x-32',
                'flex',
                'ai-center',
                isMaxDisabled && 'error',
                inputBorder === 'pay' && 'fouce'
              ].join(' ')}
            >
              <div className="coin-box flex ai-center cursor-select" onClick={showSelectCurrency}>
                <div className={`${currency === 'USDT' ? 'usdt-icon' : 'usdc-icon'}`}></div>
                <div className="currency font-nor text-medium m-l-12">{currency}</div>
                <div className="drop m-l-30">
                  <i className="iconfont text-normal">&#xe60d;</i>
                </div>
              </div>
              <NumericalInput
                onFocus={() => inputOnFocus('pay')}
                onBlur={() => setInputBorder('')}
                className="input m-l-10"
                decimals={2}
                value={pay}
                align={'right'}
                onUserInput={(val: any) => {
                  onUserPayInput(val)
                }}
              />
            </div>
          </div>
          <div className="i-box flex jc-center m-t-50 m-b-30">
            <i className="iconfont font-28 text-normal user-select">&#xe617;</i>
          </div>
          <div className="box">
            <div className="input-title text-medium font-18 text-normal">You Receive</div>
            <div
              className={[
                'input-box',
                'm-t-12',
                'p-x-32',
                'flex',
                'ai-center',
                inputBorder === 'receive' && 'fouce'
              ].join(' ')}
            >
              <div className="coin-box flex ai-center cursor-select">
                <div className="hope-icon"></div>
                <div className="currency font-nor text-medium m-l-12">HOPE</div>
              </div>
              <NumericalInput
                onFocus={() => inputOnFocus('receive')}
                onBlur={() => setInputBorder('')}
                className="input m-l-10"
                decimals={2}
                value={receive}
                align={'right'}
                onUserInput={(val: any) => {
                  onUserReceiveInput(val)
                }}
              />
            </div>
          </div>
          <div className="btn-box m-t-30">
            <p className="font-nor text-normal text-center">
              1.00 {currency} = {rateVal ? `${rateVal}.00` : '-'} HOPE
            </p>
            <div className="action-box m-t-30">
              {!account ? (
                <ButtonPrimary className="hp-button-primary text-medium font-nor" onClick={toggleWalletModal}>
                  Connect Wallet
                </ButtonPrimary>
              ) : (
                <ActionButton
                  pending={approvalState === ApprovalState.PENDING}
                  disableAction={isMaxDisabled || !inputAmount}
                  actionText={actionText}
                  onAction={approvalState === ApprovalState.NOT_APPROVED ? approveCallback : buyHopeCallback}
                />
                // <ButtonPrimary className="hp-button-primary">approve</ButtonPrimary>
              )}
            </div>
          </div>
          {account && (
            <div className="gas flex jc-between p-y-30 m-t-30">
              <div className="label font-nor text-normal">Gas Fee</div>
              <div className="value font-nor text-medium">≈0.001 ETH</div>
            </div>
          )}
          {account && (
            <div className="tip flex p-t-30">
              <div className="icon m-r-15">
                <i className="iconfont font-28">&#xe614;</i>
              </div>
              <p className="text-normal font-nor">
                Your wallet balance is below 0.001 ETH. The approve action require small transaction fees, so you may
                have deposit additional funds to complete them.
              </p>
            </div>
          )}
        </div>
        {currencyModalFlag && (
          <SelectCurrency
            isOpen={currencyModalFlag}
            currentCurrency={currency}
            onCloseModel={onCloseModel}
            list={coinList}
          ></SelectCurrency>
        )}
      </PageWrapper>
    </>
  )
}
