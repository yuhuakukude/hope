import { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer'
import { JsonRpcSigner } from '@ethersproject/providers'

export declare class TypedDataEncoder {
  readonly primaryType: string
  readonly types: Record<string, Array<TypedDataField>>
  readonly _encoderCache: Record<string, (value: any) => string>
  readonly _types: Record<string, string>
  constructor(types: Record<string, Array<TypedDataField>>)
  getEncoder(type: string): (value: any) => string
  _getEncoder(type: string): (value: any) => string
  encodeType(name: string): string
  encodeData(type: string, value: any): string
  hashStruct(name: string, value: Record<string, any>): string
  encode(value: Record<string, any>): string
  hash(value: Record<string, any>): string
  _visit(type: string, value: any, callback: (type: string, data: any) => any): any
  visit(value: Record<string, any>, callback: (type: string, data: any) => any): any
  static from(types: Record<string, Array<TypedDataField>>): TypedDataEncoder
  static getPrimaryType(types: Record<string, Array<TypedDataField>>): string
  static hashStruct(name: string, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): string
  static hashDomain(domain: TypedDataDomain): string
  static encode(
    domain: TypedDataDomain,
    types: Record<string, Array<TypedDataField>>,
    value: Record<string, any>
  ): string
  static hash(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): string
  static resolveNames(
    domain: TypedDataDomain,
    types: Record<string, Array<TypedDataField>>,
    value: Record<string, any>,
    resolveName: (name: string) => Promise<string>
  ): Promise<{
    domain: TypedDataDomain
    value: any
  }>
  static getPayload(
    domain: TypedDataDomain,
    types: Record<string, Array<TypedDataField>>,
    value: Record<string, any>
  ): any
}

/**
 * Overrides the _signTypedData method to add support for wallets without EIP-712 support (eg Zerion) by adding a fallback to eth_sign.
 * The implementation is copied from ethers (and linted), except for the catch statement, which removes the logger and adds the fallback.
 * @see https://github.com/ethers-io/ethers.js/blob/c80fcddf50a9023486e9f9acb1848aba4c19f7b6/packages/providers/src.ts/json-rpc-provider.ts#L334
 */
JsonRpcSigner.prototype._signTypedData = async function signTypedDataWithFallbacks(this, domain, types, value) {
  // Populate any ENS names (in-place)
  const populated = await TypedDataEncoder.resolveNames(domain, types, value, (name: string) => {
    return this.provider.resolveName(name) as Promise<string>
  })

  const address = await this.getAddress()

  try {
    try {
      // We must try the unversioned eth_signTypedData first, because some wallets (eg SafePal) will hang on _v4.
      return await this.provider.send('eth_signTypedData', [
        address.toLowerCase(),
        JSON.stringify(TypedDataEncoder.getPayload(populated.domain, types, populated.value))
      ])
    } catch (error) {
      // MetaMask complains that the unversioned eth_signTypedData is formatted incorrectly (32602) - it prefers _v4.
      if (error.code === -32602) {
        console.warn('eth_signTypedData failed, falling back to eth_signTypedData_v4:', error)
        return await this.provider.send('eth_signTypedData_v4', [
          address.toLowerCase(),
          JSON.stringify(TypedDataEncoder.getPayload(populated.domain, types, populated.value))
        ])
      }
      throw error
    }
  } catch (error) {
    // If neither other method is available (eg Zerion), fallback to eth_sign.
    if (typeof error.message === 'string' && error.message.match(/not found/i)) {
      console.warn('eth_signTypedData_* failed, falling back to eth_sign:', error)
      const hash = TypedDataEncoder.hash(populated.domain, types, populated.value)
      return await this.provider.send('eth_sign', [address, hash])
    }
    throw error
  }
}
