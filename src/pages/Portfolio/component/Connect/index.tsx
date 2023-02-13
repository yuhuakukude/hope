import { ButtonPrimary } from 'components/Button'
import React from 'react'
import { useWalletModalToggle } from 'state/application/hooks'
import Card from '../Card'
import './index.scss'

export default function PortfolioConnect() {
  const toggleWalletModal = useWalletModalToggle()

  return (
    <div className="portfolio-connect">
      <Card>
        <div className="portfolio-connect-bg"></div>
        <div className="portfolio-connect-title">Connect to a wallet to view your porfolio.</div>
        <div className="portfolio-connect-button">
          <ButtonPrimary className="portfolio-button" onClick={toggleWalletModal}>
            Connect Wallet
          </ButtonPrimary>
        </div>
      </Card>
    </div>
  )
}
