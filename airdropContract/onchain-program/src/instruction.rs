//! Instruction types

use crate::{
    error::AirdropError,
};
use solana_program::{
    program_error::ProgramError,
};
use std::mem::size_of;
use std::convert::TryInto;

/// Instructions supported by the airdrop program.
#[repr(C)]
#[derive(Debug)]
pub enum AirdropInstruction {
    /// Airdrop Instruction
    Airdrop {
        /// amount of airdrop
        amount : u64,
        /// count of member
        count: u64,
        /// nonce of bank
        nonce: u8,
    },

    /// Claim Instruction
    Claim ,
}


impl AirdropInstruction {
    /// Unpacks a byte buffer into a [AirdropInstruction](enum.AirdropInstruction.html).
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        use AirdropError::InvalidInstruction;

        let (&tag, rest) = input.split_first().ok_or(InvalidInstruction)?;
        Ok(match tag { 
            1 => {
                let (amount, rest) = Self::unpack_u64(rest)?;
                let (count, rest) = Self::unpack_u64(rest)?;
                let (&nonce, _rest) = rest.split_first().ok_or(InvalidInstruction)?;
                Self::Airdrop{
                    amount,
                    count,
                    nonce,
                }
            } 
            2 => Self::Claim,
            
            _ => return Err(AirdropError::InvalidInstruction.into()),
        })
    }


    /// Packs a [AirdropInstruction](enum.AirdropInstruction.html) into a byte buffer.
    pub fn pack(&self) -> Vec<u8> {
        let mut buf : Vec<u8>;
        let self_len= size_of::<Self>();
        match &*self {
            Self::Airdrop {
                amount,
                count,
                nonce:_,
            } => {
                buf = Vec::with_capacity(self_len);
                buf.push(1); 
                buf.extend_from_slice(&amount.to_le_bytes());
                buf.extend_from_slice(&count.to_le_bytes());
                // TODO : add nonce
            }

            Self::Claim => {
                buf = Vec::with_capacity(self_len);
                buf.push(2); 
                // TODO : add nonce
            }

        };
        buf
    }    

    fn unpack_u64(input: &[u8]) -> Result<(u64, &[u8]), ProgramError> {
        if input.len() >= 8 {
            let (amount, rest) = input.split_at(8);
            let amount = amount
                .get(..8)
                .and_then(|slice| slice.try_into().ok())
                .map(u64::from_le_bytes)
                .ok_or(AirdropError::InvalidInstruction)?;
            Ok((amount, rest))
        } else {
            Err(AirdropError::InvalidInstruction.into())
        }
    }
}