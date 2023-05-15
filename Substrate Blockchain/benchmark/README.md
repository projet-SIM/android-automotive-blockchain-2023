# substrate-transaction-js benchmark

Javascript client for Substrate used for benchmarks.

## Dependencies

- polkadot-api
- nodejs

## Init blockchain

```bash
#init the identities in the blockchain for renault and insurance
./init.sh
```

## Start a benchmark

```bash
#to start a benchmark give the total transaction limit and transaction per second
./benchmark.sh 10000 100
#this will send 10k transactions at a 100tx/sec rate
```


**Note**: Ignore all other files !!!