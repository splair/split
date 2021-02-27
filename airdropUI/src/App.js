import React from 'react';
import logo from './logo.svg';
import ChooseToken from './chooseToken';
import Condition from './condition';
import ManualInput from './manualInput';
import UploadOrCondition from './uploadOrCondition';
import SearchResults from './searchResults';
import DropMethod from './dropMethod';
import Success from './success';
import Tutorial from './tutorial';
import Claim from './claim';

import {Spinner} from 'baseui/spinner';
import {StyledLink} from 'baseui/link';

import './App.css';
import { Button } from 'baseui/button';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

function App() {

  const [appState, setAppState] = React.useState("choose");
  const [airMint, setAirMint] = React.useState(""); 
  const [accountList, setAccountList] = React.useState([]);
  const [drops, setDrops] = React.useState({}) 
  const [account, setAccount] = React.useState(null)
  const [amount, setAmount] = React.useState(0)

  const [claims, setClaims] = React.useState(null)

  const mainComp = React.useMemo(() => {
    switch(appState) {
      case "choose": 
        return <ChooseToken setAirMint={setAirMint} setAppState={setAppState}/>
      case "uploadOrCondition":
        return <UploadOrCondition setAppState={setAppState}/>
      case "input": 
        return <ManualInput setAppState={setAppState} setAccountList={setAccountList} />
      case "condition": 
        return <Condition setAppState={setAppState} setAccountList={setAccountList} />
      case "result":
        return <SearchResults setAppState={setAppState} setDrops={setDrops} accountList={accountList} airMint={airMint} setAmount={setAmount} />
      case "drop":
        return <DropMethod owner={account} drops={drops} airMint={airMint} amount={amount} setClaims={setClaims} setAppState={setAppState}  />
      case "claim":
        return <Claim  drops={drops} airMint={airMint} amount={amount} claims={claims} setAppState={setAppState} />
      case "success":
        return <Success setAppState={setAppState} />
      case "loading": 
        return (
          <div>
            <Spinner />
          </div>)
      
      default:
        return <div></div>
    }
  }, [appState])


  return (

    <Router>
    <div>
      {/* A <Switch> looks through its children <Route>s and
          renders the first one that matches the current URL. */}
      <Switch>
        <Route path="/tutorial">
          <div>
            <Tutorial />
          </div>
        </Route>
        <Route path="/">
  
        <div className="App">
          <div style={{  display: "flex", width: "100%", flexDirection: "column", alignItems: "center"}}>
            <header className="App-header">
              <p>
                SPLit - we need air and airdrop
              </p>
              {account &&
                <div style={{fontSize: '12px'}}>{account}</div>
              }
            </header>
      
            {account ? mainComp :  (
            <div style={{color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <div style={{fontSize: "40px"}}>Please connect your wallet first</div>
              <div style={{height: "36px"}}></div>
              <Button
                  onClick={() => {
                    // TODO connect solong
                    if (!window.solong) { 
                      console.log("please install Solong Extension from chrome");
                      return ; 
                    }

                    window.solong.selectAccount().then((account) => { 
                      console.log("connect account with ", account) 
                      setAccount(account)
                    });
                  }}
                >Connect Wallet
              </Button>

              <div style={{fontSize: "24px", marginTop: "80px"}}>
                <StyledLink href='https://www.spl-token-ui.com/#/'>Check here if you want to mint a token</StyledLink>
              </div>
            </div>)}
          </div>
        </div>
        </Route>
      </Switch>
    </div>
  </Router>

  );
}

export default App;
