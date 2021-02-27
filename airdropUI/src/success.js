import React from 'react';
import { Input } from "baseui/input";
import { Button } from "baseui/button";
import {
  Display3,
  Display4,
} from 'baseui/typography';
import FadeIn from 'react-fade-in';

const Success = ({claims, setAppState}) => {

  const [value, setValue] = React.useState('');

  return (
    <div>
      <FadeIn>
      <Display3 marginBottom="scale500">{'Congratulations! Your airdrops are on their way!'}</Display3>
    </FadeIn>
    </div>
  )

}

export default Success;