import React, { useEffect, useCallback, useState } from 'react'
import { TYPE } from '../../theme'
import { AutoColumn } from '../../components/Column'
import { CardHeader } from '../../components/pool/PoolInfoCard'
import CurrencyLogo from '../../components/CurrencyLogo'
import { AutoRow, RowBetween } from '../../components/Row'
import { ColumnCenter } from '../../components/Column'
import { useActiveWeb3React } from '../../hooks'
import AprApi from '../../api/apr.api'
import format from '../../utils/format'
import { getLTToken } from 'utils/addressHelpers'

export default function TotalApr({ address }: { address?: string }) {
  const { chainId } = useActiveWeb3React()
  const [aprInfo, setAprInfo] = useState<any>({})

  const initFn = useCallback(async () => {
    if (!address) return
    const res = await AprApi.getHopeFeeApr(address)
    if (res && res.result) {
      setAprInfo(res.result)
    }
  }, [address])

  useEffect(() => {
    initFn()
  }, [initFn])

  return (
    <CardHeader>
      <AutoColumn>
        <ColumnCenter>
          <TYPE.green fontSize={48}>{format.rate(aprInfo.baseApr)}</TYPE.green>
          <TYPE.white mt={20} fontSize={20}>
            Total APR
          </TYPE.white>
        </ColumnCenter>
        <AutoColumn gap={'lg'} style={{ marginTop: 20 }}>
          <RowBetween>
            <TYPE.mediumHeader>Fee APR :</TYPE.mediumHeader>
            <TYPE.mediumHeader>{format.rate(aprInfo.feeApr)}</TYPE.mediumHeader>
          </RowBetween>
          <RowBetween>
            <TYPE.mediumHeader>Reward APR :</TYPE.mediumHeader>
            <TYPE.mediumHeader>{format.rate(aprInfo.rewardRate)}</TYPE.mediumHeader>
          </RowBetween>
          <RowBetween>
            <TYPE.mediumHeader>Mint Rewards :</TYPE.mediumHeader>
            <AutoRow width={'auto'} gap={'10px'}>
              <TYPE.mediumHeader>LT</TYPE.mediumHeader>
              <CurrencyLogo currency={getLTToken(chainId)} />
            </AutoRow>
          </RowBetween>
        </AutoColumn>
      </AutoColumn>
    </CardHeader>
  )
}
