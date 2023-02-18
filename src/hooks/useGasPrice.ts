import JSBI from 'jsbi'
import { useEffect, useState } from 'react'

import { useActiveWeb3React } from './index'
import { useBlockNumber } from '../state/application/hooks'

export default function useGasPrice(): JSBI | undefined {
  const [gasPrice, setGasPrice] = useState<undefined | JSBI>()
  const blockNumber = useBlockNumber()
  const { library } = useActiveWeb3React()
  useEffect(() => {
    library?.getGasPrice().then(gas => {
      setGasPrice(JSBI.BigInt(gas))
    })
  }, [blockNumber, library])
  return gasPrice
}
