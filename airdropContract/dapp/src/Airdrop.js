/**
 * @flow
 */

import { 
    PublicKey,
    SystemProgram,
    Account,
    TransactionInstruction,
    Transaction,
    sendAndConfirmTransaction,
    SYSVAR_CLOCK_PUBKEY } from "@solana/web3.js"
import {u64} from '@solana/spl-token'
import {intFromBytes} from './utils'
import * as Layout from './Layout';
import * as BufferLayout from 'buffer-layout';
import {Token, AccountLayout} from '@solana/spl-token';

export const TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'

/**
 * Airdrop
 */
export class Airdrop {
    /**
     * Construct an  Initialize instruction
     *
     */
    static createAirdropInstruction(
        programID,
        publisherKey,
        bankKey,
        mintKey,
        airdropKey,
        authKey,
        amount,
        count,
        nonce,
        names
    ) {

        const dataLayout = BufferLayout.struct([
            BufferLayout.u8("i"),
            BufferLayout.blob(8,"amount"),
            BufferLayout.blob(8,"count"),
            BufferLayout.u8("nonce"),
        ]);
      
        const data = Buffer.alloc(dataLayout.span+count*32);
        dataLayout.encode(
            {
              i:1, // airdrop instruct 
              amount:new u64(amount).toBuffer(),
              count:new u64(count).toBuffer(),
              nonce:nonce,
            },
            data,
        );
        console.log("names:", names)

        for (let i=0; i<count; i++) {
            names[i].copy(data,dataLayout.span+i*32)
        }
        console.log("data is ", data)
      
        let keys = [
            {pubkey: publisherKey, isSigner: true, isWritable: true},
            {pubkey: bankKey, isSigner: false, isWritable: true},
            {pubkey: mintKey, isSigner: false, isWritable: true},
            {pubkey: airdropKey, isSigner: false, isWritable: true},
            {pubkey: authKey, isSigner: false, isWritable: true},
        ];

        const  trxi = new TransactionInstruction({
            keys,
            programId: programID,
            data,
        });
        return trxi;
    }

    /**
     * Construct an  Claim instruction
     *
     */
    static createClaimInstruction(
        programID,
        tokenProgramKey,
        authorityKey,
        playerKey,
        publisherKey,
        bankKey,
        mintKey,
        airdropKey,
        playerSPLKey,
    ) {
        const dataLayout = BufferLayout.struct([
            BufferLayout.u8("i"),
        ]);
      
        const data = Buffer.alloc(dataLayout.span);
        dataLayout.encode(
            {
              i:2, // claim instruct 
            },
            data,
        );
      
        let keys = [
            {pubkey: tokenProgramKey, isSigner: false, isWritable: true},
            {pubkey: authorityKey, isSigner: false, isWritable: true},
            {pubkey: playerKey, isSigner: true, isWritable: true},
            {pubkey: publisherKey, isSigner: false, isWritable: true},
            {pubkey: bankKey, isSigner: false, isWritable: true},
            {pubkey: mintKey, isSigner: false, isWritable: true},
            {pubkey: airdropKey, isSigner: false, isWritable: true},
            {pubkey: playerSPLKey, isSigner: false, isWritable: true},
        ];

        const  trxi = new TransactionInstruction({
            keys,
            programId: programID,
            data,
        });
        return trxi;
    }

    static async GetAirdrop(
        connection,
        airdropKey,
    ) {
        let resp = await connection._rpcRequest('getAccountInfo', [
            airdropKey.toBase58(),
            {
              encoding:'jsonParsed',
              commitment: 'recent',
            }
        ])
        if (resp.result  ) {
            const result = resp.result;
            //console.log("result:",result)
            const airdrop_buf = result.value.data[0];
            const airdrop= Buffer.from(airdrop_buf, 'base64');
            
            const count = intFromBytes(airdrop.slice(105,113));
            for(let i=0; i< count; i++) {
                const index = 113
                const key =  new PublicKey(airdrop.slice(index+i*33,index+i*33+32)); 
                const status =  airdrop[index+i*33+32]
                console.log("key :", key.toBase58() , " status:", status)
            }
        } else {
            return null;
        }
    }

    static async airdrop(
        connection,
        programID,
        publisherAccount,
        mintKey,
        amount,
        names 
    ) {
        let authKey = null;
        let nonce = 0;
        for (let i=1; i<128; i++) {
            try {
                authKey = await PublicKey.createProgramAddress([publisherAccount.publicKey.toBuffer(),Buffer.from([i])], programID)
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
            connection,
        );

        // step3: create createAccount transaction instrument
        const createAccountTrxi =  SystemProgram.createAccount({
            fromPubkey: publisherAccount.publicKey,
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



        let airdropSpace = Layout.airdropHeadSpace+33*names.length;
        let airdropSpaceNeeded = await connection.getMinimumBalanceForRentExemption(airdropSpace);

        // step1: create a spl account
        const airdropAccount = new Account();
        console.log("airdrop is :", airdropAccount.publicKey.toBase58()) 
        const trxi0 =  SystemProgram.createAccount({
            fromPubkey: publisherAccount.publicKey,
            newAccountPubkey: airdropAccount.publicKey,
            lamports: airdropSpaceNeeded,
            space: airdropSpace,
            programId: programID,
        });
        console.log("airdrop Key:", airdropAccount.publicKey.toBase58())
      
        let trxi = Airdrop.createAirdropInstruction(
            programID,
            publisherAccount.publicKey,
            splAccount.publicKey,
            mintKey,
            airdropAccount.publicKey,
            authKey,
            amount,
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
      
        let signers= [publisherAccount, splAccount, airdropAccount];
        try {
            await sendAndConfirmTransaction(connection, transaction, signers, {
                skipPreflight: false,
                commitment: 'recent',
                preflightCommitment: 'recent',
            })
            return new Promise((resolve, reject)=>{
                resolve({
                    "authKey":authKey.toBase58(),
                    "bankKey":splAccount.publicKey.toBase58(),
                    "airdrop":airdropAccount.publicKey.toBase58(),
                    "nonce":nonce,
                });
            }) 
        } catch(e) {
            console.log("airdrop:",e);
            return new Promise((resolve, reject)=>{
                reject(e);
            }) 
        }
    }
}