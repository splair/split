package main

import (
	"context"
	"net/http"
	"time"

	"github.com/cz-theng/czkit-go/log"

	"go.mongodb.org/mongo-driver/mongo"
	mngopts "go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

var server APIServer

type APIServer struct {
	httpd     http.Server
	router    *Router
	secTicker *time.Ticker
	ctx       context.Context
	dbClient  *mongo.Client
	db        *mongo.Database
}

func (svr *APIServer) Init() {
	svr.httpd = http.Server{
		Addr:           "0.0.0.0:10081",
		ReadTimeout:    100 * time.Second,
		WriteTimeout:   100 * time.Second,
		MaxHeaderBytes: 1 << 20,
		Handler:        svr,
	}
	svr.router = router
	svr.ctx = context.Background()

	svr.initDB()
}

func (svr *APIServer) initDB() (err error) {
	svr.dbClient, err = mongo.NewClient(mngopts.Client().ApplyURI("mongodb+srv://cz:Solong2020@cluster0.g9w77.mongodb.net/solana-spl?retryWrites=true"))
	//s.dbClient, err = mongo.NewClient(mngopts.Client().ApplyURI("mongodb://cz:Solong2020@cluster0.g9w77.mongodb.net/solana-spl?retryWrites=true"))
	if err != nil {
		log.Error("new client error: %s", err.Error())
		return
	}
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	err = svr.dbClient.Connect(ctx)
	if err != nil {
		log.Error("connect mongo error:%s", err.Error())
		return
	}

	err = svr.dbClient.Ping(ctx, readpref.Primary())
	if err != nil {
		log.Error("ping mongo error:%s", err.Error())
	} else {
		log.Info("connect mongo success")
	}

	svr.db = svr.dbClient.Database("solana-spl")
	if svr.db == nil {
		log.Error("db solana-spl is null, please init db first")
		return
	}
	return
}

func (svr *APIServer) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	svr.router.DealRaw(r.URL.Path, w, r)
}

func (svr *APIServer) Start() {
	err := svr.httpd.ListenAndServe()
	if err != nil {
		log.Error("ListenAndServe Error:%s", err.Error())
	}
}
