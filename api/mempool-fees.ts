import type { VercelRequest, VercelResponse } from '@vercel/node';
import MempoolJS from '@cell-studio/mempool.js';
import { z } from 'zod';

const DynamicFeeQuery = z.object({
  url: z.string().default('https://cell.mempool.space'),
  network: z.enum(['mainnet', 'testnet', 'signet', 'testnet4']).default('testnet'),
});

function setup(req: VercelRequest) {
  const query = DynamicFeeQuery.parse(req.query);

  const url = new URL(query.url);
  const mempool = MempoolJS({
    hostname: url.hostname,
    network: query.network,
  });

  return {
    mempool,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { mempool } = setup(req);
  const [fees, tipHash] = await Promise.all([
    mempool.bitcoin.fees.getFeesRecommended(),
    mempool.bitcoin.blocks.getBlocksTipHash(),
  ]);

  console.log(`tip-hash: ${tipHash}, fees: ${JSON.stringify(fees)}`);

  return res.json({
    "current_block_hash": tipHash,
    "fee_by_block_target": {
      "3": 1012,
      "4": fees.fastestFee,
      "6": fees.halfHourFee,
      "8": fees.hourFee,
      "10": fees.minimumFee,
    },
    "min_relay_feerate": 1012
  });
}
