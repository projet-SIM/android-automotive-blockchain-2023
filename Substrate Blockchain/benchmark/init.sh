#!/usr/bin/env bash

cd "$(dirname "$0")"


#include the config file:
chmod +x config.sh
source config.sh

#first create car & drivers, factories
./bin/genAccounts.js $1 $2 #10000 50 #5000 10 #5000 cars and drivers, 10 factories

echo "Start init..."
sleep 1

################## Init renault chain

echo "Send init_factories..."
./bin/renault/init_factories.js $SUBSTRATE_URL

echo "Wait block finalised"
sleep 30

echo "Send init_createVehicles..."
./bin/renault/init_createVehicles.js $SUBSTRATE_URL

echo "Wait block finalised"
sleep 30

echo "Send init_initVehicles..."
./bin/renault/init_initVehicles.js $SUBSTRATE_URL
