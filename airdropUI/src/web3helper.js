import { Connection,
    Transaction,
    PublicKey,
    SystemProgram,
    sendAndConfirmTransaction,
    Account} from "@solana/web3.js";

import {Token, MintLayout, AccountLayout} from '@solana/spl-token'
import { Airdrop,airdropHeadSpace } from "splair.js";
import Wallet from "@project-serum/sol-wallet-adapter";

//const MAIN_NET = 'https://api.mainnet-beta.solana.com'
export const MAIN_NET = 'https://solana-api.projectserum.com'
//const MAIN_NET = 'https://devnet.solana.com'

export const TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
export const AIRDROP_PROGRAM = '3SWJqGhxuSm5CkZRZVtKEtCv4HMGo8zdy3Fe67ijqBnL'

class Web3jsHelper {


    async selectAccount() {
        this._wallet.connect()
    }

    constructor() {
        this._provider = MAIN_NET
        this._connection = new Connection(MAIN_NET)
        this._wallet =  null
    }

    set wallet(wallet) {
        this._wallet = wallet;
    }

    get connection() {
        return this._connection
    }

    get provider() {
        return this._provider
    }

    set provider(URL) {
        console.log("set endpoint to:", URL)
        this._provider = URL
        this._connection = new Connection(URL) 
    }

    async querySPLBalance(deposite) {
        const rspCtx = await this._connection.getTokenAccountBalance(deposite, 'recent')
        return rspCtx.value.uiAmoun
    }

    async queryMint(mint)  {
        let resp = await this._connection._rpcRequest('getAccountInfo', [
            mint,
            {
              encoding:'jsonParsed',
            }
        ])
        if (resp.error) {
            return null
        }
        if (null == resp.result.value) {
            return null;
        }
        let info= resp.result.value.data.parsed.info
        const mintInfo= {
            decimals:info.decimals,
            freezeAuthority:info.freezeAuthority,
            mintAuthority:info.mintAuthority,
            mint:mint
        }
        return mintInfo
    }

    async querySPLDeposits(owner, mint) {
        let resp = await this._connection._rpcRequest('getProgramAccounts', [
            TOKEN_PROGRAM,
            {
              encoding:'jsonParsed',
              commitment: 'recent',
              filters:[{"dataSize": 165},{"memcmp": {"offset": 32, "bytes": owner}},{"memcmp": {"offset": 0, "bytes": mint}}]
            }
        ])
        if (resp.error) {
            return null
        }
        let accounts = new Array() 
        if (resp.result != null && resp.result.length > 0) {
            for (let i = 0; i < resp.result.length; ++i)  {
                let account = resp.result[i].pubkey
                accounts.push(account)
            }
        } 
        console.log("accounts:", accounts)
        return accounts
    }
 
    async sendSPL(owner, accounts, mint, amount, source) {
        const trx= new Transaction()
        let sourceKey = new PublicKey(source)
        let accountKey = new PublicKey(owner)
        let signers = new Array()

        let mintInfo = await this.queryMint(mint)

        const balanceNeeded = await Token.getMinBalanceRentForExemptAccount( this._connection)

        for (let acc in accounts) {
            let splAccount = new Account();
            let ownerKey = new PublicKey(acc)
            let trxis =  this.createSPLAccountInstruction(accountKey, ownerKey,  splAccount, mint, balanceNeeded);
            for (let i = 0; i < trxis.length; ++i)  {
                trx.add(trxis[i]);
            }
            const trxi = Token.createTransferInstruction(
                new PublicKey(TOKEN_PROGRAM),
                sourceKey,
                splAccount.publicKey,
                accountKey,
                [], 
                amount * (10 ** mintInfo.decimals),
            );
            trx.add(trxi);
            signers.push(splAccount);
        }
        trx.setSigners(
            accountKey,
            ...signers.map((s) => s.publicKey)
          )
        trx.recentBlockhash = ( await this._connection.getRecentBlockhash('max') ).blockhash 
        trx.partialSign(...signers);
        //let signedTrx = await window.solong.signTransaction(trx) 
        let signedTrx = await this._wallet.signTransaction(trx) 
        return this._connection.sendRawTransaction(signedTrx.serialize())
    }

    async mintSPL(owner, accounts, mint, amount) {
        const trx= new Transaction()
        let accountKey = new PublicKey(owner)
        let signers = new Array()
        let mintKey = new PublicKey(mint)

        let mintInfo = await this.queryMint(mint)

        const balanceNeeded = await Token.getMinBalanceRentForExemptAccount( this._connection)

        for (let acc in accounts) {
            let splAccount = new Account();
            let ownerKey = new PublicKey(acc)
            let trxis =  this.createSPLAccountInstruction(accountKey, ownerKey,  splAccount, mint, balanceNeeded);
            for (let i = 0; i < trxis.length; ++i)  {
                trx.add(trxis[i]);
            }
            const trxi = Token.createMintToInstruction(
                new PublicKey(TOKEN_PROGRAM), 
                mintKey,
                splAccount.publicKey,
                accountKey,
                [],
                amount * (10 ** mintInfo.decimals),
            );
            trx.add(trxi);
            signers.push(splAccount);
        }

        trx.setSigners(
            accountKey,
            ...signers.map((s) => s.publicKey)
        )
        trx.recentBlockhash = ( await this._connection.getRecentBlockhash('max') ).blockhash 
        trx.partialSign(...signers);
        //let signedTrx = await window.solong.signTransaction(trx); 
        let signedTrx = await this._wallet.signTransaction(trx); 
        return this._connection.sendRawTransaction(signedTrx.serialize());
    }

    createSPLAccountInstruction(accountKey,ownerKey, splAccount, mint, balanceNeeded) {
        const createAccountTrxi =  SystemProgram.createAccount({
            fromPubkey: accountKey,
            newAccountPubkey: splAccount.publicKey,
            lamports: balanceNeeded,
            space: AccountLayout.span,
            programId: new PublicKey(TOKEN_PROGRAM),
        })

        const initAccountTrx =   Token.createInitAccountInstruction(
            new PublicKey(TOKEN_PROGRAM), 
            new PublicKey(mint),
            splAccount.publicKey,
            ownerKey,
        )

        return [createAccountTrxi, initAccountTrx]
    }

    async claimAirdrop(account, mint, amount, accounts) {
        let names = new Array();
        for (let acc in accounts) {
            names.push(new PublicKey(acc).toBuffer());
        }
        let accountKey = new PublicKey(account);
        let mintKey = new PublicKey(mint);
        let programID = new PublicKey(AIRDROP_PROGRAM);
        let authKey = null;
        let nonce = 0;

        let mintInfo = await this.queryMint(mint);

        for (let i=1; i<128; i++) {
            try {
                authKey = await PublicKey.createProgramAddress([accountKey.toBuffer(),Buffer.from([i])], programID)
            } catch(e) {
               continue 
            }
            nonce = i;
            console.log("nonce is ", nonce)
            console.log("auth is ", authKey.toBase58())
            break
        }
        if (authKey == null) {
            return new Promise((resolve, reject)=>{
                reject("can not find a nonce for publisher on createProgramAddress")
            })
        }

        // step1: create a spl account
        const splAccount = new Account();
        console.log("bank is :", splAccount.publicKey.toBase58())
        // step2: caculate ret
        const balanceNeeded = await Token.getMinBalanceRentForExemptAccount(
            this._connection,
        );

        // step3: create createAccount transaction instrument
        const createAccountTrxi =  SystemProgram.createAccount({
            fromPubkey: accountKey,
            newAccountPubkey: splAccount.publicKey,
            lamports: balanceNeeded,
            space: AccountLayout.span,
            programId: new PublicKey(TOKEN_PROGRAM),
        })
        // step4: ceate init account transaction instrucment
        const initAccountTrx =   Token.createInitAccountInstruction(
            new PublicKey(TOKEN_PROGRAM), 
            mintKey,
            splAccount.publicKey,
            authKey,
        )



        let airdropSpace = airdropHeadSpace+33*names.length;
        let airdropSpaceNeeded = await this._connection.getMinimumBalanceForRentExemption(airdropSpace);

        // step1: create a spl account
        const airdropAccount = new Account();
        console.log("airdrop is :", airdropAccount.publicKey.toBase58()) 
        const trxi0 =  SystemProgram.createAccount({
            fromPubkey: accountKey,
            newAccountPubkey: airdropAccount.publicKey,
            lamports: airdropSpaceNeeded,
            space: airdropSpace,
            programId: programID,
        });
        console.log("airdrop Key:", airdropAccount.publicKey.toBase58())
        console.log("names:", names)
      
        let trxi = Airdrop.createAirdropInstruction(
            programID,
            accountKey,
            splAccount.publicKey,
            mintKey,
            airdropAccount.publicKey,
            authKey,
            amount * (10 ** mintInfo.decimals),
            names.length,
            nonce,
            names 
        )
      
        // step5: create transaction
        const transaction = new Transaction()
        transaction.add(createAccountTrxi)
        transaction.add(initAccountTrx)
        transaction.add(trxi0);
        transaction.add(trxi);
      
        let signers= [splAccount, airdropAccount]; 


        transaction.setSigners(
            accountKey,
            ...signers.map((s) => s.publicKey)
        )
        transaction.recentBlockhash = ( await this._connection.getRecentBlockhash('max') ).blockhash 
        transaction.partialSign(...signers);
        //let signedTrx = await window.solong.signTransaction(transaction) 
        let signedTrx = await this._wallet.signTransaction(transaction) 
        try {
            await this._connection.sendRawTransaction(signedTrx.serialize())
            return new Promise((resolve, reject)=>{
                resolve({
                    "authKey":authKey.toBase58(),
                    "bankKey":splAccount.publicKey.toBase58(),
                    "airdrop":airdropAccount.publicKey.toBase58(),
                    "mint":mint,
                    "nonce":nonce,
                    "publisher": account,
                });
            }) 
        } catch(e) {
            console.log("airdrop:",e);
            return new Promise((resolve, reject)=>{
                reject(e);
            }) 
        }
    }

    async claim(account, mint, airdrop, auth, bank, publisher) {
        let accountKey = new PublicKey(account);
        let mintKey = new PublicKey(mint);
        let airdropKey = new PublicKey(airdrop);
        let authKey = new PublicKey(auth);
        let publisherKey = new PublicKey(publisher);
        let bankKey = new PublicKey(bank);
        let programID = new PublicKey(AIRDROP_PROGRAM);
        // step1: create a spl account
        let playerSPLAccount = new Account();
        console.log("player SPL is :",  playerSPLAccount.publicKey.toBase58())
        // step2: caculate ret
        const balanceNeeded = await Token.getMinBalanceRentForExemptAccount(
            this._connection,
        );
        // step3: create createAccount transaction instrument
        const createAccountTrxi =  SystemProgram.createAccount({
            fromPubkey: accountKey,
            newAccountPubkey: playerSPLAccount.publicKey,
            lamports: balanceNeeded,
            space: AccountLayout.span,
            programId: new PublicKey(TOKEN_PROGRAM),
        })
        // step4: ceate init account transaction instrucment
        const initAccountTrx =   Token.createInitAccountInstruction(
            new PublicKey(TOKEN_PROGRAM), 
            mintKey,
            playerSPLAccount.publicKey,
            accountKey,
        )


        let trxi = Airdrop.createClaimInstruction(
            programID,
            new PublicKey(TOKEN_PROGRAM),
            authKey,
            accountKey,
            publisherKey,
            bankKey,
            mintKey,
            airdropKey,
            playerSPLAccount.publicKey,
        );

        const transaction = new Transaction();
        transaction.add(createAccountTrxi);
        transaction.add(initAccountTrx);
        transaction.add(trxi);

        let signers= [playerSPLAccount];


        transaction.setSigners(
            accountKey,
            ...signers.map((s) => s.publicKey)
        )
        transaction.recentBlockhash = ( await this._connection.getRecentBlockhash('max') ).blockhash 
        transaction.partialSign(...signers);
        //let signedTrx = await window.solong.signTransaction(transaction) 
        let signedTrx = await this._wallet.signTransaction(transaction) 
        try {
            await this._connection.sendRawTransaction(signedTrx.serialize())
            return new Promise((resolve, reject)=>{
                resolve({
                    "deposit":playerSPLAccount.publicKey.toBase58(),
                    "mint":mint,
                });
            }) 
        } catch(e) {
            console.log("claim:",e);
            return new Promise((resolve, reject)=>{
                reject(e);
            }) 
        }
    }
}

export const web3jshelper = new Web3jsHelper()