import http from '../utils/http'

export default class Locker {
  // 查询LT锁仓记录
  static getLtHisttory(data: any): any {
    return http.get('/light/dao/LT/lockHistory', { params: data })
  }

  // 查询VeLt锁仓图表数据
  static getLockPoint(data: any): any {
    return http.get('/light/dao/LT/queryLockPoint', { params: data })
  }

  // 展示近30天每天24点（UTC-0）时刻锁定的 LT 数量
  static getBannerCharts(): any {
    return http.get('/light/dao/LT/queryLockCountHistory')
  }
}
