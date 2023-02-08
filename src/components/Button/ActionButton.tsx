import React from 'react'
import { ButtonPrimary, ButtonOutlined, ButtonError } from './index'
import { CustomLightSpinner } from '../../theme'
import spinner from '../../assets/svg/spinner.svg'

export default function ActionButton({
  error,
  pending,
  success,
  onAction,
  actionText,
  pendingText,
  height,
  width,
  disableAction,
  successText
}: {
  error?: string | undefined
  pending?: boolean
  success?: boolean
  onAction: (() => void) | undefined
  actionText: string
  pendingText?: string
  successText?: string
  height?: string
  width?: string
  disableAction?: boolean
}) {
  return (
    <>
      {error ? (
        <ButtonError disabled error>
          {error}
        </ButtonError>
      ) : pending ? (
        <ButtonOutlined disabled height={height} width={width}>
          {pendingText || 'Waiting Confirmation'}
          <CustomLightSpinner style={{ marginLeft: 10 }} size={'20px'} src={spinner} />
        </ButtonOutlined>
      ) : success ? (
        <ButtonPrimary disabled height={height} width={width}>
          <div>{successText ?? actionText}</div>
        </ButtonPrimary>
      ) : (
        <ButtonPrimary height={height} width={width} onClick={onAction} disabled={disableAction}>
          {actionText}
        </ButtonPrimary>
      )}
    </>
  )
}
