import React from 'react'
import Card from '../Card'
import Detail from './Detail'
import Empty from './Empty'
import List from './List'
import TitleTips from '../TitleTips'

import './index.scss'

export default function VeLTRewards() {
  return (
    <div className="velt-rewards-wrap">
      <Card>
        <div className="velt-rewards-title">
          <TitleTips
            link=""
            title="veLT Rewards"
            desc="veLT holders will receive 25% of all agreed fee income as an reward, as well as a portion of the Gomboc
              fee income during the voting period if they participate in the weighted vote of a Gomboc."
          />
        </div>
        {false ? (
          <Empty />
        ) : (
          <>
            <Detail />
            <List />
          </>
        )}
      </Card>
    </div>
  )
}
