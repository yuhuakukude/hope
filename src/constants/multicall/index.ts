import MULTICALL_ABI from './abi.json'
import { ChainId } from '@uniswap/sdk'

const MULTICALL_NETWORKS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
  [ChainId.SEPOLIA]: '0xfd6b4c8ea510641fd0b456faf2f6fe18f053006c',
  [ChainId.GOERLI]: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
  [ChainId.HOPE]: '0xfd6b4c8ea510641fd0b456faf2f6fe18f053006c'
}

export { MULTICALL_ABI, MULTICALL_NETWORKS }
