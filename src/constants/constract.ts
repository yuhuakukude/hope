import { ChainId, Token } from '@uniswap/sdk'

export const ROUTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0xB26B2De65D07eBB5E54C7F6282424D3be670E1f0',
  [ChainId.SEPOLIA]: '0xB26B2De65D07eBB5E54C7F6282424D3be670E1f0',
  [ChainId.GOERLI]: '0x3E719F9743B246C0caa053eBeE60f2C4169D8259',
  [ChainId.HOPE]: '0xB26B2De65D07eBB5E54C7F6282424D3be670E1f0'
}

// staking buyhope dao about address
export const PERMIT2_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x914adC3D42F0Cc3eDb613d87b3F5B223B3f789Ae',
  [ChainId.SEPOLIA]: '0x914adC3D42F0Cc3eDb613d87b3F5B223B3f789Ae',
  [ChainId.GOERLI]: '0xcb4DD14E9b4899f582E7aD7826431e0411B2C59e',
  [ChainId.HOPE]: '0x914adC3D42F0Cc3eDb613d87b3F5B223B3f789Ae'
}
export const GAUGE_CONTROLLER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x89918517C74E7236B38f6fe6969b8262f31D1b73',
  [ChainId.SEPOLIA]: '0x89918517C74E7236B38f6fe6969b8262f31D1b73',
  [ChainId.GOERLI]: '0xb4fE4653F175C36e8EEab35229fdB5702789B9F2',
  [ChainId.HOPE]: '0x89918517C74E7236B38f6fe6969b8262f31D1b73'
}
export const LT_MINTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x9791ceb0F8483e9Bee77d2c40Eb477df1C377fCd',
  [ChainId.SEPOLIA]: '0x9791ceb0F8483e9Bee77d2c40Eb477df1C377fCd',
  [ChainId.GOERLI]: '0x3c2AB5E5D31872B920497bD787cFFAba9fB3615A',
  [ChainId.HOPE]: '0x9791ceb0F8483e9Bee77d2c40Eb477df1C377fCd'
}
export const POOL_GAUGE_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0xdc8B9BbF5Ba75AFD986256c26ADf96151917Eaa2',
  [ChainId.SEPOLIA]: '0xdc8B9BbF5Ba75AFD986256c26ADf96151917Eaa2',
  [ChainId.GOERLI]: '0xD619D504e66A52f735C36b55e68DE62d60923E1d',
  [ChainId.HOPE]: '0xdc8B9BbF5Ba75AFD986256c26ADf96151917Eaa2'
}
export const STAKING_HOPE_GAUGE_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x092c325a98e50BE78A140cD043D49904fFB8Ea1F',
  [ChainId.SEPOLIA]: '0x092c325a98e50BE78A140cD043D49904fFB8Ea1F',
  [ChainId.GOERLI]: '0x89009881287EB51256141265B2f250b9960AaeE5',
  [ChainId.HOPE]: '0x092c325a98e50BE78A140cD043D49904fFB8Ea1F'
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
  [ChainId.MAINNET]: '0x10E54A057Ab886b0162ac36369fdcfC6D48D8148',
  [ChainId.SEPOLIA]: '0x10E54A057Ab886b0162ac36369fdcfC6D48D8148',
  [ChainId.GOERLI]: '0x4BDB0F69f233C02bd82d5e5fBdF7e6F206E9FdE5',
  [ChainId.HOPE]: '0x10E54A057Ab886b0162ac36369fdcfC6D48D8148'
}
export const LT_TOKEN_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x0f760D4f644a99962A25Bb7bcF563CC07Bd51b5C',
  [ChainId.SEPOLIA]: '0x0f760D4f644a99962A25Bb7bcF563CC07Bd51b5C',
  [ChainId.GOERLI]: '0xeba0e37F77e2ddC6512d6982B5222297Eb3a37D4',
  [ChainId.HOPE]: '0x0f760D4f644a99962A25Bb7bcF563CC07Bd51b5C'
}
export const HOPE_TOKEN_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x784388A036cb9c8c680002F43354E856f816F844',
  [ChainId.SEPOLIA]: '0x784388A036cb9c8c680002F43354E856f816F844',
  [ChainId.GOERLI]: '0x9bA97e0913Dd0fbd4E5fedA936db9D1f1C632273',
  [ChainId.HOPE]: '0x784388A036cb9c8c680002F43354E856f816F844'
}

export const FEE_DIS_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0xE4869530Cb75eEB2e0a6BaF5251172674b251f52',
  [ChainId.SEPOLIA]: '0xE4869530Cb75eEB2e0a6BaF5251172674b251f52',
  [ChainId.GOERLI]: '0x01e4027a8D48dEb29C7251ecf5d622fb9fB684a8',
  [ChainId.HOPE]: '0xE4869530Cb75eEB2e0a6BaF5251172674b251f52'
}

export const GOM_FEE_DIS_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0xEa2Bb30D12aFf7e7E1BB22E79c73c0dA12776382',
  [ChainId.SEPOLIA]: '0xEa2Bb30D12aFf7e7E1BB22E79c73c0dA12776382',
  [ChainId.GOERLI]: '0xca988A19890Bb0F81C3d14877f95Ef33efB336d0',
  [ChainId.HOPE]: '0xEa2Bb30D12aFf7e7E1BB22E79c73c0dA12776382'
}

export const DAI_TOKEN_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x06DBf77E62Bdc9F5697ca6d696C1dC8B8923fdFf',
  [ChainId.SEPOLIA]: '0x06DBf77E62Bdc9F5697ca6d696C1dC8B8923fdFf',
  [ChainId.GOERLI]: '0x5B71dC777A8aDCba065A644e30BBEeB8fCca273f',
  [ChainId.HOPE]: '0x06DBf77E62Bdc9F5697ca6d696C1dC8B8923fdFf'
}

// FAUCET
export const FAUCET_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0xf61Fa39fb137710B4383e0F1268bb1b09c6A7E8D',
  [ChainId.SEPOLIA]: '0xf61Fa39fb137710B4383e0F1268bb1b09c6A7E8D',
  [ChainId.GOERLI]: '0xf61Fa39fb137710B4383e0F1268bb1b09c6A7E8D',
  [ChainId.HOPE]: '0xf61Fa39fb137710B4383e0F1268bb1b09c6A7E8D'
}

// del
export const TOKEN_SALE_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x4e7872EE63C4244344470179eaf3482aBa846682',
  [ChainId.SEPOLIA]: '0x4e7872EE63C4244344470179eaf3482aBa846682',
  [ChainId.GOERLI]: '0x4f6a13c36413003BB069477737903b6da3668ee7',
  [ChainId.HOPE]: '0x4e7872EE63C4244344470179eaf3482aBa846682'
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
