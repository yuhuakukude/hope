import { Modal as AModal } from 'antd'
import { ModalProps } from 'antd/lib/modal'
import React from 'react'

import './index.scss'

export default function Modal(props: { children: React.ReactNode } & ModalProps) {
  const className = `hope-modal-wrap ${props.className || ''}`
  return (
    <AModal {...props} className={className}>
      {props.children}
    </AModal>
  )
}
