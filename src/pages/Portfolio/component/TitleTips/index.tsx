import React, { useCallback } from 'react'
import Tips from 'components/Tips'

export default function TitleTips({ title, desc, link }: { title: string; desc: string | HTMLElement; link?: string }) {
  const getTitle = useCallback(
    () => (
      <div>
        {desc}
        {link && (
          <a href={link} style={{ color: '#E4C989' }}>
            Learn more
          </a>
        )}
      </div>
    ),
    [desc, link]
  )
  return (
    <div>
      <span style={{ marginRight: '6px' }} className="text-medium">
        {title}
      </span>
      <Tips title={getTitle}></Tips>
    </div>
  )
}
