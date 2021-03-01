import React from 'react';
import { Select } from "baseui/select";
import { Input } from "baseui/input";
import { DatePicker } from "baseui/datepicker";
import { Button } from "baseui/button";
import {
  Display4, H6
} from 'baseui/typography';

import axios from "axios";

const Condition = ({setAppState, setAccountList}) => {

  const [tokenOption, setTokenOption] = React.useState([
    { label: "Serum", id: "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt" }
  ])
  const [mint, setMint] = React.useState('SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt');
  const [minAmount, setMinAmount] = React.useState('');
  const [day, setDay] = React.useState(new Date());

  const [btnLoading, setBtnLoading] = React.useState(false);

  const tokenSelected = (params) => {
    console.log(params.value);
    setTokenOption(params.value);
    setMint(params.value[0].id);
  }

  const amountChanged = (e) => {
    setMinAmount(e.target.value);
  }

  const daySelected = ({ date }) => {
    setDay(date)
  }

  const fetchAccounts = () => {
    setBtnLoading(true);
    const amt = parseInt(minAmount);
    const tstamp = Math.floor(day.getTime() / 1000);

    const url = `https://spl-it.app/service/adfilter?mint=${mint}&amount=${amt}&start=${tstamp}`;

    console.log(url);

    axios.get(url,  { crossdomain: true })
    .then((res) => {
      const lst = res.data;
      setAccountList(lst);
      setAppState("result");
    })
/*
    setAccountList([{owner: "BAKAnydEEKcMjmm9MRktEPQqcvWvt9s9viCn91qyw81b" }]);
    setAppState("result");*/
  }

  return (
    <div>
      <div>
        <Display4 marginBottom="scale500">{'I want do airdop to accounts that hold'}</Display4>
        <Select
          options={[
            { label: "Serum", id: "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt" },
            { label: "Sushi", id: "AR1Mtgh7zAtxuxGd2XPovXPVjcSdY3i4rQYisNadjfKy" },
            { label: "YFI", id: "3JSf5tPeuscJGtaCp5giEiDhv51gQ4v3zWg8DGgyLfAB" },
            { label: "FTT", id: "AGFEad2et2ZJif9jaGpdMixQqvW5i81aBdvKe7PHNfz3" },
            { label: "USDC", id: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" },
          ]}
          value={tokenOption}
          placeholder="Token name"
          onChange={tokenSelected}
          />

        <div style={{height:"40px"}}></div>

        <Display4 marginBottom="scale500">{'with amount equal or more than'}</Display4>
        <Input
          value={minAmount + ''}
          onChange={amountChanged}
          placeholder="0"
          clearOnEscape
        />

        <div style={{height:"40px"}}></div>

        <Display4 marginBottom="scale500">{'at snapshot date'}</Display4>
        <DatePicker
          value={day}
          onChange={daySelected}
        />

        <div style={{height:"40px"}}></div>

        <Button
          onClick={fetchAccounts}
          isLoading={btnLoading}
        >
          Get accounts
        </Button>
        
      </div>
    </div>
  )
}

export default Condition;