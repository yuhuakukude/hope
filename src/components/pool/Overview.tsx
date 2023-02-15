import React from 'react'
import { PoolInfo } from '../../state/stake/hooks'
// import Row from '../Row'
import { RowBetween } from '..//Row'
import styled from 'styled-components'
import { AutoColumn } from '..//Column'
import useTheme from '../../hooks/useTheme'

const TopSection = styled(AutoColumn)`
  width: 100%;
`
const PoolsWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 30px;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.bg1};
`
const RateText = styled.p`
  font-size: 16px;
  margin-left: 22px;
`

const Text2 = styled.p`
  color: ${({ theme }) => theme.text2};
`
interface OverviewData {
  title: string
  isRise: boolean
  rate: string
  amount: string
}

export default function PieCharts({ pool, smallSize }: { pool?: PoolInfo; smallSize?: boolean }) {
  console.log(pool)
  const PoolOverview = () => {
    const fakeData: OverviewData[] = [
      {
        title: 'Pool Overview',
        isRise: true,
        rate: '2.53%',
        amount: '$ 10,123,435.32'
      },
      {
        title: 'Volume(24H)',
        isRise: false,
        rate: '2.53%',
        amount: '$ 13,156,678.34'
      },
      {
        title: 'Fees(24H)',
        isRise: true,
        rate: '2.53%',
        amount: '$ 10,123,435.32'
      },
      {
        title: 'Fess(7d)',
        isRise: true,
        rate: '2.53%',
        amount: '$ 10,123,435.32'
      }
    ]

    const OverviewBlock = ({ data }: { data: OverviewData }) => {
      return (
        <div>
          <RowBetween>
            <Text2>{data.title}</Text2>
            <RiseText data={data} />
          </RowBetween>
          <p
            style={{
              color: 'white',
              fontSize: `${smallSize ? '18px' : '20px'}`,
              marginTop: `${smallSize ? '20px' : '30px'}`,
              fontFamily: 'Arboria-Medium'
            }}
          >
            {data.amount}
          </p>
        </div>
      )
    }

    const RiseText = ({ data }: { data: OverviewData }) => {
      const theme = useTheme()
      return (
        <>
          {data.isRise ? (
            <RateText style={{ color: theme.red1, fontSize: `${smallSize ? '14px' : '16px'}` }}>{data.rate} ↑</RateText>
          ) : (
            <RateText style={{ color: theme.green1, fontSize: `${smallSize ? '14px' : '16px'}` }}>
              {data.rate} ↓
            </RateText>
          )}
        </>
      )
    }
    return (
      <TopSection>
        <PoolsWrapper style={{ marginTop: '30px' }}>
          <RowBetween style={{ padding: `0px ${smallSize ? 0 : 50}px` }}>
            {fakeData.map((data, index) => {
              return <OverviewBlock data={data} key={index} />
            })}
          </RowBetween>
        </PoolsWrapper>
      </TopSection>
    )
  }
  return (
    <div>
      <PoolOverview />
    </div>
  )
}