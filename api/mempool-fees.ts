import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setupMempool } from './_mempool.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { mempool } = setupMempool(req);
  const [fees, tipHash] = await Promise.all([
    mempool.bitcoin.fees.getFeesRecommended(),
    mempool.bitcoin.blocks.getBlocksTipHash(),
  ]);

  console.log(`tip-hash: ${tipHash}, fees: ${JSON.stringify(fees)}`);

  return res.json({
    "current_block_hash": tipHash,
    "fee_by_block_target": {
      "2": fees.fastestFee,
      "3": fees.halfHourFee,
      "6": fees.hourFee,
      "10": fees.minimumFee,
    },
    "min_relay_feerate": fees.minimumFee,
  });
}
