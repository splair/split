package db

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

// CreateAndInitDB connect mongo and create db and collection
// then init a blocks_bitmap collection
// with blocks_n keys
func CreateAndInitDB() (err error) {
	client, err := mongo.NewClient(options.Client().ApplyURI("mongodb+srv://cz:Solong2020@cluster0.g9w77.mongodb.net/solana-spl?retryWrites=true"))
	if err != nil {
		log.Fatal(err)
	}
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	err = client.Connect(ctx)
	if err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect(ctx)

	err = client.Ping(ctx, readpref.Primary())
	if err != nil {
		log.Fatal(err)
	} else {
		log.Println("connect db success")
	}

	db := client.Database("solana-spl")
	if db == nil {
		log.Fatal("db solana-spl is null")
	}

	splTbl := db.Collection("spl")
	if splTbl != nil {
		ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
		err := splTbl.Drop(ctx)
		if err != nil {
			log.Fatal("drop collection transaction error:", err)
		}
	}
	ctx, _ = context.WithTimeout(context.Background(), 10*time.Second)
	err = db.CreateCollection(ctx, "spl")
	if err != nil {
		log.Fatal("create collection spl error:", err)
		return
	}

	log.Println("done init mongon db!")
	return
}
