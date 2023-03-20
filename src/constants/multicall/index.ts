import MULTICALL_ABI from './abi.json'
import { ChainId } from '@uniswap/sdk'

const MULTICALL_NETWORKS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0xfd6b4c8ea510641fd0b456faf2f6fe18f053006c',
  [ChainId.GOERLI]: '0xfd6b4c8ea510641fd0b456faf2f6fe18f053006c',
  [ChainId.SEPOLIA]: '0xfd6b4c8ea510641fd0b456faf2f6fe18f053006c',
  [ChainId.HOPE]: '0xfd6b4c8ea510641fd0b456faf2f6fe18f053006c'
}

export { MULTICALL_ABI, MULTICALL_NETWORKS }
