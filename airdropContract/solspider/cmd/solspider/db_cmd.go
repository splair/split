package main

import (
	"github.com/spf13/cobra"
	"github.com/splair/airdrop/solspider/db"
)

var (
	_dbInitFlag bool
)

var dbCMD = &cobra.Command{
	Use:   "db",
	Short: "set mongodb",
	Long:  `set mongodb`,
	Run:   _dbMain,
}

func init() {
	dbCMD.PersistentFlags().BoolVarP(&_dbInitFlag, "init", "i", false, "create and init mongodb")

}

func _dbMain(cmd *cobra.Command, args []string) {
	if _dbInitFlag {
		db.CreateAndInitDB()
		return
	}
}
