package solspider

type options struct {
	rpcAddrs []string
	coins    []string
}

func defaultOptions() options {
	return options{
		rpcAddrs: []string{},
		coins:    []string{},
	}
}

// Option configures how we set up the spider.
type Option interface {
	apply(*options)
}

type funcOption struct {
	f func(*options)
}

func (fdo *funcOption) apply(do *options) {
	fdo.f(do)
}

func newFuncOption(f func(*options)) *funcOption {
	return &funcOption{
		f: f,
	}
}

// WithRPCAddrs determines which addr to connect to
func WithRPCAddrs(addrs []string) Option {
	return newFuncOption(func(o *options) {
		o.rpcAddrs = addrs
	})
}

// WithCoins determines which spl coins
func WithCoins(coins []string) Option {
	return newFuncOption(func(o *options) {
		o.coins = coins
	})
}
