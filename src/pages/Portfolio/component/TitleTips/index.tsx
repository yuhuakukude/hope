import React from 'react'
import Tips from 'components/Tips'

export default function TitleTips({ title, desc, link }: { title: string; desc: string | HTMLElement; link?: string }) {
  return (
    <div>
      <span style={{ marginRight: '6px' }}>{title}</span>
      <Tips
        title={() => {
          return (
            <div>
              {desc}
              {link && (
                <a href={link} style={{ color: '#E4C989' }}>
                  Learn more
                </a>
              )}
            </div>
          )
        }}
      ></Tips>
    </div>
  )
}
