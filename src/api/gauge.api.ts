import http from '../utils/http'

export default class GaugeApi {
  //
  static getGaugeList(): any {
    return http.get('/light/gauge/all')
  }
  //
  static getGaugeVotiing(): any {
    return http.get('/light/gauge/votiing')
  }
  // all
  static getGaugeAllPools(): any {
    return http.get('/light/gauge/getAllPools')
  }

  static getGaugeAddress(params: any): any {
    return http.get('/light/dao/hope/queryGaugeAddress', { params })
  }
}
