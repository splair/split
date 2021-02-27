package main

import (
	"github.com/cz-theng/czkit-go/log"
)

func main() {
	log.Init(log.WithLogPath("./"), log.WithLogName("adfilter.log"), log.WithConsole(false))
	server.Init()
	server.Start()

	return
}
