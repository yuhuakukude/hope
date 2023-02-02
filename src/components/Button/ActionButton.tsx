import React from 'react'
import { ButtonPrimary, ButtonOutlined } from './index'

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
      {error || pending ? (
        <ButtonOutlined disabled height={height} width={width}>
          {pending ? <>{pendingText || 'Waiting Confirmation'}</> : error}
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
