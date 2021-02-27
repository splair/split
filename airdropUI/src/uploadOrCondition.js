import React from 'react';
import { Radio, RadioGroup, ALIGN } from "baseui/radio";
import {
  Display4, H6
} from 'baseui/typography';


const Condition = ({setAppState}) => {

  const [value, setValue] = React.useState("!");

  const methodSelected = (e) => {
    console.log(e.target.value);
    setValue(e.target.value);

    if(e.target.value === "1") {
      setAppState("input");
    } else {
      setAppState("condition");
    }
    
  }

  return (
    <div>
      <div>
        <Display4 marginBottom="scale500">{'How you want select the accounts you choose'}</Display4>
        <RadioGroup
          value={value}
          onChange={methodSelected}
          name="number"
          align={ALIGN.vertical}
        >
          <Radio value="1">Manually upload</Radio>
          <Radio value="2">Find accounts of interests</Radio>
        </RadioGroup>
      </div>
    </div>
  )
}

export default Condition;