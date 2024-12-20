# Test: `fee.url` option in LND

A serverless function project for testing the `fee.url` option in LND.  
The functions are deployed on `Vercel`: https://test-lnd-fee-url.vercel.app.

## APIs

- `/api/mempool-fees`: Mapping fee rates from mempool API:
  - `fee_by_block_target[3]`: `fastestFee`
  - `fee_by_block_target[6]`: `halfHourFee`
  - `fee_by_block_target[8]`: `hourFee`
  - `fee_by_block_target[10]`: `economyFee`
  - `min_relay_feerate`: `minimumFee`

- `/api/mempool-hill-fees`: Mapping fee rates from mempool API, it aims to lower the commit_fee as low as possible, regardless of the actual mempool fee rates, when force-close happens, the participant can bump the transaction with a CPFP transaction:
  - `fee_by_block_target[3]`: `1012`
  - `fee_by_block_target[4]`: `fastestFee`
  - `fee_by_block_target[6]`: `halfHourFee`
  - `fee_by_block_target[8]`: `hourFee`
  - `fee_by_block_target[10]`: `economyFee`
  - `min_relay_feerate`: `1012`

- `/api/mempool-min-fees`: Mapping only the `minimalFee` from mempool API, it aims to give the commitment transaction a minimal chance to be pushed in the mempool:
  - `fee_by_block_target[3]`: `minimumFee`
  - `min_relay_feerate`: `minimumFee`

- `/api/mempool-min-hill-fees`: Mapping fee rates from mempool API, it aims to provide a balance that the commit fee is not too low by using the `economyFee` as the commit fee rate, allowing force-close transactions to be stayed in the mempool without being purged immediately:
  - `fee_by_block_target[3]`: `economyFee`
  - `fee_by_block_target[4]`: `fastestFee`
  - `fee_by_block_target[6]`: `halfHourFee`
  - `fee_by_block_target[8]`: `hourFee`
  - `fee_by_block_target[10]`: `economyFee`
  - `min_relay_feerate`: `minimumFee`

- `/api/mempool-custom-hill-fees`: Mapping fee rates from mempool API, it works exactly like the `mempool-min-hill-fees` by default, but you can pass `maxCommitFeeRate` to the querystring to limit the maximum commit fee rate:
  - `fee_by_block_target[3]`: `min(economyFee, query.maxCommitFeeRate)`
  - `fee_by_block_target[4]`: `fastestFee`
  - `fee_by_block_target[6]`: `halfHourFee`
  - `fee_by_block_target[8]`: `hourFee`
  - `fee_by_block_target[10]`: `economyFee`
  - `min_relay_feerate`: `min(minimumFee, query.maxCommitFeeRate)`

- `/api/static-min-fees`: All fee rates are fixed to `1012`:
  - `fee_by_block_target[3]`: `1012`
  - `min_relay_feerate`: `1012`

## Apply fees

To apply the `fee.url` option in LND, you can edit your `lnd.conf` file and add the following line, then restart your LND node, the option should be applied in a random timeout:

```conf
fee.url=https://test-lnd-fee-url.vercel.app/api/mempool-fees
```

## Self-hosting

The project is open-source, and you can self-host it as serverless functions.

Or you can clone the project and deploy it on `Vercel`.
