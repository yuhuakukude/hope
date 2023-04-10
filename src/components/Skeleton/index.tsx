import React from 'react'
import styled from 'styled-components'
// import { Box } from 'rebass/styled-components'

// const Card = styled(Box)<{ width?: string; padding?: string; border?: string; borderRadius?: string }>`
//   width: ${({ width }) => width ?? '100%'};
//   border-radius: 10px;
//   padding: 20px;
//   overflow: hidden;
//   padding: ${({ padding }) => padding ?? '20px'};
//   border: ${({ border }) => border};
//   border-radius: ${({ borderRadius }) => borderRadius};
// `

interface Props {
  loading: boolean
  children?: React.ReactNode
  width?: number
  height?: number
  mt?: number
  ml?: number
  mr?: number
  mb?: number
  radius?: string
  marginAuto?: boolean
}

const SkeletonBox = styled.span<{
  width?: number
  height?: number
  mt?: number
  ml?: number
  mr?: number
  mb?: number
  radius?: string
  marginAuto?: boolean
}>`
  display: block;
  width: ${({ width }) => (width ? `${width}px` : '100%')};
  height: ${({ height }) => (height ? `${height}px` : '16px')};
  margin-top: ${({ mt }) => (mt ? `${mt}px` : '0')};
  margin-left: ${({ ml, marginAuto }) => (marginAuto ? 'auto' : ml ? `${ml}px` : '0')};
  margin-right: ${({ mr, marginAuto }) => (marginAuto ? 'auto' : mr ? `${mr}px` : '0')};
  margin-bottom: ${({ mb }) => (mb ? `${mb}px` : '0')};
  background: -webkit-gradient(
    linear,
    left top,
    right top,
    color-stop(25%, #3d3e46),
    color-stop(37%, #33343d),
    color-stop(63%, #3d3e46)
  );
  border-radius: ${({ radius }) => (radius ? `${radius}` : '4px')};
  background: linear-gradient(90deg, #3d3e46 25%, #33343d 37%, #3d3e46 63%);
  background-size: 400% 100%;
  -webkit-animation: skeleton-loading 1.4s ease infinite;
  animation: skeleton-loading 1.4s ease infinite;
  @keyframes skeleton-loading {
    0% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0 50%;
    }
  }
`

// eslint-disable-next-line react/prop-types
export default function Skeleton({ loading, children, width, height, mt, ml, mr, mb, radius, marginAuto }: Props) {
  return loading ? (
    <SkeletonBox
      width={width}
      height={height}
      mt={mt}
      ml={ml}
      mr={mr}
      mb={mb}
      radius={radius}
      marginAuto={marginAuto}
    ></SkeletonBox>
  ) : (
    <>{children}</>
  )
}
