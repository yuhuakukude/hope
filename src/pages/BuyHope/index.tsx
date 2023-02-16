import styled from 'styled-components'
import { AutoColumn } from '../../components/Column'
import React, { useCallback, useMemo, useState } from 'react'
import { ButtonPrimary } from '../../components/Button'
import ActionButton from '../../components/Button/ActionButton'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { useWalletModalToggle } from '../../state/application/hooks'
import SelectCurrency from './component/SelectCurrency/index'
import JSBI from 'jsbi'
import { calculateGasMargin } from '../../utils'
import { Input as NumericalInput } from '../../components/NumericalInput'
import TransactionConfirmationModal, { TransactionErrorContent } from '../../components/TransactionConfirmationModal'
import { ethers } from 'ethers'
import { TransactionResponse } from '@ethersproject/providers'
import { useActiveWeb3React } from '../../hooks'
import { useTokenBalance } from '../../state/wallet/hooks'
import { useBuyHopeContract } from '../../hooks/useContract'
import { useSingleCallResult } from '../../state/multicall/hooks'
import { tryParseAmount } from '../../state/swap/hooks'
import { HOPE, PERMIT2_ADDRESS, TOKEN_SALE_ADDRESS, USDC, USDT } from '../../constants'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { CurrencyAmount, Token, TokenAmount } from '@uniswap/sdk'
import { getPermitData, Permit, PERMIT_EXPIRATION, toDeadline } from '../../permit2/domain'
import { useEstimate } from '../../hooks/ahp'
import './index.scss'
import useGasPrice from '../../hooks/useGasPrice'

const PageWrapper = styled(AutoColumn)`
  max-width: 1280px;
  width: 100%;
`

enum TYPE {
  TOP_INPUT = 'TOP_INPUT',
  BOTTOM_INPUT = 'BOTTOM_INPUT'
}

export default function BuyHope() {
  const toggleWalletModal = useWalletModalToggle()
  const { account, chainId, library } = useActiveWeb3React()
  const buyHopeContract = useBuyHopeContract()
  const addTransaction = useTransactionAdder()
  const isEthBalanceInsufficient = useEstimate()
  const gasPrice = useGasPrice()
  console.log('gasPrice', gasPrice)
  // state
  const [currencyModalFlag, setCurrencyModalFlag] = useState(false)
  const [inputBorder, setInputBorder] = useState('')
  const [txHash, setTxHash] = useState<string>('')
  const [errorStatus, setErrorStatus] = useState<{ code: number; message: string } | undefined>()
  const [typed, setType] = useState('')
  const [typedType, setTypedType] = useState<TYPE>(TYPE.TOP_INPUT)
  const [payToken, setPayToken] = useState<Token>(USDT[chainId ?? 1])

  const [pendingText, setPendingText] = useState('')

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm

  const rateObj = useSingleCallResult(buyHopeContract, 'currencys', [payToken.symbol])

  const [curToken, setCurToken] = useState<Token | undefined>(HOPE[chainId ?? 1])

  const formattedAmounts = useMemo(() => {
    let resOf = ''
    if (typedType === TYPE.TOP_INPUT && rateObj?.result?.rate && typed) {
      resOf = new TokenAmount(
        HOPE[chainId ?? 1],
        JSBI.divide(
          JSBI.multiply(
            JSBI.BigInt(tryParseAmount(typed, payToken)?.raw.toString() ?? '0'),
            JSBI.BigInt(rateObj?.result?.rate?.toString())
          ),
          JSBI.BigInt(1000)
        )
      ).toSignificant(HOPE[chainId ?? 1].decimals)
    }
    if (typedType === TYPE.BOTTOM_INPUT && rateObj?.result?.rate && typed) {
      resOf = new TokenAmount(
        payToken,
        JSBI.divide(
          JSBI.multiply(
            JSBI.BigInt(tryParseAmount(typed, HOPE[chainId ?? 1])?.raw.toString() ?? '0'),
            JSBI.BigInt(1000)
          ),
          JSBI.BigInt(rateObj?.result?.rate?.toString())
        )
      ).toSignificant(payToken.decimals)
      if (resOf.includes('.') && resOf.split('.')[1].length > 2) {
        setType(
          new TokenAmount(payToken, tryParseAmount(resOf, payToken)?.raw.toString() ?? '0').toFixed(2, undefined, 0) ||
            ''
        )
        setTypedType(TYPE.TOP_INPUT)
      }
    }
    return typedType === TYPE.TOP_INPUT
      ? {
          topValue: typed,
          bottomValue: typed
            ? new TokenAmount(payToken, tryParseAmount(resOf, payToken)?.raw.toString() ?? '0').toFixed(2, undefined, 0)
            : ''
        }
      : {
          topValue: typed
            ? new TokenAmount(
                HOPE[chainId ?? 1],
                tryParseAmount(resOf, HOPE[chainId ?? 1])?.raw.toString() ?? '0'
              ).toFixed(2, undefined, 0)
            : '',
          bottomValue: typed
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, payToken, rateObj?.result?.rate, typed, typedType])

  const rateScale = useMemo(() => {
    if (!rateObj?.result?.rate || !payToken) {
      return undefined
    }
    return new TokenAmount(
      HOPE[chainId ?? 1],
      JSBI.divide(
        JSBI.multiply(
          JSBI.BigInt(tryParseAmount('1', payToken)?.raw.toString() ?? '0'),
          JSBI.BigInt(rateObj?.result?.rate?.toString())
        ),
        JSBI.BigInt(1000)
      )
    )
  }, [rateObj, chainId, payToken])

  const payAmount = tryParseAmount(formattedAmounts.topValue, payToken)

  const [approvalState, approveCallback] = useApproveCallback(payAmount, PERMIT2_ADDRESS[chainId ?? 1])

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

  const onApprove = useCallback(() => {
    setCurToken(undefined)
    onTxStart()
    setPendingText(`Approve ${payToken.symbol}`)
    approveCallback()
      .then((response: TransactionResponse | undefined) => {
        onTxSubmitted(response?.hash)
      })
      .catch(error => {
        onTxError(error)
      })
  }, [approveCallback, onTxError, onTxStart, onTxSubmitted, payToken.symbol])

  const toBuyHope = useCallback(
    async (amount: CurrencyAmount, NONCE, DEADLINE, sigVal) => {
      if (!account) throw new Error('none account')
      if (!buyHopeContract) throw new Error('none contract')
      if (amount.equalTo(JSBI.BigInt('0'))) throw new Error('amount is un support')
      const args = [payToken.symbol, amount.raw.toString(), NONCE, DEADLINE, sigVal]
      const method = 'buy'
      return buyHopeContract.estimateGas[method](...args, { from: account }).then(estimatedGasLimit => {
        return buyHopeContract[method](...args, {
          gasLimit: calculateGasMargin(estimatedGasLimit),
          // gasLimit: '3500000',
          from: account
        }).then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Buy ${formattedAmounts.bottomValue} Hope with ${formattedAmounts.topValue} ${payToken.symbol}`
          })
          return response.hash
        })
      })
    },
    [account, addTransaction, buyHopeContract, formattedAmounts.bottomValue, formattedAmounts.topValue, payToken.symbol]
  )

  const buyHopeCallback = useCallback(async () => {
    if (!account || !payAmount || !library || !chainId || !payToken.symbol) return
    setCurToken(HOPE[chainId ?? 1])
    setPendingText(`Approve ${payToken.symbol}`)

    onTxStart()
    // sign
    const deadline = toDeadline(PERMIT_EXPIRATION)
    const nonce = ethers.utils.randomBytes(32)
    const permit: Permit = {
      permitted: {
        token: payToken.address,
        amount: payAmount.raw.toString()
      },
      nonce: nonce,
      spender: TOKEN_SALE_ADDRESS[chainId ?? 1] || '',
      deadline
    }
    const { domain, types, values } = getPermitData(permit, PERMIT2_ADDRESS[chainId ?? 1], chainId)
    library
      .getSigner(account)
      ._signTypedData(domain, types, values)
      .then(signature => {
        setPendingText(`Buy ${formattedAmounts.bottomValue} Hope with ${formattedAmounts?.topValue} ${payToken.symbol}`)
        toBuyHope(payAmount, nonce, deadline, signature)
          .then(hash => {
            onTxSubmitted(hash)
            setType('')
          })
          .catch((error: any) => {
            onTxError(error)
            throw error
          })
      })
      .catch(error => {
        onTxError(error)
      })
  }, [account, payAmount, library, chainId, payToken, onTxStart, formattedAmounts, toBuyHope, onTxSubmitted, onTxError])

  const balanceAmount = useTokenBalance(account ?? undefined, payToken)

  const actionText = useMemo(() => {
    if (!typed) {
      return `Enter Amount`
    } else if (payAmount && balanceAmount?.lessThan(payAmount)) {
      return `Insufficient ${payToken.symbol} balance`
    } else {
      return approvalState === ApprovalState.NOT_APPROVED ? `Approve ${payToken.symbol}` : 'Supply'
    }
  }, [typed, payAmount, balanceAmount, payToken.symbol, approvalState])

  const inputOnFocus = (type: string) => {
    setInputBorder(type)
  }

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

  return (
    <>
      <PageWrapper>
        <TransactionConfirmationModal
          isOpen={showConfirm}
          onDismiss={() => setShowConfirm(false)}
          attemptingTxn={attemptingTxn}
          hash={txHash}
          content={confirmationContent}
          pendingText={pendingText}
          currencyToAdd={curToken}
        />
        <div className="buy-hope-page">
          <div className="title text-medium font-18">Buy HOPE to your wallet</div>
          <div className="box m-t-40">
            <div className="flex jc-between">
              <div className="input-title text-medium font-16 text-normal">You Pay</div>
              {account && (
                <div className="balance text-normal font-nor">
                  Available: {balanceAmount?.toFixed(2)}
                  {balanceAmount && (
                    <span
                      className="text-primary m-l-8 cursor-select"
                      onClick={() => {
                        setTypedType(TYPE.TOP_INPUT)
                        setType(balanceAmount?.toFixed(2, undefined, 0))
                      }}
                    >
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
                payAmount && balanceAmount?.lessThan(payAmount) && 'error',
                inputBorder === 'pay' && 'fouce'
              ].join(' ')}
            >
              <div className="coin-box flex ai-center cursor-select" onClick={() => setCurrencyModalFlag(true)}>
                <div className={`${payToken.symbol === 'USDT' ? 'usdt-icon' : 'usdc-icon'}`}></div>
                <div className="currency font-nor text-medium m-l-12">{payToken.symbol}</div>
                <div className="drop m-l-30">
                  <i className="iconfont text-normal">&#xe60d;</i>
                </div>
              </div>
              <NumericalInput
                error={payAmount && balanceAmount?.lessThan(payAmount)}
                onFocus={() => inputOnFocus('pay')}
                onBlur={() => setInputBorder('')}
                className="input m-l-10"
                decimals={2}
                value={formattedAmounts.topValue}
                align={'right'}
                onUserInput={value => {
                  setType(value)
                  setTypedType(TYPE.TOP_INPUT)
                }}
              />
            </div>
          </div>
          <div className="i-box flex jc-center m-t-30 m-b-30">
            <i className="iconfont font-28 text-normal user-select">&#xe617;</i>
          </div>
          <div className="box">
            <div className="input-title text-medium font-16 text-normal">You Receive</div>
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
                value={formattedAmounts.bottomValue}
                align={'right'}
                onUserInput={value => {
                  setType(value)
                  setTypedType(TYPE.BOTTOM_INPUT)
                }}
              />
            </div>
          </div>
          <div className="btn-box m-t-30">
            <p className="font-nor text-normal text-center">
              1.00 {payToken.symbol} = {rateScale ? rateScale.toFixed(2) : '-'} HOPE
            </p>
            <div className="action-box m-t-30">
              {!account ? (
                <ButtonPrimary className="hp-button-primary text-medium font-nor" onClick={toggleWalletModal}>
                  Connect Wallet
                </ButtonPrimary>
              ) : (
                <ActionButton
                  error={
                    payAmount && balanceAmount?.lessThan(payAmount)
                      ? `Insufficient ${payToken.symbol} balance`
                      : undefined
                  }
                  pending={approvalState === ApprovalState.PENDING || rateObj?.loading || !!pendingText}
                  pendingText={rateObj?.loading ? 'Waitting' : 'Confirm in your wallet'}
                  disableAction={approvalState === ApprovalState.UNKNOWN}
                  actionText={actionText}
                  onAction={approvalState === ApprovalState.NOT_APPROVED ? onApprove : buyHopeCallback}
                />
              )}
            </div>
          </div>
          {account && (
            <div className="gas flex jc-between p-t-30 m-t-30">
              <div className="label font-nor text-normal">Gas Fee</div>
              <div className="value font-nor text-medium">≈0.001 ETH</div>
            </div>
          )}
          {account && isEthBalanceInsufficient && (
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
            supportedTokens={[USDT[chainId ?? 1], USDC[chainId ?? 1]]}
            selectToken={payToken}
            onTokenSelect={token => setPayToken(token)}
            onCloseModel={() => setCurrencyModalFlag(false)}
          />
        )}
      </PageWrapper>
    </>
  )
}
