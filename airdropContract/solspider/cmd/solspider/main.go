package main

import (
	"fmt"

	"github.com/cz-theng/czkit-go/log"
	"github.com/spf13/cobra"
	"github.com/splair/airdrop/solspider"
)

var (
	_version    bool
	_configFile string
)

var rootCMD = &cobra.Command{
	Use:   "solspider",
	Short: "start an solspider",
	Long:  `start an solspider`,
	Run:   _main,
}

func init() {
	rootCMD.PersistentFlags().BoolVarP(&_version, "version", "v", false, "print version of solspider")
	rootCMD.PersistentFlags().StringVarP(&_configFile, "config", "c", "", "config file path for solspider")

	rootCMD.AddCommand(dbCMD)
}

func main() {
	rootCMD.Execute()
}

func dumpVersion() {
	fmt.Printf("%s\n", solspider.Version())
}

var (
	_spider solspider.Spider
)

func _main(cmd *cobra.Command, args []string) {
	if _version {
		dumpVersion()
		return
	}
	if len(_configFile) > 0 {
		if err := loadConfig(_configFile); err != nil {
			fmt.Printf("load config with %s", err.Error())
			return
		}
	} else {
		cmd.Usage()
		return
	}
	logFile := "solspider.log"
	logPath := "./"
	if len(config.LogPath) > 0 {
		logPath = config.LogPath
	}
	if len(config.LogFile) > 0 {
		logFile = config.LogFile
	}

	logNameOpt := log.WithLogName(logFile)
	logPathOpt := log.WithLogPath(logPath)
	log.Init(logNameOpt, logPathOpt)
	rpcAddrOpt := solspider.WithRPCAddrs(config.RPCAddrs)
	coinsOpt := solspider.WithCoins(config.Coins)
	err := _spider.Init(rpcAddrOpt, coinsOpt)
	if err != nil {
		log.Error("spider init error:%s", err.Error())
		return
	}
	_spider.Start()
}
