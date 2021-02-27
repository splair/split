//! Error type


use num_derive::FromPrimitive;
use solana_program::{decode_error::DecodeError, 
    program_error::ProgramError,
    msg,
    program_error::PrintProgramError};
use thiserror::Error;
use num_traits::FromPrimitive;

/// Errors that may be returned by the airdrop program.
#[derive(Clone, Debug, Eq, Error, FromPrimitive, PartialEq)]
pub enum AirdropError {
    /// Invalid instruction
    #[error("Invalid instruction")]
    InvalidInstruction,

    /// Invalid BankAddress
    #[error("Invalid BankAddress")]
    InvalidBankAddress,

    /// Invalid Airdrop size
    #[error("Invalid Airdrop size")]
    InvalidAirdropSize,

    /// Invalied Bank info
    #[error("Invalied Bank info")]
    InvalidBankInfo,

    /// Already claim
    #[error("Already claim")]
    AlreadyClaim,

    /// Mint dose not match
    #[error("Mint dose not match")]
    MintMismatch,

    /// Miss signature for account
    #[error("Miss signature for account")]
    MissingRequiredSignature,

    /// SPL account's owner is not player account
    #[error("SPL account's owner is not player account")]
    OwnerMismatch,

    /// Mint is not match publish account
    #[error("Mint is not match publish account")]
    WrongMint,

    /// Publiser is not match publish account
    #[error("Publiser is not match publish account")]
    WrongPublisher,

    /// Bank is not match publish account
    #[error("Bank is not match publish account")]
    WrongBank,


    /// Bank's owner is not publisher
    #[error("Bank's owner is not publisher")]
    BankMissPublisher 
}
impl From<AirdropError> for ProgramError {
    fn from(e: AirdropError) -> Self {
        ProgramError::Custom(e as u32)
    }
}
impl<T> DecodeError<T> for AirdropError {
    fn type_of() -> &'static str {
        "AirdropError"
    }
}


impl PrintProgramError for AirdropError {
    fn print<E>(&self)
    where
        E: 'static + std::error::Error + DecodeError<E> + PrintProgramError + FromPrimitive,
    {
        match self {
            AirdropError::InvalidInstruction => msg!("Invalid instruction"),
            AirdropError::InvalidBankAddress => msg!("Invalid BankAddress"),
            AirdropError::InvalidAirdropSize => msg!("Invalid Airdrop size"),
            AirdropError::InvalidBankInfo => msg!("Invalied Bank info"),
            AirdropError::AlreadyClaim => msg!("Already claim"),
            AirdropError::MintMismatch => msg!("Mint dose not match"),
            AirdropError::MissingRequiredSignature => msg!("Miss signature for account"),
            AirdropError::OwnerMismatch => msg!("SPL account's owner is not player account"),
            AirdropError::WrongMint => msg!("Mint is not match publish account"),
            AirdropError::WrongPublisher => msg!("Publiser is not match publish account"),
            AirdropError::WrongBank => msg!("Bank is not match publish account"),
            AirdropError::BankMissPublisher => msg!("Bank's owner is not publisher"),
        }
    }
}