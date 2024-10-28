import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fromMempoolFee, setupMempool } from './_mempool.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { mempool } = setupMempool(req);
  const [fees, tipHash] = await Promise.all([
    mempool.bitcoin.fees.getFeesRecommended(),
    mempool.bitcoin.blocks.getBlocksTipHash(),
  ]);

  console.log(`tip-hash: ${tipHash}, fees: ${JSON.stringify(fees)}`);

  const minimumFee = fromMempoolFee(fees.minimumFee);
  return res.json({
    "current_block_hash": tipHash,
    "fee_by_block_target": {
      "3": minimumFee,
      "6": minimumFee,
      "10": minimumFee,
    },
    "min_relay_feerate": minimumFee,
  });
}
