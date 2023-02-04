import { ChainId, JSBI, Percent, Token, WETH } from '@uniswap/sdk'
import { AbstractConnector } from '@web3-react/abstract-connector'

import { fortmatic, injected, portis, walletconnect, walletlink } from '../connectors'

export const ROUTER_ADDRESS = '0x83F5c784133cB7Cf9249aFa98310032Bff9d17fa'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export { PRELOADED_PROPOSALS } from './proposals'

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in ChainId]: Token[]
}

export const AMPL = new Token(ChainId.MAINNET, '0xD46bA6D942050d489DBd938a2C909A5d5039A161', 9, 'AMPL', 'Ampleforth')
export const DAI = new Token(ChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'Dai Stablecoin')
export const USDC = new Token(ChainId.SEPOLIA, '0x9Dab7bbE254Fcf610dc0DC9AbAC96b99b33b98e9', 18, 'USDC', 'USD//C')
export const USDT = new Token(ChainId.SEPOLIA, '0x5A115CF3F91792Ccb9440BFa3C713706d1aC8Bc1', 6, 'USDT', 'Tether USD')
export const WBTC = new Token(ChainId.MAINNET, '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 8, 'WBTC', 'Wrapped BTC')
export const FEI = new Token(ChainId.MAINNET, '0x956F47F50A910163D8BF957Cf5846D573E7f87CA', 18, 'FEI', 'Fei USD')
export const TRIBE = new Token(ChainId.MAINNET, '0xc7283b66Eb1EB5FB86327f08e1B5816b0720212B', 18, 'TRIBE', 'Tribe')
export const FRAX = new Token(ChainId.MAINNET, '0x853d955aCEf822Db058eb8505911ED77F175b99e', 18, 'FRAX', 'Frax')
export const FXS = new Token(ChainId.MAINNET, '0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0', 18, 'FXS', 'Frax Share')
export const renBTC = new Token(ChainId.MAINNET, '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D', 8, 'renBTC', 'renBTC')

// hope about token
export const LT: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, '0x6E34e3c7Be8B5B69efb23c5Dba071c977D652a4E', 18, 'LT', 'light'),
  [ChainId.SEPOLIA]: new Token(ChainId.SEPOLIA, '0x6E34e3c7Be8B5B69efb23c5Dba071c977D652a4E', 18, 'LT', 'light'),
  [ChainId.HOPE]: new Token(ChainId.HOPE, '0x6E34e3c7Be8B5B69efb23c5Dba071c977D652a4E', 18, 'LT', 'light')
}
export const VELT: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, '0x26cf9861BcF9aF3d86d715D51497a58D217cC442', 18, 'VELT', 've light'),
  [ChainId.SEPOLIA]: new Token(ChainId.SEPOLIA, '0x26cf9861BcF9aF3d86d715D51497a58D217cC442', 18, 'VELT', 've light'),
  [ChainId.HOPE]: new Token(ChainId.HOPE, '0x26cf9861BcF9aF3d86d715D51497a58D217cC442', 18, 'VELT', 've light')
}
export const HOPE: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, '0x4368FeB368A4a488F373d6cB7eb725f117c42EfD', 18, 'HOPE', 'hope'),
  [ChainId.SEPOLIA]: new Token(ChainId.SEPOLIA, '0x4368FeB368A4a488F373d6cB7eb725f117c42EfD', 18, 'HOPE', 'hope'),
  [ChainId.HOPE]: new Token(ChainId.HOPE, '0x4368FeB368A4a488F373d6cB7eb725f117c42EfD', 18, 'HOPE', 'hope')
}

export const ST_HOPE: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, '0xc9075E71e27B9161FAa76A353fEF2f68F0C13b3e', 18, 'stHOPE', 'stHOPE'),
  [ChainId.SEPOLIA]: new Token(ChainId.SEPOLIA, '0xc9075E71e27B9161FAa76A353fEF2f68F0C13b3e', 18, 'stHOPE', 'stHOPE'),
  [ChainId.HOPE]: new Token(ChainId.HOPE, '0xc9075E71e27B9161FAa76A353fEF2f68F0C13b3e', 18, 'stHOPE', 'stHOPE')
}

// staking buyhope dao about address
export const PERMIT2_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x0e83Cec2Ff3D14194A6b13459BA3Ce8F0C383399',
  [ChainId.SEPOLIA]: '0x0e83Cec2Ff3D14194A6b13459BA3Ce8F0C383399',
  [ChainId.HOPE]: '0x0e83Cec2Ff3D14194A6b13459BA3Ce8F0C383399'
}
export const GOMBOC_CONTROLLER_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.SEPOLIA]: '0xc9075E71e27B9161FAa76A353fEF2f68F0C13b3e'
}
export const LT_MINTER_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.SEPOLIA]: '0x29C8C1a65B7b6E80d528C8C4713293cE28ad4E97'
}
export const TOKEN_SALE_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.SEPOLIA]: '0x8179476B7869e691f1b705Cd63A9CfF36836989e'
}
export const POOL_GOMBOC_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.SEPOLIA]: '0x9CC52c53808c05E6037Be60136a524E9a6c898ea'
}
export const STAKING_HOPE_GOMBOC_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x74507aE3D35431Cc52bC99042d951d7107b8e621',
  [ChainId.SEPOLIA]: '0x74507aE3D35431Cc52bC99042d951d7107b8e621',
  [ChainId.HOPE]: '0x74507aE3D35431Cc52bC99042d951d7107b8e621'
}

// Block time here is slightly higher (~1s) than average in order to avoid ongoing proposals past the displayed time
export const AVERAGE_BLOCK_TIME_IN_SECS = 13
export const PROPOSAL_LENGTH_IN_BLOCKS = 40_320
export const PROPOSAL_LENGTH_IN_SECS = AVERAGE_BLOCK_TIME_IN_SECS * PROPOSAL_LENGTH_IN_BLOCKS

export const GOVERNANCE_ADDRESS = '0x5e4be8Bc9637f0EAA1A755019e06A68ce081D58F'

export const TIMELOCK_ADDRESS = '0x1a9C8182C09F50C8318d769245beA52c32BE35BC'

const UNI_ADDRESS = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
export const UNI: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, UNI_ADDRESS, 18, 'UNI', 'Uniswap'),
  [ChainId.SEPOLIA]: new Token(ChainId.SEPOLIA, UNI_ADDRESS, 18, 'UNI', 'Uniswap'),
  [ChainId.HOPE]: new Token(ChainId.HOPE, UNI_ADDRESS, 18, 'UNI', 'Uniswap')
}

export const COMMON_CONTRACT_NAMES: { [address: string]: string } = {
  [UNI_ADDRESS]: 'UNI',
  [GOVERNANCE_ADDRESS]: 'Governance',
  [TIMELOCK_ADDRESS]: 'Timelock'
}

// TODO: specify merkle distributor for mainnet
export const MERKLE_DISTRIBUTOR_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.MAINNET]: '0x090D4613473dEE047c3f2706764f49E0821D256e'
}

const WETH_ONLY: ChainTokenList = {
  [ChainId.MAINNET]: [WETH[ChainId.MAINNET]],
  [ChainId.SEPOLIA]: [WETH[ChainId.SEPOLIA]],
  [ChainId.HOPE]: [WETH[ChainId.HOPE]]
}

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MAINNET]: [...WETH_ONLY[ChainId.MAINNET], DAI, USDC, USDT, WBTC]
}

export const ADDITIONAL_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {
  [ChainId.MAINNET]: {
    '0xA948E86885e12Fb09AfEF8C52142EBDbDf73cD18': [new Token(ChainId.MAINNET, UNI_ADDRESS, 18, 'UNI', 'Uniswap')],
    '0x561a4717537ff4AF5c687328c0f7E90a319705C0': [new Token(ChainId.MAINNET, UNI_ADDRESS, 18, 'UNI', 'Uniswap')],
    [FEI.address]: [TRIBE],
    [TRIBE.address]: [FEI],
    [FRAX.address]: [FXS],
    [FXS.address]: [FRAX],
    [WBTC.address]: [renBTC],
    [renBTC.address]: [WBTC]
  }
}

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */
export const CUSTOM_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {
  [ChainId.MAINNET]: {
    [AMPL.address]: [DAI, WETH[ChainId.MAINNET]]
  }
}

// used for display in the default list when adding liquidity
export const SUGGESTED_BASES: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MAINNET]: [...WETH_ONLY[ChainId.MAINNET], DAI, USDC, USDT, WBTC]
}

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MAINNET]: [...WETH_ONLY[ChainId.MAINNET], DAI, USDC, USDT, WBTC]
}

export const PINNED_PAIRS: { readonly [chainId in ChainId]?: [Token, Token][] } = {
  [ChainId.MAINNET]: [
    [
      new Token(ChainId.MAINNET, '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643', 8, 'cDAI', 'Compound Dai'),
      new Token(ChainId.MAINNET, '0x39AA39c021dfbaE8faC545936693aC917d5E7563', 8, 'cUSDC', 'Compound USD Coin')
    ],
    [USDC, USDT],
    [DAI, USDT]
  ]
}

export interface WalletInfo {
  connector?: AbstractConnector
  name: string
  iconName: string
  description: string
  href: string | null
  color: string
  primary?: true
  mobile?: true
  mobileOnly?: true
}

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  INJECTED: {
    connector: injected,
    name: 'Injected',
    iconName: 'arrow-right.svg',
    description: 'Injected web3 provider.',
    href: null,
    color: '#010101',
    primary: true
  },
  METAMASK: {
    connector: injected,
    name: 'MetaMask',
    iconName: 'metamask.png',
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D'
  },
  WALLET_CONNECT: {
    connector: walletconnect,
    name: 'WalletConnect',
    iconName: 'walletConnectIcon.svg',
    description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
    href: null,
    color: '#4196FC',
    mobile: true
  },
  WALLET_LINK: {
    connector: walletlink,
    name: 'Coinbase Wallet',
    iconName: 'coinbaseWalletIcon.svg',
    description: 'Use Coinbase Wallet app on mobile device',
    href: null,
    color: '#315CF5'
  },
  COINBASE_LINK: {
    name: 'Open in Coinbase Wallet',
    iconName: 'coinbaseWalletIcon.svg',
    description: 'Open in Coinbase Wallet app.',
    href: 'https://go.cb-w.com/mtUDhEZPy1',
    color: '#315CF5',
    mobile: true,
    mobileOnly: true
  },
  FORTMATIC: {
    connector: fortmatic,
    name: 'Fortmatic',
    iconName: 'fortmaticIcon.png',
    description: 'Login using Fortmatic hosted wallet',
    href: null,
    color: '#6748FF',
    mobile: true
  },
  Portis: {
    connector: portis,
    name: 'Portis',
    iconName: 'portisIcon.png',
    description: 'Login using Portis hosted wallet',
    href: null,
    color: '#4A6C9B',
    mobile: true
  }
}

export const NetworkContextName = 'NETWORK'

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 50
// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20

// used for rewards deadlines
export const BIG_INT_SECONDS_IN_WEEK = JSBI.BigInt(60 * 60 * 24 * 7)

export const BIG_INT_ZERO = JSBI.BigInt(0)

// one basis point
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
export const BIPS_BASE = JSBI.BigInt(10000)
// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(300), BIPS_BASE) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE) // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(JSBI.BigInt(1000), BIPS_BASE) // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(1500), BIPS_BASE) // 15%

// used to ensure the user doesn't send so much ETH so they end up with <.01
export const MIN_ETH: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)) // .01 ETH
export const BETTER_TRADE_LESS_HOPS_THRESHOLD = new Percent(JSBI.BigInt(50), JSBI.BigInt(10000))

export const ZERO_PERCENT = new Percent('0')
export const ONE_HUNDRED_PERCENT = new Percent('1')

// SDN OFAC addresses
export const BLOCKED_ADDRESSES: string[] = [
  '0x7F367cC41522cE07553e823bf3be79A889DEbe1B',
  '0xd882cFc20F52f2599D84b8e8D58C7FB62cfE344b',
  '0x901bb9583b24D97e995513C6778dc6888AB6870e',
  '0xA7e5d5A720f06526557c513402f2e6B5fA20b008',
  '0x8576aCC5C05D6Ce88f4e49bf65BdF0C62F91353C'
]
