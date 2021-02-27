#!/usr/bin/env bash
step=1
  
for (( i = 0; i < 60; i=(i+step) )); do  
    cd /home/ubuntu/go_proj/src/github.com/splair/airdrop/solspider/cmd/solspider; sudo cp resolv.conf /etc/resolv.conf
    sleep $step  
done  
  
exit 0
