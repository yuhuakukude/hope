import { ChainId, Token } from '@uniswap/sdk'
import {
  USDC,
  USDT,
  HOPE,
  LT,
  VELT,
  ST_HOPE,
  DAI,
  ROUTER_ADDRESS,
  GOVERNANCE_ADDRESS,
  PERMIT2_ADDRESS,
  GAUGE_CONTROLLER_ADDRESS,
  POOL_GAUGE_ADDRESS,
  STAKING_HOPE_GAUGE_ADDRESS,
  LT_MINTER_ADDRESS,
  TOKEN_SALE_ADDRESS,
  VELT_TOKEN_ADDRESS,
  LT_TOKEN_ADDRESS,
  HOPE_TOKEN_ADDRESS,
  FEE_DIS_ADDRESS,
  GOM_FEE_DIS_ADDRESS,
  TIMELOCK_ADDRESS,
  FAUCET_ADDRESS
} from 'constants/constract'
import { Address, TokenMap } from 'model/types'
import { NETWORK_CHAIN_ID } from 'connectors'
import { WETH_ONLY } from '../constants'

const getDefaultChinId = (chainId?: ChainId) => {
  return chainId ?? NETWORK_CHAIN_ID ?? ChainId.MAINNET
}

export const getAddress = (address: Address, chainId?: ChainId | undefined): string => {
  return address[getDefaultChinId(chainId)]
}
export const getToken = (toekenMap: TokenMap, chainId?: ChainId | undefined): Token => {
  return toekenMap[getDefaultChinId(chainId)]
}

export const getUSDCToken = (chainId?: ChainId): Token => {
  return getToken(USDC, chainId)
}

export const getUSDTToken = (chainId?: ChainId): Token => {
  return getToken(USDT, chainId)
}

export const getHOPEToken = (chainId?: ChainId): Token => {
  return getToken(HOPE, chainId)
}

export const getLTToken = (chainId?: ChainId): Token => {
  return getToken(LT, chainId)
}

export const getVELTToken = (chainId?: ChainId): Token => {
  return getToken(VELT, chainId)
}

export const getSTHOPEToken = (chainId?: ChainId): Token => {
  return getToken(ST_HOPE, chainId)
}

export const getDAIToken = (chainId?: ChainId): Token => {
  return getToken(DAI, chainId)
}

export const getEthToken = (chainId?: ChainId) : Token => {
  return WETH_ONLY[getDefaultChinId(chainId) as ChainId][0]
}

export const getRouterAddress = (chainId?: ChainId): string => {
  return getAddress(ROUTER_ADDRESS, chainId)
}

export const getPermit2Address = (chainId?: ChainId): string => {
  return getAddress(PERMIT2_ADDRESS, chainId)
}

export const getGaugeControllerAddress = (chainId?: ChainId): string => {
  return getAddress(GAUGE_CONTROLLER_ADDRESS, chainId)
}

export const getLtMinterAddress = (chainId?: ChainId): string => {
  return getAddress(LT_MINTER_ADDRESS, chainId)
}

export const getTokenSaleAddress = (chainId?: ChainId): string => {
  return getAddress(TOKEN_SALE_ADDRESS, chainId)
}

export const getPoolGaugeAddress = (chainId?: ChainId): string => {
  return getAddress(POOL_GAUGE_ADDRESS, chainId)
}

export const getStakingHopeGaugeAddress = (chainId?: ChainId): string => {
  return getAddress(STAKING_HOPE_GAUGE_ADDRESS, chainId)
}

export const getVELTTokenAddress = (chainId?: ChainId): string => {
  return getAddress(VELT_TOKEN_ADDRESS, chainId)
}

export const getLTTokenAddress = (chainId?: ChainId): string => {
  return getAddress(LT_TOKEN_ADDRESS, chainId)
}

export const getHopeTokenAddress = (chainId?: ChainId): string => {
  return getAddress(HOPE_TOKEN_ADDRESS, chainId)
}

export const getFeeDisAddress = (chainId?: ChainId): string => {
  return getAddress(FEE_DIS_ADDRESS, chainId)
}

export const getGomFeeDisAddress = (chainId?: ChainId): string => {
  return getAddress(GOM_FEE_DIS_ADDRESS, chainId)
}

export const getFaucetAddress = (chainId?: ChainId): string => {
  return getAddress(FAUCET_ADDRESS, chainId)
}

export const getGovernanceAddress = (chainId?: ChainId): string => {
  return getAddress(GOVERNANCE_ADDRESS, chainId)
}

export const getTimeLockAddress = (chainId?: ChainId): string => {
  return getAddress(TIMELOCK_ADDRESS, chainId)
}
