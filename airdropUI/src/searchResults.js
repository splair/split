import React from 'react';
import { Input } from "baseui/input";
import { Button } from "baseui/button";
import {
  Display4,
} from 'baseui/typography';
import FadeIn from 'react-fade-in';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalButton,
} from 'baseui/modal';

const SearchResults = ({accountList, setAppState, setDrops, airMint, setAmount}) => {

  const [value, setValue] = React.useState([]);

  const [isOpen, setIsOpen] = React.useState(false);

  function close() {
    setIsOpen(false);
  }

  const amountChanged = (e) => {
    setValue(e.target.value);
    setAmount(parseFloat(e.target.value))
  }

  const totalAmount = React.useMemo(() => {
    const val = isNaN(parseFloat(value)) ? 0 : parseFloat(value);
    return val * accountList.length;
  }, [value])

  return (
    <div>
      <FadeIn>
        <Display4 marginBottom="scale500">{`We have found` } <span style={{textDecoration: 'underline', color: 'pink'}} onClick={()=>{setIsOpen(true)}}>{accountList.length}</span> {`accounts for you`}</Display4>
        
        <div style={{height:"40px"}}></div>

        <Display4 marginBottom="scale500">{`How many tokens you want to airdrop to each account`}</Display4>

        <Input
          value={value}
          onChange={amountChanged}
          placeholder="0"
          clearOnEscape          
        />

        <div style={{height:"40px"}}></div>
        <Display4 marginBottom="scale500">{`that makes ${totalAmount} tokens totally needed`}</Display4>

        <div style={{height:"40px"}}></div>

        <Button
          onClick={() => {
            let ds = {};

            for(const accout of accountList) {
              ds[accout.owner] = parseFloat(value);
            }

            setDrops(ds);
            setAppState("drop");
          }}
        >
          Let's do it
        </Button>

        <Modal onClose={close} isOpen={isOpen}>
          <ModalHeader>Accounts:</ModalHeader>
          <ModalBody>
          <div>
            {
              accountList.map((a) => <div style={{marginBottom: "10px"}}>{a.owner}</div>)
            }  
          </div>
          </ModalBody>
          <ModalFooter>
            <ModalButton onClick={() => {
              close();
            }}>Ok</ModalButton>
          </ModalFooter>
        </Modal>

      </FadeIn>
    </div>
  )
}

export default SearchResults;