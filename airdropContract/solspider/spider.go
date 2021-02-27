package solspider

import (
	"context"
	"errors"
	"reflect"
	"strings"
	"time"

	"github.com/cz-theng/czkit-go/log"
	"github.com/splair/airdrop/solspider/db"

	"go.mongodb.org/mongo-driver/mongo"
	mngopts "go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

// Spider is the main service
type Spider struct {
	opts     options
	ctx      context.Context
	cli      *Connection
	dbClient *mongo.Client
	db       *mongo.Database
}

// Init create and init a zap SugarLogger
func (s *Spider) Init(opts ...Option) (err error) {
	err = nil
	for _, opt := range opts {
		opt.apply(&s.opts)
	}
	s.ctx = context.Background()
	err = s.reconnect()
	if err != nil {
		log.Error("Init with reconnect error:%s", err.Error())
		return err
	}
	err = s.initDB()
	if err != nil {
		log.Error("init db error:", err.Error())
		return
	}
	return
}

func (s *Spider) initDB() (err error) {
	s.dbClient, err = mongo.NewClient(mngopts.Client().ApplyURI("mongodb+srv://cz:Solong2020@cluster0.g9w77.mongodb.net/solana-spl?retryWrites=true"))
	//s.dbClient, err = mongo.NewClient(mngopts.Client().ApplyURI("mongodb://cz:Solong2020@cluster0.g9w77.mongodb.net/solana-spl?retryWrites=true"))
	if err != nil {
		log.Error("new client error: %s", err.Error())
		return
	}
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	err = s.dbClient.Connect(ctx)
	if err != nil {
		log.Error("connect mongo error:%s", err.Error())
		return
	}

	err = s.dbClient.Ping(ctx, readpref.Primary())
	if err != nil {
		log.Error("ping mongo error:%s", err.Error())
	} else {
		log.Info("connect mongo success")
	}

	s.db = s.dbClient.Database("solana-spl")
	if s.db == nil {
		log.Error("db solana-spl is null, please init db first")
		return
	}
	return
}

// Start start the spider
func (s *Spider) Start() (err error) {
	for _, coin := range s.opts.coins {
		for {
			err = s.snapSPLAccounts(coin)
			if err == nil {
				break
			}
			log.Error("snapSPLAccounts error:%v %v", err, reflect.TypeOf(err))
			err = s.reconnect()
			if err != nil {
				return err
			}
		}
	}
	return nil
}

func (s *Spider) reconnect() error {
	s.opts.rpcAddrs = s.opts.rpcAddrs[1:]
	cli, remains := NewConnection(s.opts.rpcAddrs, "")
	s.cli = cli
	s.opts.rpcAddrs = remains
	if nil == remains || len(remains) == 0 {
		return errors.New("no more rpcs")
	}
	return nil
}

func (s *Spider) snapSPLAccounts(coin string) (err error) {
	var filters []GetProgramAccountsFilter
	dsf := GetProgramAccountsFilter{
		DataSize: 165,
	}
	filters = append(filters, dsf)
	tf := GetProgramAccountsFilter{
		Memcmp: &RPCFilterMemcmp{
			Offset: 0,
			Bytes:  coin,
		},
	}
	filters = append(filters, tf)
	opts := &GetProgramAccountsOpts{
		Encoding: "jsonParsed",
		//Commitment: "finalized",
		Filters: filters,
	}
	accounts, err := s.cli.GetProgramAccounts("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA", opts)
	if err != nil {
		log.Error("GetProgramAccounts with error %s", err.Error())
		return
	}
	log.Info("GetProgramAccounts with %d accounts", len(accounts))
	nowTS := time.Now().Unix()
	splTbl := s.db.Collection("spl")
	if splTbl == nil {
		log.Error("collection is null, please init db first")
		return
	}

	var accountCache []interface{}
	for i, account := range accounts {
		// log.Debug("[%d]:account[%s] owner[%s] mint:[%s] uiAmount[%f] ",
		// 	nowTS,
		// 	account.Pubkey,
		// 	account.Account.Data.Parsed.Info.Owner,
		// 	account.Account.Data.Parsed.Info.Mint,
		// 	account.Account.Data.Parsed.Info.TokenAmount.UIAmount)
		//ID := fmt.Sprintf("%s-%s-%d", account.Account.Data.Parsed.Info.Mint, account.Pubkey, nowTS)
		account := db.SPLAccount{
			Timestamp: uint64(nowTS),
			Account:   account.Pubkey,
			Owner:     account.Account.Data.Parsed.Info.Owner,
			Mint:      account.Account.Data.Parsed.Info.Mint,
			Amount:    account.Account.Data.Parsed.Info.TokenAmount.UIAmount,
		}
		accountCache = append(accountCache, account)
		if (i > 0 && i%1000 == 0) || i == (len(accounts)-1) {
			ctx, _ := context.WithTimeout(s.ctx, 3*time.Second)
			rst, err := splTbl.InsertMany(ctx, accountCache)
			if err != nil {
				if !strings.Contains(err.Error(), "duplicate key error collection") {
					log.Error("insert Accounts i %d error: %s", i, err.Error())
					continue
				}
			} else {
				log.Info("insert  SPL Account :%d", len(rst.InsertedIDs))
			}
			accountCache = accountCache[:0]
		}

	}
	return
}
