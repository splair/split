#!/usr/bin/env bash 
#nohup ./solspider -c config/config.toml &
sudo cp resolv.conf /etc/resolv.conf 
./solspider -c config/config.toml