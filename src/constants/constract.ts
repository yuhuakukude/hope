import { ChainId, Token } from '@uniswap/sdk'

export const ROUTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x86950D519b14e226B00FB0eE6700f93a1b7113A0',
  [ChainId.SEPOLIA]: '0x86950D519b14e226B00FB0eE6700f93a1b7113A0',
  [ChainId.GOERLI]: '0x3E719F9743B246C0caa053eBeE60f2C4169D8259',
  [ChainId.HOPE]: '0x86950D519b14e226B00FB0eE6700f93a1b7113A0'
}

// staking buyhope dao about address
export const PERMIT2_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x706531ffd11Dc3B11bEE310bBBb8a0a2bCCd5e18',
  [ChainId.SEPOLIA]: '0x706531ffd11Dc3B11bEE310bBBb8a0a2bCCd5e18',
  [ChainId.GOERLI]: '0xcb4DD14E9b4899f582E7aD7826431e0411B2C59e',
  [ChainId.HOPE]: '0x706531ffd11Dc3B11bEE310bBBb8a0a2bCCd5e18'
}
export const GAUGE_CONTROLLER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x2A948A6EDdBeA5e846112186A9941FFA80f40d04',
  [ChainId.SEPOLIA]: '0x2A948A6EDdBeA5e846112186A9941FFA80f40d04',
  [ChainId.GOERLI]: '0xb4fE4653F175C36e8EEab35229fdB5702789B9F2',
  [ChainId.HOPE]: '0x2A948A6EDdBeA5e846112186A9941FFA80f40d04'
}
export const LT_MINTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x6e9A3F96D4ca3aA51aFFb88c3564451686d531Af',
  [ChainId.SEPOLIA]: '0x6e9A3F96D4ca3aA51aFFb88c3564451686d531Af',
  [ChainId.GOERLI]: '0x3c2AB5E5D31872B920497bD787cFFAba9fB3615A',
  [ChainId.HOPE]: '0x6e9A3F96D4ca3aA51aFFb88c3564451686d531Af'
}
export const TOKEN_SALE_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x331bf6DCDD5B21ed2D4bC570941aC1898A271405',
  [ChainId.SEPOLIA]: '0x331bf6DCDD5B21ed2D4bC570941aC1898A271405',
  [ChainId.GOERLI]: '0x4f6a13c36413003BB069477737903b6da3668ee7',
  [ChainId.HOPE]: '0x331bf6DCDD5B21ed2D4bC570941aC1898A271405'
}
export const POOL_GAUGE_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x3af926B2adb21aaA7d0B603336992229F82Cd66E',
  [ChainId.SEPOLIA]: '0x3af926B2adb21aaA7d0B603336992229F82Cd66E',
  [ChainId.GOERLI]: '0xD619D504e66A52f735C36b55e68DE62d60923E1d',
  [ChainId.HOPE]: '0x3af926B2adb21aaA7d0B603336992229F82Cd66E'
}
export const STAKING_HOPE_GAUGE_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0xE83A67878C0a7B4941fb032a56A709c132C2feB3',
  [ChainId.SEPOLIA]: '0xE83A67878C0a7B4941fb032a56A709c132C2feB3',
  [ChainId.GOERLI]: '0x89009881287EB51256141265B2f250b9960AaeE5',
  [ChainId.HOPE]: '0xE83A67878C0a7B4941fb032a56A709c132C2feB3'
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
  [ChainId.MAINNET]: '0x8e2801f8fAD29439EF313B56b265059cD36c7996',
  [ChainId.SEPOLIA]: '0x8e2801f8fAD29439EF313B56b265059cD36c7996',
  [ChainId.GOERLI]: '0x4BDB0F69f233C02bd82d5e5fBdF7e6F206E9FdE5',
  [ChainId.HOPE]: '0x8e2801f8fAD29439EF313B56b265059cD36c7996'
}
export const LT_TOKEN_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x6c041E1e79cdcBEB84A58689385D06c68c884C54',
  [ChainId.SEPOLIA]: '0x6c041E1e79cdcBEB84A58689385D06c68c884C54',
  [ChainId.GOERLI]: '0xeba0e37F77e2ddC6512d6982B5222297Eb3a37D4',
  [ChainId.HOPE]: '0x6c041E1e79cdcBEB84A58689385D06c68c884C54'
}
export const HOPE_TOKEN_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0xc262Ff6DFff1568B6689707F383245912Af6480a',
  [ChainId.SEPOLIA]: '0xc262Ff6DFff1568B6689707F383245912Af6480a',
  [ChainId.GOERLI]: '0x9bA97e0913Dd0fbd4E5fedA936db9D1f1C632273',
  [ChainId.HOPE]: '0xc262Ff6DFff1568B6689707F383245912Af6480a'
}

export const FEE_DIS_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x3bFe889C0bFE9236B362D3Bb5A357E0273C297c1',
  [ChainId.SEPOLIA]: '0x3bFe889C0bFE9236B362D3Bb5A357E0273C297c1',
  [ChainId.GOERLI]: '0x01e4027a8D48dEb29C7251ecf5d622fb9fB684a8',
  [ChainId.HOPE]: '0x3bFe889C0bFE9236B362D3Bb5A357E0273C297c1'
}

export const GOM_FEE_DIS_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x325CB1DB2b6B3fB4Bb2e28412cE62248a916E373',
  [ChainId.SEPOLIA]: '0x325CB1DB2b6B3fB4Bb2e28412cE62248a916E373',
  [ChainId.GOERLI]: '0xca988A19890Bb0F81C3d14877f95Ef33efB336d0',
  [ChainId.HOPE]: '0x325CB1DB2b6B3fB4Bb2e28412cE62248a916E373'
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

export const ETH_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0xb0Ac866E8951bC07efBF738580F7f17900cebE15',
  [ChainId.GOERLI]: '0xb0Ac866E8951bC07efBF738580F7f17900cebE15',
  [ChainId.SEPOLIA]: '0xb0Ac866E8951bC07efBF738580F7f17900cebE15',
  [ChainId.HOPE]: '0xb0Ac866E8951bC07efBF738580F7f17900cebE15'
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

export const ETH : { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, ETH_ADDRESS[ChainId.MAINNET], 18, 'ETH', 'Dai Stablecoin'),
  [ChainId.SEPOLIA]: new Token(ChainId.SEPOLIA, ETH_ADDRESS[ChainId.SEPOLIA], 18, 'ETH', 'Dai Stablecoin'),
  [ChainId.GOERLI]: new Token(ChainId.GOERLI, ETH_ADDRESS[ChainId.GOERLI], 18, 'ETH', 'Dai Stablecoin'),
  [ChainId.HOPE]: new Token(ChainId.HOPE, ETH_ADDRESS[ChainId.HOPE], 18, 'ETH', 'Dai Stablecoin')
}
