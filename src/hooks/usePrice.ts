import { useCallback, useEffect, useState } from 'react'
import { postQuery } from 'utils/graph'
import Decimal from 'decimal.js'
import { SUBGRAPH } from '../constants'

const usePrice = () => {
  const [hopePrice, setHopePrice] = useState('')
  const initPrice = useCallback(async () => {
    try {
      // const address = `${STAKING_HOPE_GAUGE_ADDRESS[chainId ?? 1]}`.toLowerCase()
      const addQuery = `{  
        tokens(where: {symbol: "stHOPE"}) {    
          symbol   
          id 
        } 
      }`
      const address = await postQuery(SUBGRAPH, addQuery)
      if (address && address.data.tokens[0] && address.data.tokens[0].id) {
        const add = address.data.tokens[0].id
        const query = `{  
          token(id: "${add}") {    
            symbol   
            derivedHOPE  
          }  
          bundle(id: 1) {    
            hopePrice  
          }
        }`

        const res = await postQuery(SUBGRAPH, query)
        if (res && res.data) {
          const item = res.data
          const de = item.token?.derivedHOPE || 0
          const bu = item.bundle?.hopePrice || 0
          const pr = new Decimal(de).mul(new Decimal(bu)).toNumber()
          const num = pr.toFixed(18)
          if (num && Number(num) > 0) {
            setHopePrice(num)
          }
        }
      }
    } catch (error) {
      console.log(error)
    }
  }, [])

  useEffect(() => {
    initPrice()
  }, [initPrice])
  return hopePrice
}

export default usePrice
