import styled from 'styled-components'
import Row from '../Row'

const TabWrapper = styled(Row)`
  padding: 2px;
  width: fit-content;
  background-color: ${({ theme }) => theme.bg5};
  border-radius: 8px;
`

const TabItem = styled.div<{ isActive?: boolean }>`
  color: ${({ isActive, theme }) => (isActive ? theme.text1 : '#a8a8aa')};
  width: 118px;
  height: 38px;
  border-radius: 8px;
  font-family: Arboria-Medium;
  cursor: pointer;
  user-select: none;
  position: relative;
  background: ${({ isActive, theme }) => (isActive ? theme.bg3 : theme.bg5)};
  text-align: center;
  line-height: 38px;

  &:hover {
    color: ${({ theme }) => theme.text1};
  }
`
export { TabWrapper, TabItem }
