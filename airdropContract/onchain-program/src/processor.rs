//! Program state processor

use crate::{
    error::AirdropError,
    instruction::AirdropInstruction,
};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    program_pack::Pack,
    pubkey::Pubkey,
    program_error::ProgramError,
    program::invoke_signed,
    msg,
};
use arrayref::{array_mut_ref, array_ref, mut_array_refs, array_refs};


/// Program state handler.
pub struct Processor {}
impl Processor {
    const AIRDROP_INFO_HEAD_LEN: usize  =  113;
    const AIRDROP_INSTRUCTION_HEAD_LEN: usize = 18;
    /// Processes an [Instruction](enum.Instruction.html).
    pub fn process(program_id: &Pubkey, accounts: &[AccountInfo], input: &[u8]) -> ProgramResult {
        let instruction = AirdropInstruction::unpack(input)?;
        match instruction {
            AirdropInstruction::Airdrop{
                amount,
                count,
                nonce,
            }=>{
                msg!("AirdropInstruction::Initialize");
                Self::process_airdrop(program_id, accounts, amount, count, nonce, input)
            }

            AirdropInstruction::Claim =>{
                msg!("AirdropInstruction::Claim");
                Self::process_claim(program_id, accounts)
            }
        }
    }

    fn authority_id(
        program_id: &Pubkey,
        publisher_info: &Pubkey,
        nonce: u8,
    ) -> Result<Pubkey, AirdropError> {
        Pubkey::create_program_address(&[&publisher_info.to_bytes()[..32], &[nonce]], program_id)
            .or(Err(AirdropError::InvalidBankAddress))
    }

    /// Processes an [Initialize](enum.Instruction.html).
    pub fn process_airdrop(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        amount:u64,
        count:u64,
        nonce:u8,
        input: &[u8],
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let publisher_info= next_account_info(account_info_iter)?;
        let bank_info= next_account_info(account_info_iter)?;
        let mint_info = next_account_info(account_info_iter)?;
        let airdrop_info = next_account_info(account_info_iter)?;
        let authority_info = next_account_info(account_info_iter)?;

        if airdrop_info.data_len() != (Self::AIRDROP_INFO_HEAD_LEN + (count as usize)*33){
            return Err(AirdropError::InvalidAirdropSize.into());
        }

        let bank_account = spl_token::state::Account::unpack(&bank_info.data.borrow())?;
        if mint_info.key != &bank_account.mint {
            return Err(AirdropError::MintMismatch.into());
        }

        if !publisher_info.is_signer {
            return Err(AirdropError::MissingRequiredSignature.into());
        }

        if &bank_account.owner != authority_info.key {
            return Err(AirdropError::BankMissPublisher.into());
        }

        if *authority_info.key  != Self::authority_id(program_id, publisher_info.key, nonce)? {
            return Err(AirdropError::InvalidBankAddress.into());
        }


        let airdrop_data = &mut airdrop_info.data.borrow_mut();
        let airdrop_buf = array_mut_ref![airdrop_data, 0, 113];
        let (
            publisher_buf,
            nonce_buf,
            mint_buf,
            bank_buf,
            amount_buf,
            count_buf, 
        ) = mut_array_refs![airdrop_buf, 32, 1, 32, 32, 8, 8];
        publisher_buf.copy_from_slice(publisher_info.key.as_ref());
        nonce_buf[0] =  nonce;
        mint_buf.copy_from_slice(mint_info.key.as_ref());
        bank_buf.copy_from_slice(bank_info.key.as_ref());
        *amount_buf = amount.to_le_bytes();
        *count_buf = count.to_le_bytes();

        for i in 0..count {
            let s = Self::AIRDROP_INSTRUCTION_HEAD_LEN+(32*i) as usize;
            let e = Self::AIRDROP_INSTRUCTION_HEAD_LEN+(32*(i+1)) as usize;
            let s_buf = Self::AIRDROP_INFO_HEAD_LEN+((32+1)*i) as usize;
            let e_buf = Self::AIRDROP_INFO_HEAD_LEN+((32+1)*i+32) as usize;
            airdrop_data[s_buf .. e_buf].copy_from_slice(&input[s .. e]);
            airdrop_data[e_buf] = 0;
        }

        Ok(())
    }

    /// Processes an [Initialize](enum.Instruction.html).
    pub fn process_claim(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let token_info= next_account_info(account_info_iter)?;
        let authority_info= next_account_info(account_info_iter)?;
        let player_info= next_account_info(account_info_iter)?;
        let publisher_info= next_account_info(account_info_iter)?;
        let bank_info= next_account_info(account_info_iter)?;
        let mint_info = next_account_info(account_info_iter)?;
        let airdrop_info = next_account_info(account_info_iter)?;
        let player_spl_info = next_account_info(account_info_iter)?;

        // 1. bank should be an account of mint
        let bank_account = spl_token::state::Account::unpack(&bank_info.data.borrow())?;
        if mint_info.key != &bank_account.mint {
            return Err(AirdropError::MintMismatch.into());
        }

        // 2. player_spl should be an an account of mint
        let player_spl_account = spl_token::state::Account::unpack(&player_spl_info.data.borrow())?;
        if mint_info.key != &player_spl_account.mint {
            return Err(AirdropError::MintMismatch.into());
        }

        // 3. player_spl's owner should be player
        if &player_spl_account.owner != player_info.key {
            return Err(AirdropError::OwnerMismatch.into());
        }

        // 4. player is the signer
        if ! player_info.is_signer {
            return Err(AirdropError::MissingRequiredSignature.into());
        }
        

        let airdrop_data = &mut airdrop_info.data.borrow_mut();
        let airdrop_buf = array_ref![airdrop_data, 0, 113];
        let (
            publisher_buf,
            nonce_buf,
            mint_buf,
            bank_buf,
            amount_buf,
            count_buf, 
        ) = array_refs![airdrop_buf, 32, 1, 32, 32, 8, 8];
        let publisher = Pubkey::new(&publisher_buf[..]);
        let mint = Pubkey::new(&mint_buf[..]);
        let bank = Pubkey::new(&bank_buf[..]);
        let nonce = nonce_buf[0];
        let amount = u64::from_le_bytes(*amount_buf);
        let count = u64::from_le_bytes(*count_buf);

        // 5. authority is the as getprogrammaddress
        if *authority_info.key  != Self::authority_id(program_id, publisher_info.key, nonce)? {
            return Err(AirdropError::InvalidBankAddress.into());
        }

        // 6. mint is the same one stored in publisher
        if &mint != mint_info.key {
            return Err(AirdropError::WrongMint.into());
        }

        // 7. publisher is the same one stored in publisher
        if &publisher != publisher_info.key {
            return Err(AirdropError::WrongPublisher.into());
        }
        
        // 8. bank is the same one stored in publisher
        if &bank != bank_info.key {
            return Err(AirdropError::WrongMint.into());
        }

        // 9. bank's owner should be authority
        if &bank_account.owner != authority_info.key {
            return Err(AirdropError::BankMissPublisher.into());
        }

        for i in 0..count {
            let s_buf = Self::AIRDROP_INFO_HEAD_LEN+((32+1)*i) as usize;
            let e_buf = Self::AIRDROP_INFO_HEAD_LEN+((32+1)*i + 32) as usize;
            let p = Pubkey::new(&airdrop_data[s_buf .. e_buf]);
            if p == *player_info.key {
                if airdrop_data[e_buf] == 1 {
                    return Err(AirdropError::AlreadyClaim.into());
                } else {
                    // send SPL
                    Self::token_transfer(
                        &publisher,
                        token_info.clone(),
                        bank_info.clone(),
                        player_spl_info.clone(),
                        authority_info.clone(),
                        nonce,
                        amount,
                    )?;
                    airdrop_data[e_buf] = 1;
                    break
                }
            }
        }
        Ok(())
    }


    /// Issue a spl_token `Transfer` instruction.
    pub fn token_transfer<'a>(
        publisher: &Pubkey,
        token_program: AccountInfo<'a>,
        source: AccountInfo<'a>,
        destination: AccountInfo<'a>,
        authority: AccountInfo<'a>,
        nonce: u8,
        amount: u64,
    ) -> Result<(), ProgramError> {
        let publisher_bytes = publisher.to_bytes();
        let authority_signature_seeds = [&publisher_bytes[..32], &[nonce]];
        let signers = &[&authority_signature_seeds[..]];
        let ix = spl_token::instruction::transfer(
            token_program.key,
            source.key,
            destination.key,
            authority.key,
            &[],
            amount,
        )?;
        invoke_signed(
            &ix,
            &[source, destination, authority, token_program],
            signers,
        )?;
        Ok(())
    }
}
