import { ChainId, JSBI, Percent, Token, WETH } from '@uniswap/sdk'
import { AbstractConnector } from '@web3-react/abstract-connector'

import { injected, walletconnect } from '../connectors'

export const SUBGRAPH = 'https://thegraph-sepolia.hivefin.net/subgraphs/name/light-dev/light-subgraph'
export const DOC_API = 'https://hope-static-test1.hivefin.net'
export const HOME_API = 'https://hope.money'
export const FAUCET_URL = 'https://faucet-sepolia.lteco.cc/'
export const BLOCK_SUBGRAPH = 'https://hope-dapp-dev1.hivefin.net/subgraphs/name/light-dev/ethereum-blocks'

export const timeframeOptions = {
  WEEK: '1 week',
  MONTH: '1 month',
  // THREE_MONTHS: '3 months',
  // YEAR: '1 year',
  HALF_YEAR: '6 months',
  ALL_TIME: 'All time'
}

export const ROUTER_ADDRESS = '0x86950D519b14e226B00FB0eE6700f93a1b7113A0'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export { PRELOADED_PROPOSALS } from './proposals'

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in ChainId]: Token[]
}

export const REWARD_CONTRACT: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '',
  [ChainId.SEPOLIA]: '',
  [ChainId.GOERLI]: '',
  [ChainId.HOPE]: ''
}

export const AMPL = new Token(ChainId.MAINNET, '0xD46bA6D942050d489DBd938a2C909A5d5039A161', 9, 'AMPL', 'Ampleforth')
export const DAI = new Token(ChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'Dai Stablecoin')
// export const USDC = new Token(ChainId.SEPOLIA, '0xf9B7E9bb840b7BBf7E0C42724f11121D4D1eFC22', 18, 'USDC', 'USD//C')
// export const USDT = new Token(ChainId.SEPOLIA, '0xB2448D911BC792c463AF9ED8cf558a85D97c5Bf1', 6, 'USDT', 'Tether USD')
export const WBTC = new Token(ChainId.MAINNET, '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 8, 'WBTC', 'Wrapped BTC')
export const FEI = new Token(ChainId.MAINNET, '0x956F47F50A910163D8BF957Cf5846D573E7f87CA', 18, 'FEI', 'Fei USD')
export const TRIBE = new Token(ChainId.MAINNET, '0xc7283b66Eb1EB5FB86327f08e1B5816b0720212B', 18, 'TRIBE', 'Tribe')
export const FRAX = new Token(ChainId.MAINNET, '0x853d955aCEf822Db058eb8505911ED77F175b99e', 18, 'FRAX', 'Frax')
export const FXS = new Token(ChainId.MAINNET, '0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0', 18, 'FXS', 'Frax Share')
export const renBTC = new Token(ChainId.MAINNET, '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D', 8, 'renBTC', 'renBTC')

// hope about token
export const USDC: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, '0xf9B7E9bb840b7BBf7E0C42724f11121D4D1eFC22', 18, 'USDC', 'USD//C'),
  [ChainId.SEPOLIA]: new Token(ChainId.SEPOLIA, '0xf9B7E9bb840b7BBf7E0C42724f11121D4D1eFC22', 18, 'USDC', 'USD//C'),
  [ChainId.GOERLI]: new Token(ChainId.GOERLI, '0xf9B7E9bb840b7BBf7E0C42724f11121D4D1eFC22', 18, 'USDC', 'USD//C'),
  [ChainId.HOPE]: new Token(ChainId.HOPE, '0xf9B7E9bb840b7BBf7E0C42724f11121D4D1eFC22', 18, 'USDC', 'USD//C')
}

export const USDT: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, '0xB2448D911BC792c463AF9ED8cf558a85D97c5Bf1', 6, 'USDT', 'Tether USD'),
  [ChainId.SEPOLIA]: new Token(ChainId.SEPOLIA, '0xB2448D911BC792c463AF9ED8cf558a85D97c5Bf1', 6, 'USDT', 'Tether USD'),
  [ChainId.GOERLI]: new Token(ChainId.GOERLI, '0xB2448D911BC792c463AF9ED8cf558a85D97c5Bf1', 6, 'USDT', 'Tether USD'),
  [ChainId.HOPE]: new Token(ChainId.HOPE, '0xB2448D911BC792c463AF9ED8cf558a85D97c5Bf1', 6, 'USDT', 'Tether USD')
}

export const LT: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, '0x6c041E1e79cdcBEB84A58689385D06c68c884C54', 18, 'LT', 'light'),
  [ChainId.SEPOLIA]: new Token(ChainId.SEPOLIA, '0x6c041E1e79cdcBEB84A58689385D06c68c884C54', 18, 'LT', 'light'),
  [ChainId.GOERLI]: new Token(ChainId.GOERLI, '0x6c041E1e79cdcBEB84A58689385D06c68c884C54', 18, 'LT', 'light'),
  [ChainId.HOPE]: new Token(ChainId.HOPE, '0x6c041E1e79cdcBEB84A58689385D06c68c884C54', 18, 'LT', 'light')
}
export const VELT: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, '0x8e2801f8fAD29439EF313B56b265059cD36c7996', 18, 'veLT', 've light'),
  [ChainId.SEPOLIA]: new Token(ChainId.SEPOLIA, '0x8e2801f8fAD29439EF313B56b265059cD36c7996', 18, 'veLT', 've light'),
  [ChainId.GOERLI]: new Token(ChainId.GOERLI, '0x8e2801f8fAD29439EF313B56b265059cD36c7996', 18, 'veLT', 've light'),
  [ChainId.HOPE]: new Token(ChainId.HOPE, '0x8e2801f8fAD29439EF313B56b265059cD36c7996', 18, 'veLT', 've light')
}
export const HOPE: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, '0xc262Ff6DFff1568B6689707F383245912Af6480a', 18, 'HOPE', 'hope'),
  [ChainId.SEPOLIA]: new Token(ChainId.SEPOLIA, '0xc262Ff6DFff1568B6689707F383245912Af6480a', 18, 'HOPE', 'hope'),
  [ChainId.GOERLI]: new Token(ChainId.GOERLI, '0xc262Ff6DFff1568B6689707F383245912Af6480a', 18, 'HOPE', 'hope'),
  [ChainId.HOPE]: new Token(ChainId.HOPE, '0xc262Ff6DFff1568B6689707F383245912Af6480a', 18, 'HOPE', 'hope')
}

export const ST_HOPE: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, '0xE83A67878C0a7B4941fb032a56A709c132C2feB3', 18, 'stHOPE', 'stHOPE'),
  [ChainId.SEPOLIA]: new Token(ChainId.SEPOLIA, '0xE83A67878C0a7B4941fb032a56A709c132C2feB3', 18, 'stHOPE', 'stHOPE'),
  [ChainId.GOERLI]: new Token(ChainId.GOERLI, '0xE83A67878C0a7B4941fb032a56A709c132C2feB3', 18, 'stHOPE', 'stHOPE'),
  [ChainId.HOPE]: new Token(ChainId.HOPE, '0xE83A67878C0a7B4941fb032a56A709c132C2feB3', 18, 'stHOPE', 'stHOPE')
}

// staking buyhope dao about address
export const PERMIT2_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x706531ffd11Dc3B11bEE310bBBb8a0a2bCCd5e18',
  [ChainId.SEPOLIA]: '0x706531ffd11Dc3B11bEE310bBBb8a0a2bCCd5e18',
  [ChainId.GOERLI]: '0x706531ffd11Dc3B11bEE310bBBb8a0a2bCCd5e18',
  [ChainId.HOPE]: '0x706531ffd11Dc3B11bEE310bBBb8a0a2bCCd5e18'
}
export const GAUGE_CONTROLLER_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.MAINNET]: '0x2A948A6EDdBeA5e846112186A9941FFA80f40d04',
  [ChainId.SEPOLIA]: '0x2A948A6EDdBeA5e846112186A9941FFA80f40d04',
  [ChainId.GOERLI]: '0x2A948A6EDdBeA5e846112186A9941FFA80f40d04',
  [ChainId.HOPE]: '0x2A948A6EDdBeA5e846112186A9941FFA80f40d04'
}
export const LT_MINTER_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.MAINNET]: '0x6e9A3F96D4ca3aA51aFFb88c3564451686d531Af',
  [ChainId.SEPOLIA]: '0x6e9A3F96D4ca3aA51aFFb88c3564451686d531Af',
  [ChainId.GOERLI]: '0x6e9A3F96D4ca3aA51aFFb88c3564451686d531Af',
  [ChainId.HOPE]: '0x6e9A3F96D4ca3aA51aFFb88c3564451686d531Af'
}
export const TOKEN_SALE_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.MAINNET]: '0x331bf6DCDD5B21ed2D4bC570941aC1898A271405',
  [ChainId.SEPOLIA]: '0x331bf6DCDD5B21ed2D4bC570941aC1898A271405',
  [ChainId.GOERLI]: '0x331bf6DCDD5B21ed2D4bC570941aC1898A271405',
  [ChainId.HOPE]: '0x331bf6DCDD5B21ed2D4bC570941aC1898A271405'
}
export const POOL_GAUGE_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.MAINNET]: '0x3af926B2adb21aaA7d0B603336992229F82Cd66E',
  [ChainId.SEPOLIA]: '0x3af926B2adb21aaA7d0B603336992229F82Cd66E',
  [ChainId.GOERLI]: '0x3af926B2adb21aaA7d0B603336992229F82Cd66E',
  [ChainId.HOPE]: '0x3af926B2adb21aaA7d0B603336992229F82Cd66E'
}
export const STAKING_HOPE_GAUGE_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0xE83A67878C0a7B4941fb032a56A709c132C2feB3',
  [ChainId.SEPOLIA]: '0xE83A67878C0a7B4941fb032a56A709c132C2feB3',
  [ChainId.GOERLI]: '0xE83A67878C0a7B4941fb032a56A709c132C2feB3',
  [ChainId.HOPE]: '0xE83A67878C0a7B4941fb032a56A709c132C2feB3'
}
export const VELT_TOKEN_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.MAINNET]: '0x8e2801f8fAD29439EF313B56b265059cD36c7996',
  [ChainId.SEPOLIA]: '0x8e2801f8fAD29439EF313B56b265059cD36c7996',
  [ChainId.GOERLI]: '0x8e2801f8fAD29439EF313B56b265059cD36c7996',
  [ChainId.HOPE]: '0x8e2801f8fAD29439EF313B56b265059cD36c7996'
}
export const LT_TOKEN_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.MAINNET]: '0x6c041E1e79cdcBEB84A58689385D06c68c884C54',
  [ChainId.SEPOLIA]: '0x6c041E1e79cdcBEB84A58689385D06c68c884C54',
  [ChainId.GOERLI]: '0x6c041E1e79cdcBEB84A58689385D06c68c884C54',
  [ChainId.HOPE]: '0x6c041E1e79cdcBEB84A58689385D06c68c884C54'
}
export const HOPE_TOKEN_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.MAINNET]: '0xc262Ff6DFff1568B6689707F383245912Af6480a',
  [ChainId.SEPOLIA]: '0xc262Ff6DFff1568B6689707F383245912Af6480a',
  [ChainId.GOERLI]: '0xc262Ff6DFff1568B6689707F383245912Af6480a',
  [ChainId.HOPE]: '0xc262Ff6DFff1568B6689707F383245912Af6480a'
}

export const FEE_DIS_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.MAINNET]: '0x3bFe889C0bFE9236B362D3Bb5A357E0273C297c1',
  [ChainId.SEPOLIA]: '0x3bFe889C0bFE9236B362D3Bb5A357E0273C297c1',
  [ChainId.GOERLI]: '0x3bFe889C0bFE9236B362D3Bb5A357E0273C297c1',
  [ChainId.HOPE]: '0x3bFe889C0bFE9236B362D3Bb5A357E0273C297c1'
}

export const GOM_FEE_DIS_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.MAINNET]: '0x325CB1DB2b6B3fB4Bb2e28412cE62248a916E373',
  [ChainId.SEPOLIA]: '0x325CB1DB2b6B3fB4Bb2e28412cE62248a916E373',
  [ChainId.GOERLI]: '0x325CB1DB2b6B3fB4Bb2e28412cE62248a916E373',
  [ChainId.HOPE]: '0x325CB1DB2b6B3fB4Bb2e28412cE62248a916E373'
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
  [ChainId.GOERLI]: new Token(ChainId.SEPOLIA, UNI_ADDRESS, 18, 'UNI', 'Uniswap'),
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
  [ChainId.GOERLI]: [WETH[ChainId.GOERLI]],
  [ChainId.HOPE]: [WETH[ChainId.HOPE]]
}

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MAINNET]: [
    ...WETH_ONLY[ChainId.MAINNET],
    USDC[ChainId.MAINNET],
    USDT[ChainId.MAINNET],
    HOPE[ChainId.MAINNET]
  ],
  [ChainId.SEPOLIA]: [
    ...WETH_ONLY[ChainId.SEPOLIA],
    USDC[ChainId.SEPOLIA],
    USDT[ChainId.SEPOLIA],
    HOPE[ChainId.SEPOLIA]
  ]
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
  [ChainId.MAINNET]: [...WETH_ONLY[ChainId.MAINNET], DAI, USDC[ChainId.MAINNET], USDT[ChainId.MAINNET], WBTC]
}

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MAINNET]: [...WETH_ONLY[ChainId.MAINNET], DAI, USDC[ChainId.MAINNET], USDT[ChainId.MAINNET], WBTC]
}

export const PINNED_PAIRS: { readonly [chainId in ChainId]?: [Token, Token][] } = {
  [ChainId.MAINNET]: [
    [
      new Token(ChainId.MAINNET, '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643', 8, 'cDAI', 'Compound Dai'),
      new Token(ChainId.MAINNET, '0x39AA39c021dfbaE8faC545936693aC917d5E7563', 8, 'cUSDC', 'Compound USD Coin')
    ],
    [USDC[ChainId.MAINNET], USDT[ChainId.MAINNET]],
    [DAI, USDT[ChainId.MAINNET]]
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

export const SUPPORTED_NETWORKS: {
  [chainId in ChainId]?: {
    chainId: string
    chainName: string
    nativeCurrency: {
      name: string
      symbol: string
      decimals: number
    }
    rpcUrls: string[]
    blockExplorerUrls: string[]
  }
} = {
  [ChainId.MAINNET]: {
    chainId: '0x1',
    chainName: 'Ethereum',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://sepolia.infura.io/v3/f338fa7411a945db8bed616683b2ade5'],
    blockExplorerUrls: ['https://sepolia.etherscan.io']
  },
  [ChainId.SEPOLIA]: {
    chainId: '0xaa36a7',
    chainName: 'Sepolia',
    nativeCurrency: {
      name: 'Sepolia',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://sepolia.infura.io/v3/f338fa7411a945db8bed616683b2ade5'],
    blockExplorerUrls: ['https://sepolia.etherscan.io']
  }
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
  }
  // WALLET_LINK: {
  //   connector: walletlink,
  //   name: 'Coinbase Wallet',
  //   iconName: 'coinbaseWalletIcon.svg',
  //   description: 'Use Coinbase Wallet app on mobile device',
  //   href: null,
  //   color: '#315CF5'
  // },
  // COINBASE_LINK: {
  //   name: 'Open in Coinbase Wallet',
  //   iconName: 'coinbaseWalletIcon.svg',
  //   description: 'Open in Coinbase Wallet app.',
  //   href: 'https://go.cb-w.com/mtUDhEZPy1',
  //   color: '#315CF5',
  //   mobile: true,
  //   mobileOnly: true
  // },
  // FORTMATIC: {
  //   connector: fortmatic,
  //   name: 'Fortmatic',
  //   iconName: 'fortmaticIcon.png',
  //   description: 'Login using Fortmatic hosted wallet',
  //   href: null,
  //   color: '#6748FF',
  //   mobile: true
  // },
  // Portis: {
  //   connector: portis,
  //   name: 'Portis',
  //   iconName: 'portisIcon.png',
  //   description: 'Login using Portis hosted wallet',
  //   href: null,
  //   color: '#4A6C9B',
  //   mobile: true
  // }
}

export const NetworkContextName = 'NETWORK'

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 50
// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 30

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

export enum ACTION_TYPE {
  APPROVE,
  SWAP
}

export const BUY_HOPE_GAS = 179618

export const HOPE_STAKING = 374135

export const HOPE_UNSTAKING = 285071
