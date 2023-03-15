import http from '../utils/http'

export default class Locker {
  //
  static getHopeSaleHistory(data: any): any {
    return http.get('/light/dao/hope/sale/transactions', { params: data })
  }
}
