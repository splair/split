import React,{ useContext, useEffect, useMemo, useState }  from 'react';
import { Input } from "baseui/input";
import { Button } from "baseui/button";
import {
  Display3,
  Display4,
} from 'baseui/typography';
import FadeIn from 'react-fade-in';
import Wallet from "@project-serum/sol-wallet-adapter";
import {MAIN_NET, web3jshelper} from "./web3helper"

const Tutorial = ({claims, setAppState}) => {
  const [account, setAccount] = React.useState(null);

  const wallet = useMemo(() => {
    let providerUrl = "https://www.sollet.io"
      return new Wallet(providerUrl, MAIN_NET);
  });

  useEffect(() => {
    console.log("trying to connect");
    wallet.on("connect", () => {
      console.log("connected");
      setAccount(wallet.publicKey.toBase58());
      web3jshelper.wallet = wallet;
    });
    wallet.on("disconnect", () => {
      setAccount(null);
      web3jshelper.wallet = null;
    });
  }, [wallet]);

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
        wallet.connect();
        // window.solong.selectAccount().then((account) => { 
        //   console.log("connect account with ", account) 
        //   setAccount(account)
        // });
      }}>
        Connect Wallet
      </Button>

      <div style={{height:"40px"}}></div>

      <Button onClick={() => {
        console.log("claim your tokens")
        web3jshelper.claim(
          account,
          "3JSf5tPeuscJGtaCp5giEiDhv51gQ4v3zWg8DGgyLfAB",
          "CCSQckUnv9LYgP1xSg11wiUyJK8AtvYzXUb3LFMhiK8",
          "DyLcsq1ov1sVF5kmimYeeo1cbM1veTuDnC5jDhPDk3LY",
          "CeVnxh6cWnCpX2wA2fn9qLNcAtW6sSLsRsAdpnThcKwz",
          "6ycKFJYs1isbjNa9FRtfLMhJP1TiQVB79h18UdyKVEPB",
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