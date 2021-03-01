import React from 'react';
import { Button } from "baseui/button";
import { Select } from "baseui/select";
import {
  Display1,
  Display2,
  Display3,
  Display4,
} from 'baseui/typography';
import FadeIn from 'react-fade-in';
import {web3jshelper} from './web3helper';

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalButton,
} from 'baseui/modal';

const DropMethod = ({owner,drops, airMint, amount, setClaims, setAppState}) => {

  const btnClicked = React.useCallback(async () => {
    console.log("owner:", owner)
    console.log("drops:", drops)
    console.log("airMint:", airMint) 
    console.log("setDrops:", amount)
    const ret = await web3jshelper.claimAirdrop(owner, airMint, amount, drops);

    console.log(ret);

    setClaims(ret);

    setAppState("claim");
  }, [setClaims])

  const [isOpen, setIsOpen] = React.useState(false);
  const [spls, SetSpls] = React.useState([]);
  const [sourceSpl, SetSourceSpl] = React.useState(null);

  function close() {
    setIsOpen(false);
  }

  const [tokenOption, setTokenOption] = React.useState([]);

  function splSelected(params) {
    setTokenOption(params.value);
    SetSourceSpl(params.value[0].id);
  }

  return (
    <div>
      <FadeIn>
        <Display3 marginBottom="scale500">{'How you want to drop the tokens'}</Display3>

        <div style={{height:"60px"}}></div>

        <Button
          onClick={()=>{
            console.log("owner:", owner)
            console.log("drops:", drops)
            console.log("airMint:", airMint) 
            console.log("setDrops:", amount)
            web3jshelper.querySPLDeposits( owner, airMint).then(async (spls)=>{
              console.log("spls:", spls);

              if(spls.length === 0) {
                alert("No token found in this account");
              }
              
              else if(spls.length === 1) {
               await web3jshelper.sendSPL(owner, drops, airMint, amount, spls[0])
               setAppState("success");
              }
              
              else {
                SetSpls(spls);
                setIsOpen(true);
              }              
            })
          }}
        >
          Direct transfer
        </Button>

        <div style={{height:"40px"}}></div>

        <Button
          onClick={()=>{
            console.log("owner:", owner)
            console.log("drops:", drops)
            console.log("airMint:", airMint) 
            console.log("setDrops:", amount)
            web3jshelper.mintSPL(owner, drops, airMint, amount)
          }}
        >
          Direct Mint
        </Button>

        <div style={{height:"40px"}}></div>

        <Button
          onClick={btnClicked}
        >
          Self Claim
        </Button>

        <Modal onClose={close} isOpen={isOpen}>
          <ModalHeader>Please choose the address you want to send from</ModalHeader>
          <ModalBody>
            <Select
            options={spls.map((s) => {
              return {
                id: s, 
                label: s
              }
            })}
              value={tokenOption}
              placeholder="SPL account"
              onChange={splSelected}
            />
          </ModalBody>
          <ModalFooter>
            <ModalButton kind="tertiary" onClick={close}>
              Cancel
            </ModalButton>
            <ModalButton onClick={async () => {
              close();

              await web3jshelper.sendSPL(owner, drops, airMint, amount, sourceSpl)
              setAppState("success");
            }}>Send</ModalButton>
          </ModalFooter>
        </Modal>

        <div style={{height:"40px"}}></div>

      </FadeIn>
    </div>
  )
}

export default DropMethod;