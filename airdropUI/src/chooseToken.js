import React from 'react';
import { Input } from "baseui/input";
import { Button } from "baseui/button";
import {
  Display3,
  Display4,
} from 'baseui/typography';
import FadeIn from 'react-fade-in';
import {web3jshelper} from './web3helper';
import { PublicKey } from '@solana/web3.js';

const ChooseToken = ({setAirMint, setAppState}) => {

  const [value, setValue] = React.useState('');

  const tokenSelected = (e) => {
    setValue(e.target.value);
    setAirMint(e.target.value);
  }

  return (
    <div>
      <FadeIn>
      <Display3 marginBottom="scale500">{'Input the mint of token you want to airdrop'}</Display3>
      <Input
          value={value}
          onChange={tokenSelected}
          placeholder=""
          clearOnEscape
        />

        <div style={{height:"40px"}}></div>
        <Button
          onClick={() =>{
            setAppState("uploadOrCondition");
          }}
        >
          Next
        </Button>
    </FadeIn>
    </div>
  )

}

export default ChooseToken;