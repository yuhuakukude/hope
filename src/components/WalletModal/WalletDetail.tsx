import Row, { AutoRowBetween } from '../Row'
import { GapColumn } from '../Column'
import React, { useMemo } from 'react'
import Avatar from 'assets/images/metamask-logo.png'
import { useActiveWeb3React } from '../../hooks'
import { getEtherscanLink, shortenAddress } from '../../utils'
import { ButtonPrimary } from '../Button'
import styled from 'styled-components'
import Arrow from 'assets/images/arrow-right-white.png'
import useTheme from '../../hooks/useTheme'
import { Text } from 'rebass'
import { PrimaryText } from '../Text'
import Test1 from 'assets/images/ahp/hope.png'
import Test2 from 'assets/images/ahp/sthope.png'
import Test3 from 'assets/images/ahp/lt.png'
import { useETHBalances, useTokenBalance, useStHopeBalance } from '../../state/wallet/hooks'
import Circle from '../../assets/images/blue-loader.svg'
import { CustomLightSpinner, ExternalLink } from '../../theme'
import Copy from '../AccountDetails/Copy'
import { useWalletModalToggle } from '../../state/application/hooks'
import { setInjectedConnected } from 'utils/isInjectedConnectedPrev'
import { Tooltip } from 'antd'
import { getHOPEToken, getLTToken, getHopeTokenAddress } from 'utils/addressHelpers'
import { useHistory } from 'react-router-dom'

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
      <Row flex={1}>
        <img src={data.icon} style={{ width: '24px', height: '24px' }} alt="" />
        <Text style={{ marginLeft: '8px' }} color={theme.text1}>
          {data.name}
        </Text>
        {data.statues && <Text style={{ color: theme.primary1, marginLeft: '8px' }}>{data.statues}</Text>}
      </Row>
      <p className="flex-2" style={{ color: theme.text1, textAlign: 'right' }}>
        {data.balance}
      </p>
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
  const history = useHistory()
  const { account, chainId, deactivate } = useActiveWeb3React()
  const hopeToken = useMemo(() => getHOPEToken(chainId), [chainId])
  const ltToken = useMemo(() => getLTToken(chainId), [chainId])
  const toggleWalletModal = useWalletModalToggle()
  const theme = useTheme()
  const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']
  const hopeBalance = useTokenBalance(account ?? undefined, hopeToken)
  const stHopeBalance = useStHopeBalance()
  const ltBalance = useTokenBalance(account ?? undefined, ltToken)

  const hopeAddresses = useMemo(() => {
    return getHopeTokenAddress(chainId) ?? undefined
  }, [chainId])

  const fakeIcon = <img src={Avatar} style={{ width: '24px', height: '24px' }} alt="" />
  return (
    <div
      style={{
        position: 'absolute',
        width: '420px',
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
                <Tooltip overlayClassName="tips-wallet" title="Explore">
                  <i
                    className="iconfont hope-icon-common"
                    style={{ fontSize: '18px', margin: '0 21px', padding: '5px' }}
                  >
                    &#xe60e;
                  </i>
                </Tooltip>
              </ExternalLink>
              <Tooltip overlayClassName="tips-wallet" title="Disconnect">
                <i
                  onClick={() => {
                    setInjectedConnected()
                    toggleWalletModal()
                    deactivate()
                  }}
                  className="iconfont hope-icon-common"
                  style={{ fontSize: '18px', cursor: 'pointer', padding: '5px' }}
                >
                  &#xe629;
                </i>
              </Tooltip>
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
      <div style={{ padding: '40px 30px', width: '100%' }}>
        <ButtonPrimary
          disabled={!hopeAddresses}
          onClick={() => {
            history.push(`/swap/exchange/${hopeAddresses}`)
            toggleWalletModal()
          }}
        >
          Buy HOPE
        </ButtonPrimary>
      </div>
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
