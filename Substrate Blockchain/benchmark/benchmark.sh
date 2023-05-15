#!/usr/bin/env bash

TOTAL_TX=$1
TX_PER_SEC=$2
THREADS=$3

cd "$(dirname "$0")"

echo "Benchmark program for Substrate JS client"

echo "----------------------------------------------------"
echo "Threads: $THREADS"
echo "Average tx/sec: $TX_PER_SEC"
echo "Total tx: $TOTAL_TX"
echo "----------------------------------------------------"

if [ "$#" -ne 3 ]; then
    echo "Illegal number of parameters"
    exit 1
fi

#include the config file:
chmod +x config.sh
source config.sh


echo "Starting..."
./bin/report_accident.js $TOTAL_TX $TX_PER_SEC $THREADS "report_accident_renault" $SUBSTRATE_URL

echo "Done benchmark"