#!/bin/bash

cd "$(dirname "$0")"

#include the config file:
chmod +x config.sh
source config.sh

cd rancher-v2.4.10/

#$1 is the rancher login token

./login.sh $1


echo "Deploying IPFS"

./rancher kubectl -n $NAMESPACE apply -f ../ipfs.yaml
./rancher kubectl -n $NAMESPACE apply -f ../substrate.yaml