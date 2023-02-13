import React from 'react'

import './index.scss'

export default function Card({ children }: { children: React.ReactNode }) {
  return <div className="card-wrap">{children}</div>
}
