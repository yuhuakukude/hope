import Row, { AutoRowBetween } from '../Row'
import { GapColumn } from '../Column'
import React from 'react'
import { NavLink } from 'react-router-dom'
import Avatar from 'assets/images/metamask-logo.png'
import { useActiveWeb3React } from '../../hooks'
import { getEtherscanLink, shortenAddress } from '../../utils'
import { ButtonPrimary } from '../Button'
import styled from 'styled-components'
import Arrow from 'assets/images/arrow-right-white.png'
import useTheme from '../../hooks/useTheme'
import { Text } from 'rebass'
import { PrimaryText } from '../Text'
import Test1 from 'assets/images/test1.jpg'
import Test2 from 'assets/images/test2.jpg'
import Test3 from 'assets/images/test3.jpg'
import { useETHBalances, useTokenBalance } from '../../state/wallet/hooks'
import { HOPE, LT, ST_HOPE } from '../../constants'
import Circle from '../../assets/images/blue-loader.svg'
import { CustomLightSpinner, ExternalLink } from '../../theme'
import Copy from '../AccountDetails/Copy'
import { useWalletModalToggle } from '../../state/application/hooks'

export const DivideLine = styled.div`
  border: 0.5px solid ${({ theme }) => theme.bg3};
  width: 100%;
`

interface BalanceData {
  icon: string
  name: string
  balance: string
  statues?: string
}

function BalanceDetail({ data }: { data: BalanceData }) {
  const theme = useTheme()
  return (
    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
      <Row>
        <img src={data.icon} style={{ width: '24px', height: '24px' }} alt="" />
        <Text style={{ marginLeft: '8px' }} color={theme.text1}>
          {data.name}
        </Text>
        {data.statues && <Text style={{ color: theme.primary1, marginLeft: '8px' }}>{data.statues}</Text>}
      </Row>
      <p style={{ color: theme.text1 }}>{data.balance}</p>
    </div>
  )
}

const ThemeText = styled.p`
  color: ${({ theme }) => theme.text1};
`

const TransactionLayout = styled.div`
  width: 100%;
  padding: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  : hover {
    cursor: pointer;
  }
`

export default function WalletDetail({
  showTransaction,
  setShowTransaction
}: {
  showTransaction: boolean
  setShowTransaction: (showTransaction: boolean) => void
}) {
  const { account, chainId, deactivate } = useActiveWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const theme = useTheme()
  const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']
  const hopeBalance = useTokenBalance(account ?? undefined, HOPE[chainId ?? 1])
  const stHopeBalance = useTokenBalance(account ?? undefined, ST_HOPE[chainId ?? 1])
  const ltBalance = useTokenBalance(account ?? undefined, LT[chainId ?? 1])

  const fakeIcon = <img src={Avatar} style={{ width: '24px', height: '24px' }} alt="" />
  return (
    <div
      style={{
        position: 'absolute',
        width: '460px',
        display: 'flex',
        background: theme.bg1,
        top: '80px',
        right: '20px',
        borderRadius: '20px',
        alignItems: 'center',
        flexDirection: 'column',
        overflowY: 'scroll'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {fakeIcon}
          <PrimaryText style={{ marginLeft: '8px' }}>{account && shortenAddress(account)}</PrimaryText>
        </div>
        {account && chainId && (
          <div>
            <AutoRowBetween style={{ alignItems: 'center', color: theme.text1 }}>
              {account && <Copy toCopy={account} />}
              <ExternalLink href={`${getEtherscanLink(chainId, account, 'address')}`}>
                <i className="iconfont" style={{ fontSize: '18px', margin: '0 21px', color: '#fff' }}>
                  &#xe60e;
                </i>
              </ExternalLink>
              <i
                onClick={() => {
                  toggleWalletModal()
                  deactivate()
                }}
                className="iconfont"
                style={{ fontSize: '18px', color: '#fff', cursor: 'pointer' }}
              >
                &#xe605;
              </i>
            </AutoRowBetween>
          </div>
        )}
      </div>
      {userEthBalance ? (
        <ThemeText style={{ fontSize: '30px', marginTop: '14px' }}>
          {userEthBalance ? userEthBalance.toFixed(6, { groupSeparator: ',' }) : '--'}
        </ThemeText>
      ) : (
        <CustomLightSpinner src={Circle} alt="loader" size={'20px'} />
      )}
      <ThemeText style={{ color: theme.text2, marginTop: '16px' }}>ETH Balance</ThemeText>
      <NavLink style={{ padding: '40px 30px', width: '100%' }} to={'/hope/buy-hope'}>
        <ButtonPrimary>Buy HOPE</ButtonPrimary>
      </NavLink>
      <DivideLine />
      <GapColumn gap={'30px'} style={{ width: '100%', padding: '30px' }}>
        <BalanceDetail
          data={{
            name: 'HOPE',
            icon: Test1,
            balance: hopeBalance ? hopeBalance?.toFixed(2, { groupSeparator: ',' }) : '--'
          }}
        />
        <BalanceDetail
          data={{
            name: 'stHOPE',
            icon: Test2,
            balance: stHopeBalance ? stHopeBalance?.toFixed(2, { groupSeparator: ',' }) : '--'
          }}
        />
        <BalanceDetail
          data={{
            name: 'LT',
            icon: Test3,
            balance: ltBalance ? ltBalance?.toFixed(2, { groupSeparator: ',' }) : '--'
          }}
        />
      </GapColumn>
      <DivideLine />
      <TransactionLayout
        onClick={() => {
          if (!showTransaction) {
            setShowTransaction(true)
          }
        }}
      >
        <ThemeText>Transactions</ThemeText>
        <img src={Arrow} style={{ width: '16px', height: '16px' }} alt="" />
      </TransactionLayout>
    </div>
  )
}
