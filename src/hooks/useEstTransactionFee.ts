//import { useActiveWeb3React } from './index'
import { Contract } from '@ethersproject/contracts'

export function UseEstTransactionFee(contract: Contract, method: string, args: any[]) {
  //const {library} = useActiveWeb3React()
  return contract.estimateGas[method]
}
