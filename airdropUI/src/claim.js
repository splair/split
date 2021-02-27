import React from 'react';
import { Input } from "baseui/input";
import { Button } from "baseui/button";
import {
  Display3,
  Display4,
  H4,
  H5
} from 'baseui/typography';
import { StyledLink } from "baseui/link";

import FadeIn from 'react-fade-in';

const Claim = ({airMint, drops, amount, claims, setAppState}) => {

  return (
    <div>
      <FadeIn>
      <Display3 marginBottom="scale1000">{'Please follow the steps below for integration'}</Display3>

      { claims &&
        <div>
          <H5>First send { amount * Object.keys(drops).length } tokens of mint {airMint} to</H5>
          <div style={{color: 'pink', fontSize: '30px'}}>{claims.bankKey}</div>

          <div style={{height: '40px'}}></div>

          <Display4>Then use the following properties for dapp SDK configuration:</Display4>
          <H5 marginBottom="scale200">{'auth: ' + claims.authKey}</H5>
          <H5 marginBottom="scale200">{'bank: ' + claims.bankKey}</H5>
          <H5 marginBottom="scale200">{'airdrop: ' + claims.airdrop}</H5>
          <H5 marginBottom="scale200">{'mint: ' + claims.mint}</H5>
          <H5 marginBottom="scale200">{'publisher: ' + claims.publisher}</H5>
          
          <div style={{height:"40px"}}></div>

          <div style={{fontSize:"40px", color: "pink"}}>
            <StyledLink href='https://github.com/splair/split/blob/master/airdropUI/docs/tutorial_en.md'>Check this blog for dapp integration guide</StyledLink>
          </div>

          <div style={{height:"40px"}}></div>

          <div style={{fontSize:"40px", color: "pink"}}>
            <StyledLink href='/tutorial' >Here is a simple demo</StyledLink>
          </div>

          <div style={{height:"40px"}}></div>

        </div>
      }
    </FadeIn>
    </div>
  )

}

export default Claim;