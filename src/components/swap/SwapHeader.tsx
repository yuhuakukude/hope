import React from 'react'
import styled from 'styled-components'
import { RowBetween } from '../Row'
import { StyledInternalLink, TYPE } from '../../theme'
// import { Settings } from 'react-feather'

const StyledSwapHeader = styled.div`
  padding: 30px 20px 0px 20px;
  margin-bottom: -4px;
  width: 100%;
  max-width: 420px;
  color: ${({ theme }) => theme.text2};
`

// const StyledMenuIcon = styled(Settings)`
//   height: 20px;
//   width: 20px;

//   > * {
//     stroke: ${({ theme }) => theme.text2};
//   }

//   :hover {
//     opacity: 0.7;
//   }
// `

export default function SwapHeader() {
  return (
    <StyledSwapHeader>
      <RowBetween>
        <TYPE.white fontSize={18} fontWeight={500} fontFamily={'Arboria-Medium'}>
          Swap
        </TYPE.white>
        <StyledInternalLink to={'/swap/settings'} style={{ textDecoration: 'none' }}>
          {/* <StyledMenuIcon /> */}
          <i className="iconfont font-20 hope-icon-common p-3">&#xe60a;</i>
        </StyledInternalLink>
      </RowBetween>
    </StyledSwapHeader>
  )
}
