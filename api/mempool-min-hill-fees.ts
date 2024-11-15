import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fromMempoolFee, fromRecommendedFees, setupMempool } from './_mempool.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { mempool } = setupMempool(req);
  const [mempoolFees, tipHash] = await Promise.all([
    mempool.bitcoin.fees.getFeesRecommended(),
    mempool.bitcoin.blocks.getBlocksTipHash(),
  ]);

  const fees = fromRecommendedFees(mempoolFees);
  console.log(`tip-hash: ${tipHash}, fees: ${JSON.stringify(fees)}`);

  const minimumFee = fromMempoolFee(fees.minimumFee);
  return res.json({
    "current_block_hash": tipHash,
    "fee_by_block_target": {
      "3": minimumFee,
      "4": fromMempoolFee(fees.fastestFee),
      "6": fromMempoolFee(fees.halfHourFee),
      "8": fromMempoolFee(fees.hourFee),
      "10": fromMempoolFee(fees.economyFee),
    },
    "min_relay_feerate": minimumFee,
  });
}
