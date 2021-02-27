import React from 'react';
import { Textarea } from "baseui/textarea";
import { Button } from "baseui/button";
import {
  Display3,
  Display4,
} from 'baseui/typography';
import FadeIn from 'react-fade-in';


const ManuallyInput = ({setAccountList, setAppState}) => {

  const [value, setValue] = React.useState('');

  return (
    <div>
      <FadeIn>
        <Display3 marginBottom="scale500">{'Input the accounts you want to airdrop to'}</Display3>
        <Textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Please seperate by ; eg. BgX6SzpeZrDMyNTph4BZqfHQszBZM7JdPwAUXzh1NnS8;DC5LqdUzvuv37HGxxqAXaim7yRyr9YX7b56YuN5W4hAG"
          clearOnEscape
        />
        <div style={{height:"40px"}}></div>
        <Button
          onClick={() =>{
            const acs = value.split(";").map((a) => {
              let newac = {
                owner: a,
                amount: 0
              }

              return newac;
            })
            
            setAccountList(acs);
            setAppState("result")
          }}
        >
          Next
        </Button>
      </FadeIn>
    </div>
  )

}

export default ManuallyInput;