import React, { useState } from 'react'
import './index.scss'
import { useActiveWeb3React } from '../../../hooks'
import { Button, Input, message } from 'antd'
import StakingApi from '../../../api/staking.api'

interface SubscribeConProps {
  subSuccess: () => void
}

const SubscribeCon = ({ subSuccess }: SubscribeConProps) => {
  const { account } = useActiveWeb3React()
  const [isDis, setIsDis] = useState<boolean>(true)
  const [email, setEmail] = useState('')
  async function toSub() {
    try {
      setIsDis(true)
      const par = {
        address: account,
        email: email
      }
      const res = await StakingApi.subscriptionEmail(par)
      if (res && res.result) {
        setIsDis(false)
        message.success('Subscribe Success')
        subSuccess()
      }
    } catch (error) {
      console.log(error)
    }
  }
  function changeEmail(val: string) {
    setEmail(val)
    const emailReg = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,}$/
    if (!emailReg.test(val)) {
      setIsDis(true)
    } else {
      setIsDis(false)
    }
  }
  return (
    <div className="sub-box">
      <div className="input-box">
        <Input
          className="sub-input"
          value={email}
          onChange={e => {
            changeEmail(e.target.value)
          }}
          addonAfter={
            <Button
              disabled={isDis}
              className="text-primary cursor-select p-x-0"
              onClick={() => {
                toSub()
              }}
              type="link"
            >
              submit
            </Button>
          }
          defaultValue="mysite"
        />
      </div>
      <p className="m-t-10 text-white">
        I have read, understand, and agree to the{' '}
        <a className="text-primary" href="/">
          Terms of Service{' '}
        </a>
      </p>
    </div>
  )
}

export default SubscribeCon
