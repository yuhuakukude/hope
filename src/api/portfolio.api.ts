import http from '../utils/http'

export default class PortfolioApi {
  // 查询LT锁仓记录
  static getOverview() {
    return http.get('/light/portfolio/gomboc/overview')
  }

  static getAllCoins() {
    return http.get('/light/dao/base/getAllCoins')
  }
}
