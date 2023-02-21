export function QUERY_PAIR_BASE() {
  return `{
    pairs(first:100,skip:0) {
      id
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
