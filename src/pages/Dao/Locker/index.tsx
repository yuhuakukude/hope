import React from 'react'
import styled from 'styled-components'
import { AutoColumn } from '../../../components/Column'
import './index.scss'
const PageWrapper = styled(AutoColumn)`
  max-width: 1280px;
  width: 100%;
`

export default function DaoLocker() {
  return (
    <>
      <PageWrapper>
        <div>DaoLocker</div>
      </PageWrapper>
    </>
  )
}
