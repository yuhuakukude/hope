import { get } from '../utils/http'

export interface IPortfolioReward {
  name: string
  gomboc: string
  apr: string | number
  boost: string
  maxBoost: string
  staked: string | number
  ustOfStaked: string | number
  stakeable: string | number
  usdOfStakeable: string | number
  stakeSymbol: string
  reward: string | number
  usdOfReward: string | number
  rewardSymbol: string
}
export interface IPortfolio {
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
  rewards: IPortfolioReward[]
}

export interface IDetail {
  belongsToMe: string
  belongsToVeLT: string
  withdrawable: string
}

export enum POOL_TYPE {
  HOPE,
  SWAP
}
export interface IGomboc {
  id: string
  networkId: number
  gombocType: number
  poolType: POOL_TYPE 
  gombocTypeName: string
  gombocAddress: string
  gombocName:string
  ItTokenAddress:string
  ItTokenSymbol:string
  ItTokenName:string
  IpTokenAddress:string
  IpTokenSymbol:string
  IpTokenName:string
  composition:string
  IpTokenDecimal:number
  enable:boolean
  createAt:string
  updateAt:string
}
export interface IItem {
  gomboc: IGomboc
  totalFees: number
  withdrawable: number
}

interface IParams {
  startTimestamp: number
  endTimestamp: number
  userAddress: string
}

export default class PortfolioApi {
  // 查询LT锁仓记录
  static getOverview(address: string) {
    return get<IPortfolio>('/light/portfolio/gomboc/overview', { params: { address } })
  }
  static getRewardsList(params: IParams) {
    return get<IItem[]>('/light/dao/veLT/rewards/list', { params })
  }
  static getRewardsOverview(params: IParams) {
    return get<IDetail>('/light/dao/veLT/rewards/overview', { params })
  }
}
