package main

import (
	"context"
	"encoding/json"
	"net/http"
	"sort"
	"strconv"
	"time"

	"github.com/cz-theng/czkit-go/log"
	"go.mongodb.org/mongo-driver/bson"
)

type ADFilterHdl struct {
	URLHdl
}

//Post is POST
func (hdl *ADFilterHdl) Post(w http.ResponseWriter, r *http.Request) {
}

//Get is GET
func (hdl *ADFilterHdl) Get(w http.ResponseWriter, r *http.Request) {
	mint := r.FormValue("mint")
	startStr := r.FormValue("start")
	amountStr := r.FormValue("amount")
	log.Info("mint:%s", mint)
	log.Info("start:%s", startStr)
	log.Info("amount:%s", amountStr)

	var err error
	var startTS uint64
	var amount float64

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	encoder := json.NewEncoder(w)
	encoder.SetEscapeHTML(false)

	if len(mint) == 0 {
		encoder.Encode(map[string]string{"error": "no mint info "})
		return
	}

	splTbl := server.db.Collection("spl")
	if splTbl == nil {
		encoder.Encode(map[string]string{"error": "no spl table"})
		return
	}

	if len(startStr) > 0 {
		if startTS, err = strconv.ParseUint(startStr, 10, 64); err != nil {
			encoder.Encode(map[string]string{"error": "wrong timestamp"})
			return

		}
	}

	if len(amountStr) > 0 {
		if amount, err = strconv.ParseFloat(amountStr, 64); err != nil {
			encoder.Encode(map[string]string{"error": "wrong amount"})
			return
		}
	}

	_ = startTS
	_ = amount

	ctx, _ := context.WithTimeout(server.ctx, 60*time.Second)

	//sortStage := bson.D{{"$sort", bson.D{{"timestamp", 1}}}}
	//groupStage := bson.D{{"$group", bson.D{{"timestamp", "$timestamp"}}}}

	tses, err := splTbl.Distinct(ctx, "timestamp", bson.M{"mint": mint})
	if err != nil {
		log.Error("Find account error: %s", err.Error())
		encoder.Encode(map[string]string{"error": "Find account error"})
		return
	}
	sort.Slice(tses, func(i, j int) bool {
		ii, _ := tses[i].(int64)
		jj, _ := tses[j].(int64)
		return ii > jj
	})
	if startTS <= 0 {
		ts, _ := tses[0].(int64)
		startTS = uint64(ts)
	} else {
		ts, _ := tses[len(tses)-1].(int64)
		startTS = uint64(ts)
		for _, v := range tses {
			ts, _ := v.(int64)
			if uint64(ts) <= startTS {
				startTS = uint64(ts)
				break
			}

		}
	}

	filterCursor, err := splTbl.Find(ctx, bson.M{"mint": mint, "timestamp": startTS, "amount": bson.M{"$gte": amount}})
	if err != nil {
		log.Error("Find account error: %s", err.Error())
		encoder.Encode(map[string]string{"error": "Find account error"})
		return
	}

	var episodesFiltered []bson.M
	if err = filterCursor.All(ctx, &episodesFiltered); err != nil {
		log.Error("Find account error: %s", err.Error())
		encoder.Encode(map[string]string{"error": "Find account error"})
		return
	}
	log.Info("episodesFiltered :%d", len(episodesFiltered))

	encoder.Encode(episodesFiltered)
	return
}
