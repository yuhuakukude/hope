import { createAction } from '@reduxjs/toolkit'

export enum Field {
  ALL = 'ALL',
  USER_LIQUIDITY = 'USER_LIQUIDITY',
  USER_STAKING = 'USER_STAKING'
}

export const typeSearch = createAction<{ field: Field }>('liquidity/typeSearch')
