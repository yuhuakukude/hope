import http from '../utils/http'

export default class Staking {
  // 查询年化利率
  static getApy(): any {
    return http.get('/light/dao/hope/apy')
  }
  // 邮件订阅
  static subscriptionEmail(params: any): any {
    return http.put('/light/dao/email/subscription', params)
  }
  // 查询订阅邮件
  static getSubscriptionInfo(params: any): any {
    return http.get('/light/dao/email/info', { params })
  }
}
