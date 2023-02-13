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

export default class PortfolioApi {
  // 查询LT锁仓记录
  static getOverview(address: string) {
    return get<IPortfolio>('/light/portfolio/gomboc/overview', { params: { address } })
  }
 
  static getRewardsList(params: any): Promise<any> {
    return get('/light/dao/veLT/rewards/list', { params })
  }
  static getRewardsOverview(params: any): Promise<any> {
    return get('/light/dao/veLT/rewards/overview', { params })
  }
}
