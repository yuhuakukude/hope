import { get } from '../utils/http'

export interface PortfolioReward {
  name: string
  gomboc: string
  apr: string | number
  boost: string
  maxBoost: string
  staked: string | number
  usdOfStaked: string | number
  stakeable: string | number
  usdOfStakeable: string | number
  stakeSymbol: string
  ltTotalReward: string | number
  usdOfReward: string | number
  rewardSymbol: string
  extRewardList: any
  lpToken: string
  usdOfTotalReward: string | number
}
export interface PortfolioInfo {
  hope: string | number
  usdOfHope: string | number
  stHope: string | number
  hopeOfStHope: string | number
  hopeOfPool: string | number
  hopeOfFarming: string | number
  hopeOfGovern: string | number
  hopeOfLt: string | number
  totalHope: string | number
  usdOfTotalHope: string | number
  rewards: PortfolioReward[]
}

export interface DetailInfo {
  belongsToMe: string
  belongsToVeLT: string
  withdrawable: string
}

export enum POOL_TYPE {
  HOPE,
  SWAP
}
export interface Gomboc {
  id: string
  networkId: number
  gombocType: number
  poolType: POOL_TYPE
  gombocTypeName: string
  gombocAddress: string
  gombocName: string
  ItTokenAddress: string
  ItTokenSymbol: string
  ItTokenName: string
  IpTokenAddress: string
  IpTokenSymbol: string
  IpTokenName: string
  composition: string
  IpTokenDecimal: string | number
  enable: boolean
  createAt: string
  updateAt: string
}
export interface Item {
  gomboc: Gomboc
  totalFees: number
  withdrawable: number
}

interface Params {
  startTimestamp: number
  endTimestamp: number
  userAddress: any
}

export interface ILiquidityPools {
  name: string
  gomboc: string
  pair: string
  composition: string
  feeRate: string
  token0Balance: number
  token0Address: string
  token1Balance: number
  token1Address: string
  lpBalance: number
  hopeOfLpBalance: number
  stakedLpBalance: number
  hopeOfStakedLpBalance: number
  stakedProportion: number
  currentBoost: number
  futureBoost: number
  feesApr: number
  ltApr: number
  maxLtApr: number
  boost: number
  maxBoost: number
  rewardSymbol: string
  ltTotalReward: number
  usdOfTotalReward: number
  hopeOfTotalReward: number
  ltOfReward: number
  usdOfReward: number
  usdOfExtReward: number
  ltOfExtReward: number
  hopeOfStakableLpBalance: number
  extRewardList: {
    symbol: string
    tokenAddress: string
    amount: number
    usdOfToken: number
  }[]
}

export default class PortfolioApi {
  //
  static getOverview(address: string) {
    return get<PortfolioInfo>('/light/portfolio/gomboc/overview', { params: { address } })
  }
  static getRewardsList(params: Params) {
    return get<Item[]>('/light/dao/veLT/rewards/list', { params })
  }
  static getRewardsOverview(params: Params) {
    return get<DetailInfo>('/light/dao/veLT/rewards/overview', { params })
  }

  static getLiquidityPools(address: string) {
    return get<ILiquidityPools[]>('/light/portfolio/gomboc/liquidity/pools', { params: { address } })
  }
}
