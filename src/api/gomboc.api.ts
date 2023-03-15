import http from '../utils/http'

export default class GombocApi {
  //
  static getGombocsList(): any {
    return http.get('/light/gombocs/all')
  }
  //
  static getGombocsVotiing(): any {
    return http.get('/light/gombocs/votiing')
  }
  //
  static getVoteHistoryList(params: any): any {
    return http.get('/light/gombocs/getLightGombocController', { params })
  }
  //
  static getGombocsPoolsList(params: any): any {
    return http.get('/light/gombocs/pools', { params })
  }
  // all gomboc
  static getGombocsAllPools(): any {
    return http.get('/light/gombocs/getAllPools')
  }

  static getGombocsAddress(params: any): any {
    return http.get('/light/dao/hope/queryGombocAddress', { params })
  }
}
