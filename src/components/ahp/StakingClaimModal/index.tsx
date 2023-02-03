import React, { useCallback } from 'react'
import Modal from '../../Modal'
import './index.scss'
import { useToClaim } from '../../../hooks/ahp/useStaking'
import { useActiveWeb3React } from '../../../hooks'
import { ButtonPrimary } from '../../Button'

interface StakingClaimModalProps {
  isOpen: boolean
  onDismiss: () => void
  setModalView: any
  rewardsInfo: any
}

const StakingClaimModal = ({ isOpen, onDismiss, setModalView, rewardsInfo }: StakingClaimModalProps) => {
  const { account } = useActiveWeb3React()
  const { toClaim } = useToClaim()
  const toClaimCallback = useCallback(async () => {
    if (!account) return
    // showModal(<TransactionPendingModal />)
    toClaim()
      .then(() => {
        setModalView(false)
        console.log('success')
        // hideModal()
        // showModal(<TransactionSubmittedModal />)
      })
      .catch((err: any) => {
        // hideModal()
        // showModal(
        //   <MessageBox type="error">{err.error && err.error.message ? err.error.message : err?.message}</MessageBox>
        // )
        console.error(err)
      })
  }, [account, toClaim, setModalView])
  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss}>
      <div className="staking-claim-box w-100">
        <div className="head">
          $LT Rewards Claim
          <i
            onClick={() => {
              setModalView(false)
            }}
            className="iconfont m-r-10 icon-close cursor-select"
          >
            &#xe612;
          </i>
        </div>
        <div className="claim-con p-30">
          <div className="flex jc-between">
            <span className="text-white">Total Rewards</span>
            <span className="text-white">{rewardsInfo?.claRewards}</span>
          </div>
          <div className="flex jc-between m-t-20 m-b-40">
            <span className="text-white">Claimable Rewards</span>
            <span className="text-white">{rewardsInfo?.totalRewards}</span>
          </div>
          <ButtonPrimary className="hp-button-primary" onClick={toClaimCallback}>
            Claim
          </ButtonPrimary>
        </div>
      </div>
    </Modal>
  )
}

export default StakingClaimModal
