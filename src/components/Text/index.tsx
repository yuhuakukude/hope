import styled from 'styled-components'

export const PrimaryText = styled.p<{ size?: string }>`
  color: ${({ theme }) => theme.text1};
  font-size: ${({ size }) => size};
`

export const SecondaryText = styled.p<{ size?: string }>`
  font-size: ${({ size }) => size};
  color: ${({ theme }) => theme.text2};
`
