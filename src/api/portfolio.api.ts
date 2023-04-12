import { get } from '../utils/http'

export interface PortfolioReward {
  name: string
  gauge: string
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
export interface Gauge {
  id: string
  networkId: number
  gaugeType: number
  poolType: POOL_TYPE
  gaugeTypeName: string
  gaugeAddress: string
  gaugeName: string
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
  gauge: Gauge
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
  gauge: string
  pair: string
  composition: string
  feeRate: string
  token0Balance: number|string
  token0Address: string
  token1Balance: number|string
  token1Address: string
  lpBalance: number|string
  stakableLpBalance: number|string
  hopeOfLpBalance: number|string
  stakedLpBalance: number|string
  hopeOfStakedLpBalance: number|string
  stakedProportion: number|string
  currentBoost: number|string
  futureBoost: number|string
  feesApr: number|string
  ltApr: number|string
  maxLtApr: number|string
  boost: number|string
  maxBoost: number|string
  rewardSymbol: string
  ltTotalReward: number|string
  usdOfTotalReward: number|string
  hopeOfTotalReward: number|string
  ltOfReward: number|string
  usdOfReward: number|string
  usdOfExtReward: number|string
  ltOfExtReward: number|string
  hopeOfStakableLpBalance: number|string
  extRewardList: {
    symbol: string
    tokenAddress: string
    amount: number|string
    usdOfToken: number|string
  }[]
}

export default class PortfolioApi {
  static getRewardsList(params: Params) {
    return get<Item[]>('/light/dao/veLT/rewards/list', { params })
  }
  static getRewardsOverview(params: Params) {
    return get<DetailInfo>('/light/dao/veLT/rewards/overview', { params })
  }

  static getLiquidityPools(address: string) {
    return get<ILiquidityPools[]>('/light/portfolio/gauge/liquidity/pools', { params: { address } })
  }
}
