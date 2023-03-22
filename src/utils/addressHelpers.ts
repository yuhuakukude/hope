import { ChainId, Token } from '@uniswap/sdk';
import {
    USDC,
    USDT,
    HOPE,
    LT,
    VELT,
    ST_HOPE,
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
    TIMELOCK_ADDRESS
} from 'constants/constract';
import { Address, TokenMap } from 'model/types'
import { NETWORK_CHAIN_ID } from 'connectors'

export const getAddress = (address: Address, chainId?: number | undefined): string => {
    const _chainId = chainId ?? NETWORK_CHAIN_ID ?? ChainId.MAINNET
    return address[_chainId]
}
export const getToken = (toekenMap: TokenMap, chainId?: number | undefined): Token => {
    const _chainId = chainId ?? NETWORK_CHAIN_ID ?? ChainId.MAINNET
    return toekenMap[_chainId]
}

export const getUSDCToken = (chainId?: number): Token => {
    return getToken(USDC, chainId)
}

export const getUSDTToken = (chainId?: number): Token => {
    return getToken(USDT, chainId)
}

export const getHOPEToken = (chainId?: number): Token => {
    return getToken(HOPE, chainId)
}

export const getLTToken = (chainId?: number): Token => {
    return getToken(LT, chainId)
}

export const getVELTToken = (chainId?: number): Token => {
    return getToken(VELT, chainId)
}

export const getSTHOPEToken = (chainId?: number): Token => {
    return getToken(ST_HOPE, chainId)
}

export const getRouterAddress = (chainId?: number): string => {
    return getAddress(ROUTER_ADDRESS, chainId)
}

export const getPermit2Address = (chainId?: number): string => {
    return getAddress(PERMIT2_ADDRESS, chainId)
}

export const getGaugeControllerAddress = (chainId?: number): string => {
    return getAddress(GAUGE_CONTROLLER_ADDRESS, chainId)
}

export const getLtMinterAddress = (chainId?: number): string => {
    return getAddress(LT_MINTER_ADDRESS, chainId)
}

export const getTokenSaleAddress = (chainId?: number): string => {
    return getAddress(TOKEN_SALE_ADDRESS, chainId)
}

export const getPoolGaugeAddress = (chainId?: number): string => {
    return getAddress(POOL_GAUGE_ADDRESS, chainId)
}

export const getStakingHopeGaugeAddress = (chainId?: number): string => {
    return getAddress(STAKING_HOPE_GAUGE_ADDRESS, chainId)
}

export const getVELTTokenAddress = (chainId?: number): string => {
    return getAddress(VELT_TOKEN_ADDRESS, chainId)
}

export const getLTTokenAddress = (chainId?: number): string => {
    return getAddress(LT_TOKEN_ADDRESS, chainId)
}

export const getHopeTokenAddress = (chainId?: number): string => {
    return getAddress(HOPE_TOKEN_ADDRESS, chainId)
}

export const getFeeDisAddress = (chainId?: number): string => {
    return getAddress(FEE_DIS_ADDRESS, chainId)
}

export const getGomFeeDisAddress = (chainId?: number): string => {
    return getAddress(GOM_FEE_DIS_ADDRESS, chainId)
}

export const getGovernanceAddress = (chainId?: number): string => {
    return getAddress(GOVERNANCE_ADDRESS, chainId)
}

export const getTimeLockAddress = (chainId?: number): string => {
    return getAddress(TIMELOCK_ADDRESS, chainId)
}