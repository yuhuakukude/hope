import React from 'react'
import Card from '../Card'
import './index.scss'

export default function PortfolioConnect() {
  return (
    <div className="portfolio-connect">
      <Card>
        <div className="portfolio-connect-bg"></div>
        <div className="portfolio-connect-title">Connect to a wallet to view your porfolio.</div>
        <div className="portfolio-button portfolio-connect-button">Connect Wallet</div>
      </Card>
    </div>
  )
}
