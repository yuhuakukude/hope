import { ButtonPrimary } from 'components/Button'
import React from 'react'
import { useWalletModalToggle } from 'state/application/hooks'
import './index.scss'

export default function PortfolioConnect() {
  const toggleWalletModal = useWalletModalToggle()

  return (
    <div className="portfolio-connect m-t-100">
      <div className="portfolio-connect-bg"></div>
      <div className="portfolio-connect-title">Connect to a wallet to view your portfolio. </div>
      <div className="portfolio-connect-button">
        <ButtonPrimary className="portfolio-button" onClick={toggleWalletModal}>
          Connect Wallet
        </ButtonPrimary>
      </div>
    </div>
  )
}
