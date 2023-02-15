import { Contract } from '@ethersproject/contracts'
import { abi as GOVERNANCE_ABI } from '@uniswap/governance/build/GovernorAlpha.json'
import { abi as UNI_ABI } from '@uniswap/governance/build/Uni.json'
import STAKING_REWARDS_ABI from '../constants/abis/ahp/PoolGomboc.json'
import { abi as MERKLE_DISTRIBUTOR_ABI } from '@uniswap/merkle-distributor/build/MerkleDistributor.json'
import { ChainId, WETH } from '@uniswap/sdk'
import { abi as IUniswapV2PairABI } from '@uniswap/v2-core/build/IUniswapV2Pair.json'
import { useMemo } from 'react'
import { GOVERNANCE_ADDRESS, MERKLE_DISTRIBUTOR_ADDRESS, PERMIT2_ADDRESS, UNI } from '../constants'
import {
  ARGENT_WALLET_DETECTOR_ABI,
  ARGENT_WALLET_DETECTOR_MAINNET_ADDRESS
} from '../constants/abis/argent-wallet-detector'
import ENS_PUBLIC_RESOLVER_ABI from '../constants/abis/ens-public-resolver.json'
import ENS_ABI from '../constants/abis/ens-registrar.json'
import { ERC20_BYTES32_ABI } from '../constants/abis/erc20'
import ERC20_ABI from '../constants/abis/erc20.json'
import { MIGRATOR_ABI, MIGRATOR_ADDRESS } from '../constants/abis/migrator'
import UNISOCKS_ABI from '../constants/abis/unisocks.json'
import WETH_ABI from '../constants/abis/weth.json'
import { MULTICALL_ABI, MULTICALL_NETWORKS } from '../constants/multicall'
import { V1_EXCHANGE_ABI, V1_FACTORY_ABI, V1_FACTORY_ADDRESSES } from '../constants/v1'
import { getContract } from '../utils'
import { useActiveWeb3React } from './index'

import {
  STAKING_HOPE_GOMBOC_ADDRESS,
  LT_MINTER_ADDRESS,
  TOKEN_SALE_ADDRESS,
  VELT_TOKEN_ADDRESS,
  GOMBOC_CONTROLLER_ADDRESS,
  LT_TOKEN_ADDRESS,
  FEE_DIS_ADDRESS,
  GOM_FEE_DIS_ADDRESS
} from '../constants'
import STAKING_HOPE_GOMBOC_ABI from '../constants/abis/ahp/STAKING_HOPE_GOMBOC.json'
import TOKEN_SALE_ABI from '../constants/abis/ahp/TOKEN_SALE.json'
import LT_MINTER_ABI from '../constants/abis/ahp/LT_MINTER.json'
import PERMIT2_ABI from '../constants/abis/ahp/PERMIT2.json'
import VELT_TOKEN_ABI from '../constants/abis/ahp/VELT_TOKEN.json'
import LT_TOKEN_ABI from '../constants/abis/ahp/LT_TOKEN.json'
import GOMBOC_CONTROLLER_ABI from '../constants/abis/ahp/GOMBOC_CONTROLLER.json'
import POOL_GOMBOC_ABI from '../constants/abis/ahp/POOL_GOMBOC.json'
import FEE_DIS_ABI from '../constants/abis/ahp/Fee_Distributor.json'
import GOM_FEE_DIS_ABI from '../constants/abis/ahp/Gomboc_Fee_Distributor.json'

// returns null on errors
function useContract(address: string | undefined, ABI: any, withSignerIfPossible = true): Contract | null {
  const { library, account } = useActiveWeb3React()

  return useMemo(() => {
    if (!address || !ABI || !library) return null
    try {
      return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, ABI, library, withSignerIfPossible, account])
}

export function useV1FactoryContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId && V1_FACTORY_ADDRESSES[chainId], V1_FACTORY_ABI, false)
}

export function useV2MigratorContract(): Contract | null {
  return useContract(MIGRATOR_ADDRESS, MIGRATOR_ABI, true)
}

export function useV1ExchangeContract(address?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(address, V1_EXCHANGE_ABI, withSignerIfPossible)
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useWETHContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? WETH[chainId].address : undefined, WETH_ABI, withSignerIfPossible)
}

export function useArgentWalletDetectorContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(
    chainId === ChainId.MAINNET ? ARGENT_WALLET_DETECTOR_MAINNET_ADDRESS : undefined,
    ARGENT_WALLET_DETECTOR_ABI,
    false
  )
}

export function useENSRegistrarContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  let address: string | undefined
  if (chainId) {
    switch (chainId) {
      case ChainId.MAINNET:
        address = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
        break
    }
  }
  return useContract(address, ENS_ABI, withSignerIfPossible)
}

export function useENSResolverContract(address: string | undefined, withSignerIfPossible?: boolean): Contract | null {
  return useContract(address, ENS_PUBLIC_RESOLVER_ABI, withSignerIfPossible)
}

export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible)
}

export function usePairContract(pairAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(pairAddress, IUniswapV2PairABI, withSignerIfPossible)
}

export function useMulticallContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId && MULTICALL_NETWORKS[chainId], MULTICALL_ABI, false)
}

export function useMerkleDistributorContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? MERKLE_DISTRIBUTOR_ADDRESS[chainId] : undefined, MERKLE_DISTRIBUTOR_ABI, true)
}

export function useGovernanceContract(): Contract | null {
  return useContract(GOVERNANCE_ADDRESS, GOVERNANCE_ABI, true)
}

export function useUniContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? UNI[chainId].address : undefined, UNI_ABI, true)
}

export function useStakingContract(stakingAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(stakingAddress, STAKING_REWARDS_ABI, withSignerIfPossible)
}

export function useSocksController(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(
    chainId === ChainId.MAINNET ? '0x65770b5283117639760beA3F867b69b3697a91dd' : undefined,
    UNISOCKS_ABI,
    false
  )
}

// staking dao
export function useStakingHopeGombocContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId && STAKING_HOPE_GOMBOC_ADDRESS[chainId], STAKING_HOPE_GOMBOC_ABI.abi, true)
}

export function useLtMinterContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId && LT_MINTER_ADDRESS[chainId], LT_MINTER_ABI.abi, true)
}

export function usePermit2Contract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId && PERMIT2_ADDRESS[chainId ?? 1], PERMIT2_ABI.abi, true)
}

export function useGomConContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId && GOMBOC_CONTROLLER_ADDRESS[chainId ?? 1], GOMBOC_CONTROLLER_ABI.abi, true)
}

// portfolio
export function usePoolGomContract(address: string): Contract | null {
  return useContract(address, POOL_GOMBOC_ABI.abi, true)
}

export function useFeeDisContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId && FEE_DIS_ADDRESS[chainId ?? 1], FEE_DIS_ABI.abi, true)
}

export function useGomFeeDisContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId && GOM_FEE_DIS_ADDRESS[chainId ?? 1], GOM_FEE_DIS_ABI.abi, true)
}

// buy hope
export function useBuyHopeContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId && TOKEN_SALE_ADDRESS[chainId], TOKEN_SALE_ABI.abi, true)
}

// Locker
export function useLockerContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId && VELT_TOKEN_ADDRESS[chainId], VELT_TOKEN_ABI.abi, true)
}

export function useLTContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId && LT_TOKEN_ADDRESS[chainId], LT_TOKEN_ABI.abi, true)
}
