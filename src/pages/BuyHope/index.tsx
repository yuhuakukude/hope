import styled from 'styled-components'
import { AutoColumn } from '../../components/Column'
import { useActiveWeb3React } from '../../hooks'
import { useTokenBalance } from '../../state/wallet/hooks'
import React, { useState, useCallback, useEffect } from 'react'
import { ButtonPrimary } from '../../components/Button'
import ActionButton from '../../components/Button/ActionButton'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { useWalletModalToggle } from '../../state/application/hooks'
import { useToStaked } from '../../hooks/ahp/useStaking'
import SelectCurrency from './component/SelectCurrency/index'
import { useBuyHopeContract } from '../../hooks/useContract'
import { useSingleCallResult } from '../../state/multicall/hooks'

import './index.scss'
import { Input as NumericalInput } from '../../components/NumericalInput'
import { tryParseAmount } from '../../state/swap/hooks'
import { TokenAmount } from '@uniswap/sdk'
import { PERMIT2_ADDRESS, USDT, USDC, HOPE } from '../../constants'

const PageWrapper = styled(AutoColumn)`
  max-width: 1280px;
  width: 100%;
`

export default function BuyHope() {
  const [currency, setCurrency] = useState<string>('USDT')
  const [currencyModalFlag, setCurrencyModalFlag] = useState(false)
  const [rateVal, setRateVal] = useState('')
  const [coinList, setCoinList] = useState('')
  const [pay, setPay] = useState('')
  const [receive, setReceive] = useState('')
  const toggleWalletModal = useWalletModalToggle()
  const { account, chainId } = useActiveWeb3React()
  const buyHopeContract = useBuyHopeContract()
  const rateObj = useSingleCallResult(buyHopeContract, 'currencys', [currency])
  const usdtBalance = useTokenBalance(account ?? undefined, USDT)
  const usdcBalance = useTokenBalance(account ?? undefined, USDC)
  // console.log(usdtBalance?.toFixed(2, { groupSeparator: ',' } ?? '-'), chainId)
  const inputAmount = tryParseAmount(pay, USDT) as TokenAmount | undefined
  const [approvalState, approveCallback] = useApproveCallback(inputAmount, PERMIT2_ADDRESS)
  const { toStaked } = useToStaked()

  const onUserPayInput = (value: string) => {
    setPay(value)
  }

  const stakingCallback = useCallback(async () => {
    if (!pay || !account || !inputAmount) return
    // showModal(<TransactionPendingModal />)
    const testData = {
      NONCE: '47317459226169151117060976502302229419756387859583426096766647023563518724591',
      DEADLINE: '1675355171',
      sigVal:
        '0xc5beacf6327fafdbb3a188f1974da1b890e28921b4302b800a6d609c904d001e1669a5e73c18fb749eabb8b74587192c2bbcfe68954f0b18fc479c8a50b667781b'
    }
    toStaked(inputAmount, testData.NONCE, testData.DEADLINE, testData.sigVal)
      .then(() => {
        console.log('success')
        // hideModal()
        // showModal(<TransactionSubmittedModal />)
      })
      .catch((err: any) => {
        // hideModal()
        // showModal(
        //   <MessageBox type="error">{err.error && err.error.message ? err.error.message : err?.message}</MessageBox>
        // )
        console.error(err)
      })
  }, [pay, account, inputAmount, toStaked])

  const onUserReceiveInput = (value: string) => {
    setReceive(value)
  }
  const showSelectCurrency = () => {
    const arr: any = [
      {
        coin: 'USDT',
        dec: USDT.decimals,
        amount: usdtBalance?.toFixed(2, { groupSeparator: ',' } ?? '-'),
        icon: 'usdt-icon'
      },
      {
        coin: 'USDC',
        dec: USDC.decimals,
        amount: usdcBalance?.toFixed(2, { groupSeparator: ',' } ?? '-'),
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
    setPay(balance || '0')
  }

  useEffect(() => {
    const uDec = currency === 'USDT' ? USDT.decimals : USDC.decimals
    console.warn(rateObj)
    if (rateObj?.result) {
      const rate = Number(rateObj.result.rate.toString()) || 0
      setRateVal(`${rate / Math.pow(10, HOPE[chainId ?? 1].decimals - uDec) / 1000}`)
    } else {
      setRateVal('')
    }
    console.warn(rateVal)
  }, [currency, rateObj.result])
  return (
    <>
      <PageWrapper>
        <div className="buy-hope-page">
          <div className="title text-medium font-18">Buy HOPE to your wallet</div>
          <div className="box m-t-40">
            <div className="flex jc-between">
              <div className="input-title text-medium font-18 text-normal">You Pay</div>
              <div className="balance text-normal font-nor">
                Available:{' '}
                {currency === 'USDT'
                  ? usdtBalance?.toFixed(2, { groupSeparator: ',' } ?? '0.00') || '-'
                  : usdcBalance?.toFixed(2, { groupSeparator: ',' } ?? '0.00') || '-'}{' '}
                <span className="text-primary m-l-8 cursor-select" onClick={maxInputFn}>
                  Max
                </span>
              </div>
            </div>
            <div className="input-box m-t-12 p-x-32 flex ai-center">
              <div className="coin-box flex ai-center cursor-select" onClick={showSelectCurrency}>
                <div className={`${currency === 'USDT' ? 'usdt-icon' : 'usdc-icon'}`}></div>
                <div className="currency font-nor text-medium m-l-12">{currency}</div>
                <div className="drop m-l-30">
                  <i className="iconfont">&#xe60d;</i>
                </div>
              </div>
              <NumericalInput
                className="input m-l-10"
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
            <div className="input-box m-t-12 p-x-32 flex ai-center">
              <div className="coin-box flex ai-center cursor-select">
                <div className="hope-icon"></div>
                <div className="currency font-nor text-medium m-l-12">HOPE</div>
              </div>
              <NumericalInput
                className="input m-l-10"
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
                <ButtonPrimary className="hp-button-primary" onClick={toggleWalletModal}>
                  Connect Wallet
                </ButtonPrimary>
              ) : (
                <ActionButton
                  pending={approvalState === ApprovalState.PENDING}
                  disableAction={!inputAmount}
                  actionText={
                    !inputAmount
                      ? 'Enter amount'
                      : approvalState === ApprovalState.NOT_APPROVED
                      ? 'Allow RamBox to use your USDT'
                      : 'Approve'
                  }
                  onAction={approvalState === ApprovalState.NOT_APPROVED ? approveCallback : stakingCallback}
                />
                // <ButtonPrimary className="hp-button-primary">approve</ButtonPrimary>
              )}
            </div>
          </div>
          <div className="gas flex jc-between p-y-30 m-t-30">
            <div className="label font-nor text-normal">Gas Fee</div>
            <div className="value font-nor text-medium">≈0.001 ETH</div>
          </div>
          <div className="tip flex m-t-30">
            <div className="icon m-r-15">
              <i className="iconfont font-28">&#xe614;</i>
            </div>
            <p className="text-normal font-nor">
              Your wallet balance is below 0.001 ETH. The approve action require small transaction fees, so you may have
              deposit additional funds to complete them.
            </p>
          </div>
        </div>
        {currencyModalFlag && (
          <SelectCurrency isOpen={currencyModalFlag} onCloseModel={onCloseModel} list={coinList}></SelectCurrency>
        )}
      </PageWrapper>
    </>
  )
}
