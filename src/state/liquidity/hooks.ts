import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from '../index'
import { useCallback } from 'react'
import { Field, typeSearch } from './actions'

export function useLiquidityState(): AppState['liquidity']['field'] {
  return useSelector<AppState, AppState['liquidity']['field']>(state => state.liquidity.field)
}

export function useLiquiditySearchType(): [Field, (field: Field) => void] {
  const dispatch = useDispatch<AppDispatch>()
  const liquiditySearchType = useSelector<AppState, AppState['liquidity']['field']>(state => {
    return state.liquidity.field
  })

  const setLiquiditySearchType = useCallback(
    (field: Field) => {
      dispatch(typeSearch({ field }))
    },
    [dispatch]
  )

  return [liquiditySearchType, setLiquiditySearchType]
}
