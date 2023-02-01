import http from '../utils/http'

export default class Locker {
  // 查询HOPE Sales交易历史记录
  static getHopeSaleHistory(data: any): any {
    return http.get('/light/dao/hope/sale/transactions', { params: data })
  }
}
