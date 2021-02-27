import React from 'react';
import { Input } from "baseui/input";
import { Button } from "baseui/button";
import {
  Display3,
  Display4,
} from 'baseui/typography';
import FadeIn from 'react-fade-in';
import {web3jshelper} from './web3helper'

const Tutorial = ({claims, setAppState}) => {
  const [account, setAccount] = React.useState(null);
  return (

    <div style={{  display: "flex", width: "100%", flexDirection: "column", alignItems: "center"}}>
            <header className="App-header">
              <p>
                SPLit - we need air and airdrop
              </p>
              {account &&
                <div style={{fontSize: '12px'}}>{account}</div>
              }
            </header>

            <div>
      <FadeIn>
      <Display3 marginBottom="scale1000">{'Demo'}</Display3>

      <Button onClick={() => {
        console.log("connect wallet")
        
        window.solong.selectAccount().then((account) => { 
          console.log("connect account with ", account) 
          setAccount(account)
        });
      }}>
        Connect Wallet
      </Button>

      <div style={{height:"40px"}}></div>

      <Button onClick={() => {
        console.log("claim your tokens")
        web3jshelper.claim(
          account,
          "3jjkb2zHUMfzjiaRf7coLLdYepLTXQSHTGyWF8H6jnmf",
          "AojZV7wpazUdD2Nq12QEhwCpC4pCgNvRfZjbeABpENzq",
          "8qpkefn7Va4SxwSKGoBbSNYzxfXn8Thn18Z5io3dMqJD",
          "DjwxnJXPPcZf5S5T3s3WxrAveKpy13oTUJqYpe2myZFj",
          "BgX6SzpeZrDMyNTph4BZqfHQszBZM7JdPwAUXzh1NnS8",
        )
      }}>
        Claim!
      </Button>
    </FadeIn>
    </div>
    </div>
  )
}

export default Tutorial;