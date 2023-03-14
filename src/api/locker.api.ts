import http from '../utils/http'

export default class Locker {
  //
  static getLtHisttory(data: any): any {
    return http.get('/light/dao/LT/lockHistory', { params: data })
  }

  //
  static getLockPoint(data: any): any {
    return http.get('/light/dao/LT/queryLockPoint', { params: data })
  }

  //
  static getBannerCharts(): any {
    return http.get('/light/dao/LT/queryLockCountHistory')
  }
}
