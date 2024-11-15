import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fromMempoolFee, fromRecommendedFees, setupMempool } from './_mempool.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { mempool } = setupMempool(req);
  const [fees, tipHash] = await Promise.all([
    mempool.bitcoin.fees.getFeesRecommended(),
    mempool.bitcoin.blocks.getBlocksTipHash(),
  ]);

  const fullFees = fromRecommendedFees(fees);
  console.log(`tip-hash: ${tipHash}, fees: ${JSON.stringify(fullFees)}`);

  return res.json({
    "current_block_hash": tipHash,
    "fee_by_block_target": {
      "3": 1012,
      "4": fromMempoolFee(fees.fastestFee),
      "6": fromMempoolFee(fees.halfHourFee),
      "8": fromMempoolFee(fees.hourFee),
      "10": fromMempoolFee(fullFees.economyFee),
    },
    "min_relay_feerate": 1012
  });
}
