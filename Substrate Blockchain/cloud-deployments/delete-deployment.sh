#!/bin/bash

cd "$(dirname "$0")"

#include the config file:
chmod +x config.sh
source config.sh

cd rancher-v2.4.10/

#$1 is the rancher login token

./login.sh $1


echo "Delete Deployments"
./rancher kubectl -n $NAMESPACE delete deployments --all

echo "Delete PVC"
./rancher kubectl -n $NAMESPACE delete pvc --all

echo "Delete PV"

./rancher kubectl -n $NAMESPACE get pv | awk '/substrate-/{print $1}' | xargs ./rancher kubectl -n $NAMESPACE delete pv

echo "Delete Services"
./rancher kubectl -n $NAMESPACE delete services --all

# ./rancher kubectl -n $NAMESPACE delete pv --all

echo "Done"