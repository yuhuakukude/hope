import { ChainId, Token } from '@uniswap/sdk'

export const ROUTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0xc58842eF6C95c0f857230252c3393b90DE607444',
  [ChainId.SEPOLIA]: '0xc58842eF6C95c0f857230252c3393b90DE607444',
  [ChainId.GOERLI]: '0x3E719F9743B246C0caa053eBeE60f2C4169D8259',
  [ChainId.HOPE]: '0xc58842eF6C95c0f857230252c3393b90DE607444'
}

// staking buyhope dao about address
export const PERMIT2_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x92db770378e281D6dFDd4c6D3019069D53Fe2ec1',
  [ChainId.SEPOLIA]: '0x92db770378e281D6dFDd4c6D3019069D53Fe2ec1',
  [ChainId.GOERLI]: '0xcb4DD14E9b4899f582E7aD7826431e0411B2C59e',
  [ChainId.HOPE]: '0x92db770378e281D6dFDd4c6D3019069D53Fe2ec1'
}
export const GAUGE_CONTROLLER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x9ef405ddD93C1f0d0830eB67B9361B43Ead2bc11',
  [ChainId.SEPOLIA]: '0x9ef405ddD93C1f0d0830eB67B9361B43Ead2bc11',
  [ChainId.GOERLI]: '0xb4fE4653F175C36e8EEab35229fdB5702789B9F2',
  [ChainId.HOPE]: '0x9ef405ddD93C1f0d0830eB67B9361B43Ead2bc11'
}
export const LT_MINTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0xb663e6a2a693ddBe5a726E18cCdFCDD47f83dA92',
  [ChainId.SEPOLIA]: '0xb663e6a2a693ddBe5a726E18cCdFCDD47f83dA92',
  [ChainId.GOERLI]: '0x3c2AB5E5D31872B920497bD787cFFAba9fB3615A',
  [ChainId.HOPE]: '0xb663e6a2a693ddBe5a726E18cCdFCDD47f83dA92'
}
export const TOKEN_SALE_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x4e7872EE63C4244344470179eaf3482aBa846682',
  [ChainId.SEPOLIA]: '0x4e7872EE63C4244344470179eaf3482aBa846682',
  [ChainId.GOERLI]: '0x4f6a13c36413003BB069477737903b6da3668ee7',
  [ChainId.HOPE]: '0x4e7872EE63C4244344470179eaf3482aBa846682'
}
export const POOL_GAUGE_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x5f730B15A6a2D8cE8fB6c42F668B4089af76dDc3',
  [ChainId.SEPOLIA]: '0x5f730B15A6a2D8cE8fB6c42F668B4089af76dDc3',
  [ChainId.GOERLI]: '0xD619D504e66A52f735C36b55e68DE62d60923E1d',
  [ChainId.HOPE]: '0x5f730B15A6a2D8cE8fB6c42F668B4089af76dDc3'
}
export const STAKING_HOPE_GAUGE_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x48890964Da15325b07EA0155bB48f388eae705C4',
  [ChainId.SEPOLIA]: '0x48890964Da15325b07EA0155bB48f388eae705C4',
  [ChainId.GOERLI]: '0x89009881287EB51256141265B2f250b9960AaeE5',
  [ChainId.HOPE]: '0x48890964Da15325b07EA0155bB48f388eae705C4'
}
export const USDC_TOKEN_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0xf9B7E9bb840b7BBf7E0C42724f11121D4D1eFC22',
  [ChainId.SEPOLIA]: '0xf9B7E9bb840b7BBf7E0C42724f11121D4D1eFC22',
  [ChainId.GOERLI]: '0x235eBFC0bE0E58cF267D1c5BCb8c03a002A711ed',
  [ChainId.HOPE]: '0xf9B7E9bb840b7BBf7E0C42724f11121D4D1eFC22'
}
export const USDT_TOKEN_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0xB2448D911BC792c463AF9ED8cf558a85D97c5Bf1',
  [ChainId.SEPOLIA]: '0xB2448D911BC792c463AF9ED8cf558a85D97c5Bf1',
  [ChainId.GOERLI]: '0x3da37B4A2F5172580411DdcddDCcae857f9a7aE6',
  [ChainId.HOPE]: '0xB2448D911BC792c463AF9ED8cf558a85D97c5Bf1'
}
export const VELT_TOKEN_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0xce4B43C0fF48fbd7097456584E740b819E2029AB',
  [ChainId.SEPOLIA]: '0xce4B43C0fF48fbd7097456584E740b819E2029AB',
  [ChainId.GOERLI]: '0x4BDB0F69f233C02bd82d5e5fBdF7e6F206E9FdE5',
  [ChainId.HOPE]: '0xce4B43C0fF48fbd7097456584E740b819E2029AB'
}
export const LT_TOKEN_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x6A2E30E63Af5691F79512747C3Eb5b1FB396e1aA',
  [ChainId.SEPOLIA]: '0x6A2E30E63Af5691F79512747C3Eb5b1FB396e1aA',
  [ChainId.GOERLI]: '0xeba0e37F77e2ddC6512d6982B5222297Eb3a37D4',
  [ChainId.HOPE]: '0x6A2E30E63Af5691F79512747C3Eb5b1FB396e1aA'
}
export const HOPE_TOKEN_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x2C4455672977E706455930ca9f3C242ae17ec0D8',
  [ChainId.SEPOLIA]: '0x2C4455672977E706455930ca9f3C242ae17ec0D8',
  [ChainId.GOERLI]: '0x9bA97e0913Dd0fbd4E5fedA936db9D1f1C632273',
  [ChainId.HOPE]: '0x2C4455672977E706455930ca9f3C242ae17ec0D8'
}

export const FEE_DIS_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x7dbFF3bD07BB7441386647770EDa9Fc6c7f684d8',
  [ChainId.SEPOLIA]: '0x7dbFF3bD07BB7441386647770EDa9Fc6c7f684d8',
  [ChainId.GOERLI]: '0x01e4027a8D48dEb29C7251ecf5d622fb9fB684a8',
  [ChainId.HOPE]: '0x7dbFF3bD07BB7441386647770EDa9Fc6c7f684d8'
}

export const GOM_FEE_DIS_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0xF95a76C90be6C6ac8Ace555E73E2D537B080f6bc',
  [ChainId.SEPOLIA]: '0xF95a76C90be6C6ac8Ace555E73E2D537B080f6bc',
  [ChainId.GOERLI]: '0xca988A19890Bb0F81C3d14877f95Ef33efB336d0',
  [ChainId.HOPE]: '0xF95a76C90be6C6ac8Ace555E73E2D537B080f6bc'
}

export const FAUCET_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0xf61Fa39fb137710B4383e0F1268bb1b09c6A7E8D',
  [ChainId.SEPOLIA]: '0xf61Fa39fb137710B4383e0F1268bb1b09c6A7E8D',
  [ChainId.GOERLI]: '0xf61Fa39fb137710B4383e0F1268bb1b09c6A7E8D',
  [ChainId.HOPE]: '0xf61Fa39fb137710B4383e0F1268bb1b09c6A7E8D'
}

export const DAI_TOKEN_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x06DBf77E62Bdc9F5697ca6d696C1dC8B8923fdFf',
  [ChainId.SEPOLIA]: '0x06DBf77E62Bdc9F5697ca6d696C1dC8B8923fdFf',
  [ChainId.GOERLI]: '0x5B71dC777A8aDCba065A644e30BBEeB8fCca273f',
  [ChainId.HOPE]: '0x06DBf77E62Bdc9F5697ca6d696C1dC8B8923fdFf'
}

export const GOVERNANCE_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x5e4be8Bc9637f0EAA1A755019e06A68ce081D58F',
  [ChainId.GOERLI]: '0x5e4be8Bc9637f0EAA1A755019e06A68ce081D58F',
  [ChainId.SEPOLIA]: '0x5e4be8Bc9637f0EAA1A755019e06A68ce081D58F',
  [ChainId.HOPE]: '0x5e4be8Bc9637f0EAA1A755019e06A68ce081D58F'
}

export const TIMELOCK_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x1a9C8182C09F50C8318d769245beA52c32BE35BC',
  [ChainId.GOERLI]: '0x1a9C8182C09F50C8318d769245beA52c32BE35BC',
  [ChainId.SEPOLIA]: '0x1a9C8182C09F50C8318d769245beA52c32BE35BC',
  [ChainId.HOPE]: '0x1a9C8182C09F50C8318d769245beA52c32BE35BC'
}

// hope about token
export const USDC: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, USDC_TOKEN_ADDRESS[ChainId.MAINNET], 18, 'USDC', 'USD//C'),
  [ChainId.SEPOLIA]: new Token(ChainId.SEPOLIA, USDC_TOKEN_ADDRESS[ChainId.SEPOLIA], 18, 'USDC', 'USD//C'),
  [ChainId.GOERLI]: new Token(ChainId.GOERLI, USDC_TOKEN_ADDRESS[ChainId.GOERLI], 18, 'USDC', 'USD//C'),
  [ChainId.HOPE]: new Token(ChainId.HOPE, USDC_TOKEN_ADDRESS[ChainId.HOPE], 18, 'USDC', 'USD//C')
}

export const USDT: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, USDT_TOKEN_ADDRESS[ChainId.MAINNET], 6, 'USDT', 'Tether USD'),
  [ChainId.SEPOLIA]: new Token(ChainId.SEPOLIA, USDT_TOKEN_ADDRESS[ChainId.SEPOLIA], 6, 'USDT', 'Tether USD'),
  [ChainId.GOERLI]: new Token(ChainId.GOERLI, USDT_TOKEN_ADDRESS[ChainId.GOERLI], 6, 'USDT', 'Tether USD'),
  [ChainId.HOPE]: new Token(ChainId.HOPE, USDT_TOKEN_ADDRESS[ChainId.HOPE], 6, 'USDT', 'Tether USD')
}

export const LT: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, LT_TOKEN_ADDRESS[ChainId.MAINNET], 18, 'LT', 'light'),
  [ChainId.SEPOLIA]: new Token(ChainId.SEPOLIA, LT_TOKEN_ADDRESS[ChainId.SEPOLIA], 18, 'LT', 'light'),
  [ChainId.GOERLI]: new Token(ChainId.GOERLI, LT_TOKEN_ADDRESS[ChainId.GOERLI], 18, 'LT', 'light'),
  [ChainId.HOPE]: new Token(ChainId.HOPE, LT_TOKEN_ADDRESS[ChainId.HOPE], 18, 'LT', 'light')
}
export const VELT: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, VELT_TOKEN_ADDRESS[ChainId.MAINNET], 18, 'veLT', 've light'),
  [ChainId.SEPOLIA]: new Token(ChainId.SEPOLIA, VELT_TOKEN_ADDRESS[ChainId.SEPOLIA], 18, 'veLT', 've light'),
  [ChainId.GOERLI]: new Token(ChainId.GOERLI, VELT_TOKEN_ADDRESS[ChainId.GOERLI], 18, 'veLT', 've light'),
  [ChainId.HOPE]: new Token(ChainId.HOPE, VELT_TOKEN_ADDRESS[ChainId.HOPE], 18, 'veLT', 've light')
}
export const HOPE: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, HOPE_TOKEN_ADDRESS[ChainId.MAINNET], 18, 'HOPE', 'hope'),
  [ChainId.SEPOLIA]: new Token(ChainId.SEPOLIA, HOPE_TOKEN_ADDRESS[ChainId.SEPOLIA], 18, 'HOPE', 'hope'),
  [ChainId.GOERLI]: new Token(ChainId.GOERLI, HOPE_TOKEN_ADDRESS[ChainId.GOERLI], 18, 'HOPE', 'hope'),
  [ChainId.HOPE]: new Token(ChainId.HOPE, HOPE_TOKEN_ADDRESS[ChainId.HOPE], 18, 'HOPE', 'hope')
}

export const ST_HOPE: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, STAKING_HOPE_GAUGE_ADDRESS[ChainId.MAINNET], 18, 'stHOPE', 'stHOPE'),
  [ChainId.SEPOLIA]: new Token(ChainId.SEPOLIA, STAKING_HOPE_GAUGE_ADDRESS[ChainId.SEPOLIA], 18, 'stHOPE', 'stHOPE'),
  [ChainId.GOERLI]: new Token(ChainId.GOERLI, STAKING_HOPE_GAUGE_ADDRESS[ChainId.GOERLI], 18, 'stHOPE', 'stHOPE'),
  [ChainId.HOPE]: new Token(ChainId.HOPE, STAKING_HOPE_GAUGE_ADDRESS[ChainId.HOPE], 18, 'stHOPE', 'stHOPE')
}

export const DAI: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, DAI_TOKEN_ADDRESS[ChainId.MAINNET], 18, 'DAI', 'Dai Stablecoin'),
  [ChainId.SEPOLIA]: new Token(ChainId.SEPOLIA, DAI_TOKEN_ADDRESS[ChainId.SEPOLIA], 18, 'DAI', 'Dai Stablecoin'),
  [ChainId.GOERLI]: new Token(ChainId.GOERLI, DAI_TOKEN_ADDRESS[ChainId.GOERLI], 18, 'DAI', 'Dai Stablecoin'),
  [ChainId.HOPE]: new Token(ChainId.HOPE, DAI_TOKEN_ADDRESS[ChainId.HOPE], 18, 'DAI', 'Dai Stablecoin')
}
