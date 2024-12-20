import type { VercelRequest, VercelResponse } from '@vercel/node';
import { toMsatPerVb, MempoolService } from '../lib/mempool.js';
import { z } from 'zod';

const CustomHillFeesProps = z.object({
  maxCommitFeeRate: z.coerce.number().positive().optional(),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const props = CustomHillFeesProps.parse(req.query);
    const maxCommitFeeRate = props.maxCommitFeeRate ?? Number.MAX_VALUE;
    console.log(`max-commit-fee-rate: ${maxCommitFeeRate}`);

    const mempool = MempoolService.fromRequest(req);
    const [fees, tipHash] = await Promise.all([
      mempool.getFeesRecommended(),
      mempool.getBlocksTipHash(),
    ]);

    console.log(`tip-hash: ${tipHash}, fees: ${JSON.stringify(fees)}`);

    return res.json({
      "current_block_hash": tipHash,
      "fee_by_block_target": {
        "3": toMsatPerVb(Math.min(fees.economyFee, maxCommitFeeRate)),
        "4": toMsatPerVb(fees.fastestFee),
        "6": toMsatPerVb(fees.halfHourFee),
        "8": toMsatPerVb(fees.hourFee),
        "10": toMsatPerVb(fees.economyFee),
      },
      "min_relay_feerate": toMsatPerVb(Math.min(fees.minimumFee, maxCommitFeeRate)),
    });
  } catch (e: any) {
    res.status(500).send({
      error: {
        code: e?.code ?? e.status ?? null,
        message: e?.message ?? 'internal server error',
      },
    });
    throw e;
  }
}
