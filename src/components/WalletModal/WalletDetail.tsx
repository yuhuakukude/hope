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

const DivideLine = styled.div`
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
        <img src={data.icon} style={{ width: '24px', height: '24px' }} />
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

export default function WalletDetail() {
  const { account } = useActiveWeb3React()
  const [gas, setGas] = useState(0)
  const theme = useTheme()
  const balance = '1.001000'
  const fakeBalanceData: BalanceData[] = [
    {
      icon: Avatar,
      name: 'HOPE',
      balance: '10,002,000.00'
    },
    {
      icon: Avatar,
      name: 'stHOPE',
      balance: '10,002,000.00',
      statues: 'Staking'
    },
    {
      icon: Avatar,
      name: 'LT',
      balance: '109,010,002,000.00'
    }
  ]
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
  const fakeIcon = <img src={Avatar} style={{ width: '24px', height: '24px' }} />
  return (
    <div style={{ width: '100%', display: 'flex', alignItems: 'center', flexDirection: 'column', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {fakeIcon}
          <PrimaryText style={{ marginLeft: '8px' }}>{account && shortenAddress(account)}</PrimaryText>
        </div>
        <div>
          <AutoRowBetween gap={'10px'} style={{ color: theme.text1 }}>
            <i className="iconfont">&#xe60a;</i>
            <i className="iconfont">&#xe60a;</i>
            <i className="iconfont">&#xe60a;</i>
          </AutoRowBetween>
        </div>
      </div>
      <ThemeText style={{ fontSize: '30px' }}>{balance}</ThemeText>
      <ThemeText style={{ color: theme.text2, marginTop: '16px' }}>görETH Balance</ThemeText>
      <ButtonPrimary width={'80%'} margin={'40px 0'}>
        Buy HOPE
      </ButtonPrimary>
      <DivideLine />
      <GapColumn gap={'30px'} style={{ width: '100%', padding: '30px' }}>
        {fakeBalanceData.map((blc, index) => {
          return <BalanceDetail data={blc} key={index} />
        })}
      </GapColumn>
      <DivideLine />
      <PrimaryText style={{ width: '100%', padding: '30px', fontSize: '18px' }}>Gas Priority Fee</PrimaryText>
      <div
        style={{
          display: 'flex',
          width: '100%',
          justifyContent: 'space-between',
          padding: '0px 30px',
          marginBottom: '30px'
        }}
      >
        {gasType.map((type, index) => {
          return <GasType data={type} isSelected={index == gas} key={index} onClick={() => setGas(index)} />
        })}
      </div>
      <DivideLine />
      <div
        style={{
          width: '100%',
          padding: '30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <ThemeText>Transactions</ThemeText>
        <img src={Arrow} style={{ width: '16px', height: '16px' }} />
      </div>
    </div>
  )
}
