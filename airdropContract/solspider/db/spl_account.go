package db

type SPLAccount struct {
	Account   string  `json:"account" bson:"account"`
	Owner     string  `json:"owner" bson:"owner"`
	Mint      string  `json:"mint" bson:"mint"`
	Amount    float64 `json:"amount" bson:"amount"`
	Timestamp uint64  `json:"timestamp" bson:"timestamp"`
	//ID        string  `json:"_id" bson:"_id"`
}
