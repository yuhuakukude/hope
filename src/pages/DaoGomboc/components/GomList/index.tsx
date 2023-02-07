import React from 'react'
import './index.scss'
import { Switch,   } from 'antd'
// import GombocApi from '../../../../../api/gomboc.api'

const GomList = () => {
  function changeSwitch(val: boolean) {
    console.log(val)
  }

  return (
    <div className="gom-list-box">
      <div className="flex jc-between">
        <div className="flex ai-center">
          <span className="text-white">My voted Only</span>
          <Switch className="m-l-10" onChange={changeSwitch} />
        </div>
        <div className="flex ai-center">
          
        </div>
      </div>
    </div>
  )
}

export default GomList
