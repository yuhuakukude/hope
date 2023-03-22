import { Token } from "@uniswap/sdk"

export interface Address {
    [chainID: number]: string
}

export interface TokenMap {
    [chainID: number]: Token
}