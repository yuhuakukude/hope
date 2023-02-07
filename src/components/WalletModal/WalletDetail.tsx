import Row, { AutoRowBetween } from '../Row'
import { GapColumn } from '../Column'
import React, { useState } from 'react'
import Avatar from 'assets/images/metamask-logo.png'
import { useActiveWeb3React } from '../../hooks'
import { shortenAddress } from '../../utils'
import { ButtonPrimary } from '../Button'
import styled from 'styled-components'
import Arrow from 'assets/images/arrow-right-white.png'
import useTheme from '../../hooks/useTheme'
import { Text } from 'rebass'
import { PrimaryText, SecondaryText } from '../Text'
import { ReactComponent as Copy } from 'assets/svg/copy.svg'
import { ReactComponent as Share } from 'assets/svg/share.svg'
import { ReactComponent as Disconnect } from 'assets/svg/disconnect.svg'
import Test1 from 'assets/images/test1.jpg'
import Test2 from 'assets/images/test2.jpg'
import Test3 from 'assets/images/test3.jpg'
import { useETHBalances, useTokenBalance } from '../../state/wallet/hooks'
import { HOPE, LT } from '../../constants'
import Circle from '../../assets/images/blue-loader.svg'
import { CustomLightSpinner } from '../../theme'

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

interface GasTypeData {
  speed: string
  gas: string
  time: string
}

const GasDiv = styled(GapColumn)`
  border-radius: 10px;
  padding: 17px;

  :hover {
    cursor: pointer;
  }
`

function GasType({ data, isSelected, onClick }: { data: GasTypeData; isSelected: boolean; onClick: () => void }) {
  const theme = useTheme()
  return (
    <GasDiv
      gap={'10px'}
      onClick={_ => onClick()}
      style={{ border: isSelected ? `1px solid ${theme.primary1}` : '1px solid rgba(61, 61, 61, 1)' }}
    >
      <PrimaryText size={'14px'}>{data.speed}</PrimaryText>
      <PrimaryText size={'14px'}>{data.gas}</PrimaryText>
      <SecondaryText size={'14px'}>{data.time}</SecondaryText>
    </GasDiv>
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
  const { account, chainId } = useActiveWeb3React()
  const [gas, setGas] = useState(0)
  const theme = useTheme()
  const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']
  const hopeBalance = useTokenBalance(account ?? undefined, HOPE[chainId ?? 1])
  const stHopeBalance = useTokenBalance(account ?? undefined, HOPE[chainId ?? 1])
  const ltBalance = useTokenBalance(account ?? undefined, LT[chainId ?? 1])

  const gasType: GasTypeData[] = [
    {
      speed: 'Standard',
      gas: '14 Gwei | $0.40',
      time: '~10 min 0 secs'
    },
    {
      speed: 'Fast',
      gas: '16 Gwei  |  $0.45',
      time: '~10 min 0 secs'
    },
    {
      speed: 'Instant',
      gas: '21 Gwei  |  $0.51',
      time: '~10 min 0 secs'
    }
  ]
  const fakeIcon = <img src={Avatar} style={{ width: '24px', height: '24px' }} alt="" />
  return (
    <div
      style={{
        position: 'absolute',
        width: '460px',
        display: 'flex',
        background: theme.bg1,
        top: '70px',
        right: '20px',
        borderRadius: '20px',
        alignItems: 'center',
        flexDirection: 'column',
        overflowY: 'scroll'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {fakeIcon}
          <PrimaryText style={{ marginLeft: '8px' }}>{account && shortenAddress(account)}</PrimaryText>
        </div>
        <div>
          <AutoRowBetween gap={'10px'} style={{ alignItems: 'center', color: theme.text1 }}>
            <Copy style={{ width: '24px', height: '24px', padding: '3px' }} />
            <Share style={{ width: '24px', height: '24px', padding: '3px' }} />
            <Disconnect />
          </AutoRowBetween>
        </div>
      </div>
      {userEthBalance ? (
        <ThemeText style={{ fontSize: '30px' }}>
          {userEthBalance ? userEthBalance.toFixed(2, { groupSeparator: ',' }) : '--'}
        </ThemeText>
      ) : (
        <CustomLightSpinner src={Circle} alt="loader" size={'20px'} />
      )}
      <ThemeText style={{ color: theme.text2, marginTop: '16px' }}>ETH Balance</ThemeText>
      <ButtonPrimary width={'80%'} margin={'20px 0'}>
        Buy HOPE
      </ButtonPrimary>
      <DivideLine />
      <GapColumn gap={'30px'} style={{ width: '100%', padding: '20px' }}>
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
      <PrimaryText style={{ width: '100%', padding: '30px', fontSize: '18px' }}>Gas Priority Fee</PrimaryText>
      <div
        style={{
          display: 'flex',
          width: '100%',
          justifyContent: 'space-between',
          padding: '0px 20px',
          marginBottom: '20px'
        }}
      >
        {gasType.map((type, index) => {
          return <GasType data={type} isSelected={index === gas} key={index} onClick={() => setGas(index)} />
        })}
      </div>
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
