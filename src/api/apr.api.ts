import http from '../utils/http'

export default class Apr {
  // hope fee apr
  static getHopeFeeApr(address: string): any {
    return http.get('/light/dao/hope/fee/apr', { params: { pairAddress: address } })
  }

  // hope allfee apr
  static getHopeAllFeeApr(address: string): any {
    return http.get('/light/dao/hope/fee/apr/list', { params: { pairs: address } })
  }

  // user allfee apr
  static getUserAllFeeApr(pairAddresss: string, userAddress: string): any {
    return http.get('/light/dao/hope/user/base/aprs', { params: { pairAddresss, userAddress } })
  }
}
