import React from 'react';
import logo from './logo.svg';
import './App.css';
import TextField from '@material-ui/core/TextField'
import Container from '@material-ui/core/Box'
import Divider from '@material-ui/core/Divider'

import {AccountManager} from 'solong.js'
import {Token, AccountLayout} from '@solana/spl-token';
import { LAMPORTS_PER_SOL,Account, PublicKey, Connection, SystemProgram ,Transaction,sendAndConfirmTransaction } from '@solana/web3.js';
import { Button,Grid } from '@material-ui/core';
import {Airdrop} from './Airdrop.js/Airdrop';
import * as Layout from './Airdrop.js/Layout';


class Content extends React.Component {

  constructor(props) {
    super(props)
    this.state = { };
    this.onAirdrop = this.onAirdrop.bind(this);
    this.onClaim= this.onClaim.bind(this);
    this.onQuery= this.onQuery.bind(this);

    //let url =  'http://api.mainnet-beta.solana.com';
    //let url =  'https://solana-api.projectserum.com';
    let url =  'https://devnet.solana.com';
    this.connection = new Connection(url);
    this.publisherPrivKey= [156,211,233,131,234,193,221,222,177,96,198,167,51,79,115,81,85,115,178,104,54,233,239,191,167,211,170,161,109,157,146,139,141,66,123,42,16,89,196,121,47,55,209,15,162,160,194,236,131,108,250,74,108,135,188,216,88,216,1,232,183,179,208,70];
    this.playerPrivKey = [210,130,3,15,105,189,149,198,200,61,109,31,156,122,169,101,79,232,163,5,164,141,17,108,55,168,173,208,104,166,220,231,132,172,201,237,59,192,10,63,56,223,23,74,174,50,70,134,176,246,76,65,185,69,115,249,116,55,179,49,38,36,53,169];

    this.publisherAccount = new Account(this.publisherPrivKey);
    this.playerAccount = new Account(this.playerPrivKey);
    this.airdropAccount = new Account()
    this.programID = new PublicKey('GryzWe67L7RgGyMr3Kkh6MRiBP5u1ij1RQByFeEv3moX');
    this.bankKey = new PublicKey("LRJt66GaQvGcyESqKdBywyQ1ADq866LZ29iJJM4wG7Q")
    this.mintKey = new PublicKey("FJbTxs3VEyWywuF4JPonMb1U5CTyBDLnWDZ9NrJH4h83")
    this.authKey = new PublicKey("2uqVXe1cHn2jKFVGzjfVAueWALBCF8fGJBZyfLJPeFoQ")
    this.playerSPLKey  = new PublicKey("CgzErFbGm6McwtSnDDRiAz83iHDP1pQf9XQfdEk6hEF7")
  }


  render() {
    return (
      <Container>

        <React.Fragment>
          <Button onClick={this.onAirdrop}> airdrop</Button>
        </React.Fragment>
        <Divider />
        <React.Fragment>
          <Button onClick={this.onClaim}> claim</Button>
        </React.Fragment>
        <Divider />
        <React.Fragment>
          <Button onClick={this.onQuery}> query</Button>
        </React.Fragment>
        <Divider />
        
      </Container>
    );
  }

  async onClaim() {
    console.log("onclaim")


    // step1: create a spl account
    this.playerSPLAccount = new Account();
    console.log("player SPL is :",  this.playerSPLAccount.publicKey.toBase58())
    // step2: caculate ret
    const balanceNeeded = await Token.getMinBalanceRentForExemptAccount(
        this.connection,
    );
    // step3: create createAccount transaction instrument
    const createAccountTrxi =  SystemProgram.createAccount({
        fromPubkey: this.playerAccount.publicKey,
        newAccountPubkey: this.playerSPLAccount.publicKey,
        lamports: balanceNeeded,
        space: AccountLayout.span,
        programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
    })
    // step4: ceate init account transaction instrucment
    const initAccountTrx =   Token.createInitAccountInstruction(
        new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"), 
        this.mintKey,
        this.playerSPLAccount.publicKey,
        this.playerAccount.publicKey,
    )


    let trxi = Airdrop.createClaimInstruction(
      this.programID,
      new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
      new PublicKey(this.airdropResult.authKey),
      this.playerAccount.publicKey,
      this.publisherAccount.publicKey,
      new PublicKey(this.airdropResult.bankKey),
      this.mintKey,
      new PublicKey(this.airdropResult.airdrop),
      this.playerSPLAccount.publicKey,
    );

    const transaction = new Transaction();
    transaction.add(createAccountTrxi);
    transaction.add(initAccountTrx);
    transaction.add(trxi);

    let signers= [this.playerAccount, this.playerSPLAccount];
    sendAndConfirmTransaction(this.connection, transaction, signers, {
        skipPreflight: false,
        commitment: 'recent',
        preflightCommitment: 'recent',
    }).then(()=>{
      console.log("done claim");
    }).catch((e)=>{
      console.log("claim error:", e);
    }) 
  }

  async onQuery() {
    Airdrop.GetAirdrop(this.connection, new PublicKey(this.airdropResult.airdrop))
  }


  async onAirdrop() {
    let names = [
    new PublicKey("9vudcwenWskuZG3eWYBvfrJ5MPUjsRcKwguP8fnuijcC").toBuffer(),
    new PublicKey("9vudcwenWskuZG3eWYBvfrJ5MPUjsRcKwguP8fnuijcD").toBuffer(),
    new PublicKey("9vudcwenWskuZG3eWYBvfrJ5MPUjsRcKwguP8fnuijcE").toBuffer(),
    new PublicKey("9vudcwenWskuZG3eWYBvfrJ5MPUjsRcKwguP8fnuijcF").toBuffer(),
    new PublicKey("9vudcwenWskuZG3eWYBvfrJ5MPUjsRcKwguP8fnuijcG").toBuffer(),
    ];

    Airdrop.airdrop(
      this.connection,
      this.programID,
      this.publisherAccount,
      this.mintKey,
      1000000,
      names,
    ).then((r)=>{
      console.log("airdrop result:", r)
      this.airdropResult = r;
    }).catch((e)=>{
      console.log("airdrop error:", e)
    })
  }

}


function App() {
  return (
    <Content />
  );
}

export default App;