import MULTICALL_ABI from './abi.json'
import { ChainId } from '@uniswap/sdk'

const MULTICALL_NETWORKS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0xfd6b4c8ea510641fd0b456faf2f6fe18f053006c',
  [ChainId.SEPOLIA]: '0xfd6b4c8ea510641fd0b456faf2f6fe18f053006c',
  [ChainId.HOPE]: '0x614590F45eCe22E87198FdbF89a99810545682E7'
}

export { MULTICALL_ABI, MULTICALL_NETWORKS }
