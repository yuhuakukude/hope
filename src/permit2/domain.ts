import { BigNumber, BigNumberish } from '@ethersproject/bignumber'
import { BytesLike } from '@ethersproject/bytes'
import ms from 'ms.macro'
import invariant from 'tiny-invariant'

export interface TypedDataField {
  name: string
  type: string
}

export interface TypedDataDomain {
  name?: string
  version?: string
  chainId?: BigNumberish
  verifyingContract?: string
  salt?: BytesLike
}

export interface PermitDetails {
  token: string
  amount: BigNumberish
}

export interface PermitSingle {
  permitted: PermitDetails
  nonce: BigNumberish
  spender: string
  deadline: BigNumberish
}

export type PermitData = {
  domain: TypedDataDomain
  types: Record<string, TypedDataField[]>
  values: any
}

export interface PermitBatch {
  permitted: PermitDetails[]
  spender: string
  sigDeadline: BigNumberish
}

export type PermitSingleData = {
  domain: TypedDataDomain
  types: Record<string, TypedDataField[]>
  values: PermitSingle
}

export type PermitBatchData = {
  domain: TypedDataDomain
  types: Record<string, TypedDataField[]>
  values: PermitBatch
}

export interface Permit extends PermitSingle {
  deadline: number
}

const PERMIT_DETAILS = [
  { name: 'token', type: 'address' },
  { name: 'amount', type: 'uint256' }
]

const PERMIT_TYPES = {
  PermitTransferFrom: [
    { name: 'permitted', type: 'TokenPermissions' },
    { name: 'spender', type: 'address' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' }
  ],
  TokenPermissions: [
    { name: 'token', type: 'address' },
    { name: 'amount', type: 'uint256' }
  ]
}

const PERMIT_BATCH_TYPES = {
  PermitBatch: [
    { name: 'details', type: 'PermitDetails[]' },
    { name: 'spender', type: 'address' },
    { name: 'deadline', type: 'uint256' }
  ],
  PermitDetails: PERMIT_DETAILS
}

export const PERMIT_EXPIRATION = ms`30d`
export const PERMIT_SIG_EXPIRATION = ms`30m`

const PERMIT2_DOMAIN_NAME = 'Permit2'

export const MaxUint48 = BigNumber.from('0xffffffffffff')
export const MaxUint160 = BigNumber.from('0xffffffffffffffffffffffffffffffffffffffff')
export const MaxUint256 = BigNumber.from('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')

// alias max types for their usages
// allowance transfer types
export const MaxAllowanceTransferAmount = MaxUint160
export const MaxAllowanceExpiration = MaxUint48
export const MaxOrderedNonce = MaxUint48

function validatePermitDetails(details: PermitDetails) {
  //invariant(MaxOrderedNonce.gte(details.nonce as BigNumberish), 'NONCE_OUT_OF_RANGE')
  invariant(MaxAllowanceTransferAmount.gte(details.amount), 'AMOUNT_OUT_OF_RANGE')
  //invariant(MaxAllowanceExpiration.gte(details.expiration), 'EXPIRATION_OUT_OF_RANGE')
}

export function permit2Domain(permit2Address: string, chainId: number): TypedDataDomain {
  return {
    name: PERMIT2_DOMAIN_NAME,
    chainId,
    verifyingContract: permit2Address
  }
}

function isPermit(permit: PermitSingle | PermitBatch): permit is PermitSingle {
  return !Array.isArray(permit.permitted)
}

// return the data to be sent in a eth_signTypedData RPC call
// for signing the given permit data
export function getPermitData(
  permit: PermitSingle | PermitBatch,
  permit2Address: string,
  chainId: number
): PermitSingleData | PermitBatchData {
  //invariant(MaxSigDeadline.gte(permit.sigDeadline), 'SIG_DEADLINE_OUT_OF_RANGE')
  const domain = permit2Domain(permit2Address, chainId)
  if (isPermit(permit)) {
    validatePermitDetails(permit.permitted)
    return {
      domain,
      types: PERMIT_TYPES,
      values: permit
    }
  } else {
    permit.permitted.forEach(validatePermitDetails)
    return {
      domain,
      types: PERMIT_BATCH_TYPES,
      values: permit
    }
  }
}

export function toDeadline(expiration: number): number {
  return Math.floor((Date.now() + expiration) / 1000)
}
