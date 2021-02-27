package solspider

import (
	"encoding/json"
	"fmt"

	"github.com/cz-theng/czkit-go/log"
	"github.com/ethereum/go-ethereum/rpc"
)

// Connection is a connection to API node
type Connection struct {
	client *rpc.Client
}

// NewConnection create a connection to endpoint
func NewConnection(endpoints []string, commitment string) (c *Connection, remains []string) {
	c = &Connection{}
	for i, ep := range endpoints {

		cli, err := rpc.Dial(ep)
		if err != nil {
			log.Error("RPC:%s is down", ep)
			continue
		}
		log.Info("RPC server is %s", ep)
		c.client = cli
		remains = endpoints[i:]

		break
	}
	return c, remains
}

// GetProgramAccounts Fetch all the account info for the specified public key, return with context
func (c *Connection) GetProgramAccounts(publicKey string, opts *GetProgramAccountsOpts) ([]AccountInfo, error) {
	var result []AccountInfo
	args, _ := json.Marshal(opts)
	println("args:", string(args))

	err := c.client.Call(&result, "getProgramAccounts", publicKey, opts)
	if err != nil {
		return nil, fmt.Errorf("GetProgramAccounts with error %s", err.Error())
	}
	return result, nil
}
