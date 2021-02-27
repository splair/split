package main

import (
	"fmt"

	"github.com/BurntSushi/toml"
)

type configInfo struct {
	LogFile  string   `toml:"LogFile"`
	LogPath  string   `toml:"LogPath"`
	LogLevel string   `toml:"LogLevel"`
	Coins    []string `toml:"coins"`
	RPCAddrs []string `toml:"rpcs"`
}

var config configInfo

func loadConfig(fp string) (err error) {
	if _, err = toml.DecodeFile(fp, &config); err != nil {
		fmt.Printf("Decode Config Error:%s \n", err.Error())
		return
	}

	fmt.Printf("Load Config file %s Success \n", fp)
	err = nil
	return
}
