export function QUERY_PAIR_BASE() {
  return `{
    pairs(first:100,skip:0) {
      id
      reserveUSD
      feeRate
      feeUSD
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
 
   poolGombocs(first:100,skip:0){
                 id
                 pair{
                    id
                 }
            }
   }
  `
}

export function QUERY_TOKENS_PRICE() {
  return `query tokens($tokens: [Bytes]!){
    tokens(where: {id_in: $tokens}){
      id
      derivedETH
    }
    bundles(where: {id: 1}){
      id
      ethPrice
    }
  }`
}
