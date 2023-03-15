import http from '../utils/http'

export default class Staking {
  //
  static getApy(): any {
    return http.get('/light/dao/hope/apy')
  }
  //
  static subscriptionEmail(params: any): any {
    return http.put('/light/dao/email/subscription', params)
  }
  //
  static getSubscriptionInfo(params: any): any {
    return http.get('/light/dao/email/info', { params })
  }
}
