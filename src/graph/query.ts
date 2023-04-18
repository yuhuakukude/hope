export function QUERY_ALL_PAIR() {
  return `{
    pairs(first:100,skip:0) {
      id
      token0 {
        id
        symbol
        name
        __typename
      }
      token1 {
        id
        symbol
        name
        __typename
      }
      __typename
    }
  }
  `
}

export function QUERY_ALL_STAKING() {
  return `{ poolGauges(first:100,skip:0){
                 id
                 pair{
                    id
                 }
            }
   }`
}

export function QUERY_USER_LIQUIDITY(account: string) {
  return `{
    liquidityPositions(first: 500, ${
      account ? `where: {user_: {id: "${account.toLowerCase()}"}, liquidityTokenBalance_gt: "0"}` : ''
    }) {
        pair{
          id
          token0{
            id
            name
            symbol
          }
          token1{
            id
            name
            symbol
          }
        }
    }
  }`
}

export function QUERY_USER_STAKING(account: string) {
  return `{
    stakedPoolPositions(first: 500, ${
      account ? `where: {user_: {id: "${account.toLowerCase()}"}, stakedPoolBalance_gt: "0"}` : ''
    }) {
      pool{
        id
        pair{
          id
          token0{
            id
            name
            symbol
          }
          token1{
            id
            name
            symbol
          }
        }
      }
    }
  }`
}

export function QUERY_TOKENS_PRICE() {
  return `query tokens($tokens: [Bytes]!){
    tokens(where: {id_in: $tokens}, block: {number: 3308000}){
      id
      derivedHOPE
    }
    bundles(where: {id: 1}){
      id
      hopePrice
    }
  }`
}

export function QUERY_PAIR_LIST() {
  return `query pairs($pairs: [Bytes]!){
    pairs(where: {id_in: $pairs}) {
      id
      reserveUSD
      feeRate
      feeUSD
      reserve0
      reserve1
      volumeToken0
      volumeToken1
      volumeUSD
      volumeToken0
      volumeToken1
      token0Price
      token1Price
      token0 {
        id
        symbol
        name
        decimals
        __typename
      }
      token1 {
        id
        symbol
        name
        decimals
        __typename
      }
      __typename
    }
  }`
}
