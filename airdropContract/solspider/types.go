package solspider

// RPCResult  is result for JSON RPC
type RPCResult struct {
	Context struct {
		Slot int `json:"slot"`
	} `json:"context"`
	Value interface{} `josn:"value,omitempty"`
}

// CommitmentConfig is commitment
type CommitmentConfig struct {
	Commitment string `json:"commitment"`
}

// RPCFilterMemcmp is memcmp dictnionry
type RPCFilterMemcmp struct {
	Offset int    `json:"offset"`
	Bytes  string `json:"bytes"`
}

// GetProgramAccountsFilter is filter for GetProgramAccountsOpts
type GetProgramAccountsFilter struct {
	Memcmp   *RPCFilterMemcmp `json:"memcmp,omitempty"`
	DataSize uint64           `json:"dataSize,omitempty"`
}

// GetProgramAccountsOpts is optional for GetProgramAccounts
type GetProgramAccountsOpts struct {
	Encoding   string                     `json:"encoding"`
	Commitment string                     `json:"commitment"`
	Filters    []GetProgramAccountsFilter `json:"filters,omitempty"`
}

// AccountInfo for GetProgramAccounts
type AccountInfo struct {
	Account struct {
		Data struct {
			Parsed struct {
				Info struct {
					IsNative    bool   `json:"isNative"`
					Mint        string `json:"mint"`
					Owner       string `json:"owner"`
					State       string `json:"state"`
					TokenAmount struct {
						Amount   string  `json:"amount"`
						Decimals int     `json:"decimals"`
						UIAmount float64 `json:"uiAmount"`
					} `json:"tokenAmount"`
				} `json:"info"`
				Type string `json:"type"`
			} `json:"parsed"`
			Program string `json:"program"`
			Space   int    `json:"space"`
		} `json:"data"`
		Executable bool   `json:"executable"`
		Lamports   int    `json:"lamports"`
		Owner      string `json:"owner"`
		RentEpoch  int    `json:"rentEpoch"`
	} `json:"account"`
	Pubkey string `json:"pubkey"`
}
