import http from '../utils/http'

export default class Staking {
  // 查询年化利率
  static getApy(): any {
    return http.get('/light/dao/hope/apy')
  }
}
