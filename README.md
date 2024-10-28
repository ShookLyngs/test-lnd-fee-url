# Test: `fee.url` option in LND

A serverless function project for testing the `fee.url` option in LND.  
The functions are deployed on `Vercel`: https://test-lnd-fee-url.vercel.app.

## APIs

- `/api/mempool-fees`: General conversion from mempool.space fee recommendations to LND acceptable fee rates. Mapping `fee_by_block_target` of `2`, `3`, `6`, `10` for `fastestFee`, `halfHourFee`, `hourFee` and `minimumFee` respectively. 

- `/api/mempool-hill-fees`: Mapping fee rates from mempool.space to LND acceptable fee rates. The `fee_by_block_target[3]` and `min_relay_feerate` are fixed to `1012`, while `4`, `6`, `8`, `10` in the `fee_by_block_target` are mapped to `fastestFee`, `halfHourFee`, `hourFee` and `minimumFee` respectively.

- `/api/mempool-min-fees`: Mapping fee rates from mempool.space to LND acceptable fee rates, but all fees are equal the `minimumFee`, including the `min_relay_feerate`.

- `/api/static-min-fees`: All fee rates are fixed to `1012`.

## Apply fees

To apply the `fee.url` option in LND, you can edit your `lnd.conf` file and add the following line, then restart your LND node, the option should be applied in a random timeout:

```conf
fee.url=https://test-lnd-fee-url.vercel.app/api/mempool-fees
```

## Self-hosting

The project is open-source, and you can self-host it as serverless functions.

Or you can clone the project and deploy it on `Vercel`.
