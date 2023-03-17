import { createReducer } from '@reduxjs/toolkit'
import { Field, typeSearch } from './actions'

export interface SearchState {
  readonly field: Field
}

const initialState: SearchState = {
  field: Field.ALL
}

export default createReducer<SearchState>(initialState, builder =>
  builder.addCase(typeSearch, (state, { payload: { field } }) => {
    return {
      ...state,
      field: field
    }
  })
)
