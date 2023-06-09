/* eslint-disable prefer-promise-reject-errors */
import Axios, { AxiosRequestConfig } from 'axios'

let requestCount = 0

const http = Axios.create({
  baseURL: '/v1',
  timeout: 60000,
  withCredentials: true,
  validateStatus(status) {
    return status >= 200 && status <= 500
  }
})

async function requestInterceptor(config: AxiosRequestConfig): Promise<AxiosRequestConfig> {
  // let { headers } = config;
  return new Promise(resolve => {
    requestCount += 1
    resolve(config)
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function requestErrorInterceptor(error: any) {
  requestCount -= 1
  return Promise.reject(error)
}

async function responseInterceptor(response: any) {
  requestCount -= 1
  // eslint-disable-next-line prefer-const
  let { data } = response
  const { success } = data
  if (success) {
    return Promise.resolve(data)
  }
  return Promise.reject(data)
}

function responseErrorInterceptor(error: { isAxiosError?: boolean; message?: string }) {
  requestCount -= 1
  if (requestCount < 1) {
  }
  if (Axios.isCancel(error)) {
    return Promise.reject({ message: 'cancel request' })
  }
  if (error.isAxiosError) {
    return Promise.reject(error)
  }
  return Promise.reject({ ...error, message: 'Network Error' })
}

http.interceptors.request.use(requestInterceptor, requestErrorInterceptor)
http.interceptors.response.use(responseInterceptor, responseErrorInterceptor)

interface IRespone<T> {
  code: number,
  result: T,
  message: string,
  success: boolean,
  fail: boolean
}

export const get = <T>(url: string, config?: AxiosRequestConfig ): Promise<IRespone<T>> => {
  return http.get(url, config) as any as Promise<IRespone<T>>
}

export const post = <T, D>(url: string, data?: D, config?: AxiosRequestConfig): Promise<IRespone<T>> => {
  return http.post(url, data, config) as any as Promise<IRespone<T>>
}

export default http
