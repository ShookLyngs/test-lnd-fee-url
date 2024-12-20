import type { VercelRequest, VercelResponse } from '@vercel/node';
import { toMsatPerVb, MempoolService } from '../lib/mempool.js';
import { returnError } from '../lib/error.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const mempool = MempoolService.fromRequest(req);
    const [fees, tipHash] = await Promise.all([
      mempool.getFeesRecommended(),
      mempool.getBlocksTipHash(),
    ]);

    console.log(`tip-hash: ${tipHash}, fees: ${JSON.stringify(fees)}`);

    return res.json({
      "current_block_hash": tipHash,
      "fee_by_block_target": {
        "3": toMsatPerVb(fees.fastestFee),
        "6": toMsatPerVb(fees.halfHourFee),
        "8": toMsatPerVb(fees.hourFee),
        "10": toMsatPerVb(fees.economyFee),
      },
      "min_relay_feerate": toMsatPerVb(fees.minimumFee),
    });
  } catch (e: any) {
    returnError(res, e);
  }
}
