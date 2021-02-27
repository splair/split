package solspider

import (
	"fmt"
)

const (
	major = 0
	minor = 1
	patch = 0
)

// Version return solana spider's version
func Version() string {
	return fmt.Sprintf("solspider[%d.%d.%d]", major, minor, patch)
}
