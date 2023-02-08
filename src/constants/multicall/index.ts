import { ChainId } from '@uniswap/sdk'
import MULTICALL_ABI from './abi.json'

const MULTICALL_NETWORKS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441',
  [ChainId.SEPOLIA]: '0xE78D911B56a6321bF622172D32D916f9563e8D84',
  [ChainId.HOPE]: '0x614590F45eCe22E87198FdbF89a99810545682E7'
}

export { MULTICALL_ABI, MULTICALL_NETWORKS }
